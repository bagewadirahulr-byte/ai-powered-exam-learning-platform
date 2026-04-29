import { NextResponse } from 'next/server';

// ============================================
// Gemini TTS Route — Direct REST API
// Uses Gemini's native audio generation (FREE tier)
// Supports: English, Hindi, Kannada, Tamil, Telugu, Malayalam, Urdu
// ============================================

// Model chain — try dedicated TTS model first, then general flash model
const TTS_MODEL_CHAIN = [
  'gemini-2.5-flash-preview-tts',
  'gemini-2.0-flash',
];

const MAX_TEXT_LENGTH = 8_000;
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 1500;

// Supported languages
const ALLOWED_LANGUAGES = [
  'english', 'kannada', 'hindi', 'urdu', 'tamil', 'telugu', 'malayalam',
];

// Language display names for the prompt instruction
const LANGUAGE_NAMES: Record<string, string> = {
  english: 'English',
  hindi: 'Hindi (हिन्दी)',
  kannada: 'Kannada (ಕನ್ನಡ)',
  tamil: 'Tamil (தமிழ்)',
  telugu: 'Telugu (తెలుగు)',
  malayalam: 'Malayalam (മലയാളം)',
  urdu: 'Urdu (اردو)',
};

// Gemini prebuilt voice — Kore works well across languages
const VOICE_NAME = 'Kore';

/**
 * Helper: exponential backoff delay.
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper: check if error is retryable (503/429).
 */
function isRetryable(msg: string): boolean {
  const lower = msg.toLowerCase();
  return (
    lower.includes('503') ||
    lower.includes('429') ||
    lower.includes('service unavailable') ||
    lower.includes('resource exhausted') ||
    lower.includes('overloaded') ||
    lower.includes('quota')
  );
}

/**
 * Helper: check if model not found (404).
 */
function isNotFound(msg: string): boolean {
  return msg.includes('404') || msg.includes('not found') || msg.includes('not supported');
}

/**
 * Creates a WAV header for raw PCM audio data.
 */
function createWavHeader(dataLength: number, sampleRate: number, numChannels: number, bitsPerSample: number): Buffer {
  const buffer = Buffer.alloc(44);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);
  return buffer;
}

/**
 * Call Gemini REST API directly for TTS audio generation.
 * Bypasses the SDK to ensure responseModalities and speechConfig are sent correctly.
 */
