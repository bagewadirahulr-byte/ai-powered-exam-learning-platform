import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// We use the specific TTS preview model as requested for audio generation
const TTS_MODEL = 'gemini-3.1-flash-tts-preview';

// Maximum text length to prevent excessively long audio generation
const MAX_TEXT_LENGTH = 10_000;

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, language } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text content is required' }, { status: 400 });
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json({ error: `Text too long. Max ${MAX_TEXT_LENGTH} chars.` }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: TTS_MODEL });

    console.log(`[TTS] Requesting Gemini TTS for language: ${language}, text length: ${text.length}`);

    // Just pass the raw text. Gemini TTS will figure out the language from the text content.
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: text }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Aoede', // Clear, versatile prebuilt voice
            }
          }
        }
      } as any // Bypass TS error for new features
    });

    const response = result.response;
    const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    if (!audioPart || !audioPart.inlineData) {
      console.error("[TTS] No audio returned from Gemini. Parts:", JSON.stringify(response.candidates?.[0]?.content?.parts));
      return NextResponse.json({ error: 'Failed to generate audio from AI.' }, { status: 500 });
    }

    const pcmBuffer = Buffer.from(audioPart.inlineData.data, 'base64');
    
    // Gemini 3.1 TTS preview returns 24000Hz 16-bit mono PCM by default (audio/l16; rate=24000; channels=1)
    const wavHeader = createWavHeader(pcmBuffer.length, 24000, 1, 16);
    const finalBuffer = Buffer.concat([wavHeader, pcmBuffer]);

    console.log(`[TTS] Successfully generated ${finalBuffer.length} bytes of WAV audio.`);

    return new NextResponse(finalBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': finalBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
        'X-TTS-Source': 'gemini-3.1-flash-tts',
      },
    });

  } catch (error: any) {
    console.error('[TTS] Error:', error);
    return NextResponse.json(
      { error: 'TTS Generation Failed', details: error.message || String(error) },
      { status: 500 }
    );
  }
}
