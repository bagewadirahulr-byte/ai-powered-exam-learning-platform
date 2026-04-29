import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';

interface ExtendedGenerationConfig extends GenerationConfig {
  responseModalities?: string[];
  speechConfig?: {
    voiceConfig?: {
      prebuiltVoiceConfig?: {
        voiceName?: string;
      };
    };
  };
}

// ============================================
// Gemini TTS Route — Audio Generation Engine
// Uses the SAME Gemini API as content generation
// Retry logic with model fallback chain
// ============================================

// Gemini models that support TTS via responseModalities: ['AUDIO']
// Strictly using free-tier models (Flash series) to prevent billing costs
const TTS_MODEL_CHAIN = ['gemini-2.5-flash', 'gemini-2.0-flash'];

const MAX_TEXT_LENGTH = 10_000;
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 1500;

// Language-to-voice mapping for best multilingual TTS quality
// These are Gemini's prebuilt neural voices
const VOICE_MAP: Record<string, string> = {
  english: 'Kore',
  hindi: 'Kore',
  kannada: 'Kore',
  tamil: 'Kore',
  telugu: 'Kore',
  malayalam: 'Kore',
  urdu: 'Kore',
};

/**
 * Helper: delays execution (exponential backoff).
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper: checks if an error is a retryable API error (503/429).
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('503') ||
      msg.includes('429') ||
      msg.includes('service unavailable') ||
      msg.includes('resource exhausted') ||
      msg.includes('high demand') ||
      msg.includes('overloaded')
    );
  }
  return false;
}

/**
 * Helper: checks if a model might not exist (404 error).
 */
function isNotFoundError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('404 Not Found') || error.message.includes('is not found for API version');
  }
  return false;
}

/**
 * Creates a standard WAV header for raw PCM audio.
 */
function createWavHeader(dataLength: number, sampleRate: number, numChannels: number, bitsPerSample: number): Buffer {
  const buffer = Buffer.alloc(44);

  // "RIFF"
  buffer.write('RIFF', 0);
  // file length - 8
  buffer.writeUInt32LE(36 + dataLength, 4);
  // "WAVE"
  buffer.write('WAVE', 8);
  // "fmt " chunk
  buffer.write('fmt ', 12);
  // fmt chunk length (16)
  buffer.writeUInt32LE(16, 16);
  // format (1 = PCM)
  buffer.writeUInt16LE(1, 20);
  // channels
  buffer.writeUInt16LE(numChannels, 22);
  // sample rate
  buffer.writeUInt32LE(sampleRate, 24);
  // byte rate (sampleRate * channels * bytesPerSample)
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
  // block align (channels * bytesPerSample)
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
  // bits per sample
  buffer.writeUInt16LE(bitsPerSample, 34);
  // "data" chunk
  buffer.write('data', 36);
  // data length
  buffer.writeUInt32LE(dataLength, 40);

  return buffer;
}