async function callGeminiTTS(
  apiKey: string,
  modelName: string,
  text: string,
  language: string
): Promise<{ audioBuffer: Buffer; mimeType: string }> {
  const langName = LANGUAGE_NAMES[language] || 'English';

  // Build the prompt — instruct the model to read in the target language
  const prompt = language === 'english'
    ? text
    : `Read the following text aloud clearly in ${langName}:\n\n${text}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: VOICE_NAME,
          },
        },
      },
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API ${response.status}: ${errText.slice(0, 300)}`);
  }

  const data = await response.json();

  // Extract audio from the response
  const candidate = data.candidates?.[0];
  if (!candidate?.content?.parts) {
    throw new Error('No content in Gemini response');
  }

  const audioPart = candidate.content.parts.find(
    (p: { inlineData?: { data: string; mimeType: string } }) => p.inlineData
  );

  if (!audioPart?.inlineData) {
    // Check if response has text instead of audio (model doesn't support audio)
    const textPart = candidate.content.parts.find(
      (p: { text?: string }) => p.text
    );
    if (textPart) {
      throw new Error('Model returned text instead of audio — not supported for TTS');
    }
    throw new Error('No audio data in Gemini response');
  }

  const audioBuffer = Buffer.from(audioPart.inlineData.data, 'base64');
  const mimeType = audioPart.inlineData.mimeType || 'audio/pcm';

  if (audioBuffer.length < 100) {
    throw new Error('Audio response too small');
  }

  return { audioBuffer, mimeType };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, language } = body;

    const requestedLang = (language || 'english').toLowerCase();

    // Language validation
    if (!ALLOWED_LANGUAGES.includes(requestedLang)) {
      return NextResponse.json(
        {
          error: 'Unsupported language for audio generation.',
          details: `Supported: ${ALLOWED_LANGUAGES.join(', ')}. Received: "${language}"`,
        },
        { status: 400 }
      );
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text content is required' }, { status: 400 });
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json({ error: `Text too long. Max ${MAX_TEXT_LENGTH} chars.` }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    let lastError: string = '';

    // Try each model in the chain with retry logic
    for (const modelName of TTS_MODEL_CHAIN) {
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          console.log(`[TTS] Trying ${modelName} (attempt ${attempt + 1}), lang: ${requestedLang}, text: ${text.length} chars`);

          const { audioBuffer, mimeType } = await callGeminiTTS(apiKey, modelName, text, requestedLang);

          console.log(`[TTS] ✅ Success with ${modelName}: ${audioBuffer.length} bytes, mimeType: ${mimeType}`);

          // If the response is already a playable format, serve directly
          if (mimeType.includes('wav') || mimeType.includes('mp3') || mimeType.includes('mpeg') || mimeType.includes('ogg')) {
            return new NextResponse(new Uint8Array(audioBuffer), {
              status: 200,
              headers: {
                'Content-Type': mimeType,
                'Content-Length': audioBuffer.length.toString(),
                'Cache-Control': 'public, max-age=3600',
                'X-TTS-Model': modelName,
                'X-TTS-Language': requestedLang,
              },
            });
          }

          // Raw PCM — wrap in WAV header for browser playback
          let sampleRate = 24000;
          let channels = 1;
          const bitsPerSample = 16;

          if (mimeType) {
            const rateMatch = mimeType.match(/rate=(\d+)/);
            if (rateMatch) sampleRate = parseInt(rateMatch[1]);
            const channelMatch = mimeType.match(/channels?=(\d+)/);
            if (channelMatch) channels = parseInt(channelMatch[1]);
          }

          const wavHeader = createWavHeader(audioBuffer.length, sampleRate, channels, bitsPerSample);
          const finalBuffer = Buffer.concat([wavHeader, audioBuffer]);

          console.log(`[TTS] Serving WAV: ${finalBuffer.length} bytes (${sampleRate}Hz, ${channels}ch)`);

          return new NextResponse(new Uint8Array(finalBuffer), {
            status: 200,
            headers: {
              'Content-Type': 'audio/wav',
              'Content-Length': finalBuffer.length.toString(),
              'Cache-Control': 'public, max-age=3600',
              'X-TTS-Model': modelName,
              'X-TTS-Language': requestedLang,
            },
          });

        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          lastError = msg;

          // Retryable error (429/503) — backoff and retry
          if (isRetryable(msg) && attempt < MAX_RETRIES) {
            const delay = BASE_DELAY_MS * Math.pow(2, attempt);
            console.warn(`[TTS] ${modelName} retryable error. Retrying in ${delay}ms...`);
            await sleep(delay);
            continue;
          }

          // Model not found or doesn't support audio — skip to next model
          if (isNotFound(msg) || msg.includes('not supported')) {
            console.warn(`[TTS] ${modelName} not available for TTS. Trying next model...`);
            break;
          }

          // Retryable but exhausted retries — try next model
          if (isRetryable(msg)) {
            console.warn(`[TTS] ${modelName} exhausted retries. Trying next model...`);
            break;
          }

          // Non-retryable error — try next model
          console.error(`[TTS] ${modelName} error: ${msg}`);
          break;
        }
      }
    }

    // All models failed
    console.error(`[TTS] ❌ All models failed. Last error: ${lastError}`);
    return NextResponse.json(
      { error: 'Audio generation failed. Please try again.', details: lastError },
      { status: 500 }
    );

  } catch (error: unknown) {
    console.error('[TTS] Unhandled error:', error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'TTS Generation Failed', details },
      { status: 500 }
    );
  }
}