const ALLOWED_LANGUAGES = [
  'english',
  'kannada',
  'hindi',
  'urdu',
  'tamil',
  'telugu',
  'malayalam'
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, language } = body;

    const requestedLang = (language || 'english').toLowerCase();

    // STRICT LANGUAGE ENFORCEMENT
    if (!ALLOWED_LANGUAGES.includes(requestedLang)) {
      return NextResponse.json(
        { 
          error: 'Unsupported language for audio generation.',
          details: `Audio is strictly limited to: ${ALLOWED_LANGUAGES.join(', ')}. Received: ${language}`
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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const voiceName = VOICE_MAP[requestedLang] || 'Kore';

    let lastError: unknown = null;

    // Try each model in the chain with retry logic (same pattern as content generation)
    for (const modelName of TTS_MODEL_CHAIN) {
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          console.log(`[TTS] Trying ${modelName} (attempt ${attempt + 1}), lang: ${language}, voice: ${voiceName}, text: ${text.length} chars`);

          const model = genAI.getGenerativeModel({ model: modelName });

          const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: text }] }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: voiceName,
                  },
                },
              },
            } as ExtendedGenerationConfig, // Bypass TS strictness for newer API features
          });

          const response = result.response;
          const audioPart = response.candidates?.[0]?.content?.parts?.find(
            (p: { inlineData?: { data: string; mimeType: string } }) => p.inlineData
          );

          if (!audioPart || !audioPart.inlineData) {
            console.error(`[TTS] No audio returned from ${modelName}. Parts:`, JSON.stringify(response.candidates?.[0]?.content?.parts));
            throw new Error('No audio data in Gemini response');
          }

          const { data, mimeType } = audioPart.inlineData;
          const audioBuffer = Buffer.from(data, 'base64');

          console.log(`[TTS] Got ${audioBuffer.length} bytes, mimeType: ${mimeType}`);

          // If Gemini returns a complete audio format (wav, mp3, ogg), serve directly
          if (mimeType && (mimeType.includes('wav') || mimeType.includes('mp3') || mimeType.includes('mpeg') || mimeType.includes('ogg'))) {
            console.log(`[TTS] Serving complete ${mimeType} audio (${audioBuffer.length} bytes)`);
            return new NextResponse(audioBuffer, {
              status: 200,
              headers: {
                'Content-Type': mimeType,
                'Content-Length': audioBuffer.length.toString(),
                'Cache-Control': 'public, max-age=3600',
                'X-TTS-Source': `gemini-${modelName}`,
              },
            });
          }

          // Raw PCM — parse sample rate from mimeType if available
          // e.g., "audio/pcm;rate=24000" or "audio/L16;rate=24000;channels=1"
          let sampleRate = 24000; // Gemini default
          let channels = 1;
          const bitsPerSample = 16;

          if (mimeType) {
            const rateMatch = mimeType.match(/rate=(\d+)/);
            if (rateMatch) sampleRate = parseInt(rateMatch[1]);
            const channelMatch = mimeType.match(/channels?=(\d+)/);
            if (channelMatch) channels = parseInt(channelMatch[1]);
          }

          // Wrap raw PCM in a WAV header so browsers can play it
          const wavHeader = createWavHeader(audioBuffer.length, sampleRate, channels, bitsPerSample);
          const finalBuffer = Buffer.concat([wavHeader, audioBuffer]);

          console.log(`[TTS] Serving WAV audio: ${finalBuffer.length} bytes (${sampleRate}Hz, ${channels}ch, ${bitsPerSample}bit)`);

          return new NextResponse(finalBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'audio/wav',
              'Content-Length': finalBuffer.length.toString(),
              'Cache-Control': 'public, max-age=3600',
              'X-TTS-Source': `gemini-${modelName}`,
            },
          });

        } catch (error) {
          lastError = error;

          if (isRetryableError(error) && attempt < MAX_RETRIES) {
            const delay = BASE_DELAY_MS * Math.pow(2, attempt);
            console.warn(`[TTS] ${modelName} retryable error. Retrying in ${delay}ms...`);
            await sleep(delay);
            continue;
          }

          if (isRetryableError(error) || isNotFoundError(error)) {
            console.warn(`[TTS] ${modelName} exhausted retries or not found. Trying next model...`);
            break; // Try next model in chain
          }

          throw error; // Non-retryable error — throw immediately
        }
      }
    }

    // All models failed
    const errorMsg = lastError instanceof Error ? lastError.message : String(lastError);
    console.error(`[TTS] All models failed. Last error: ${errorMsg}`);
    return NextResponse.json(
      { error: 'TTS generation failed. AI service temporarily unavailable.', details: errorMsg },
      { status: 500 }
    );

  } catch (error: unknown) {
    console.error('[TTS] Error:', error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'TTS Generation Failed', details },
      { status: 500 }
    );
  }
}
