import { NextResponse } from 'next/server';
import { EdgeTTS } from 'node-edge-tts';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as os from 'os';

// Precise Voice Mapping as per requirements
const VOICE_MAP: Record<string, { lang: string, voice: string }> = {
  english: { lang: 'en-IN', voice: 'en-IN-NeerjaNeural' },
  hindi: { lang: 'hi-IN', voice: 'hi-IN-SwaraNeural' }, 
  urdu: { lang: 'ur-IN', voice: 'ur-IN-GulNeural' }, 
  kannada: { lang: 'kn-IN', voice: 'kn-IN-GaganNeural' },
  tamil: { lang: 'ta-IN', voice: 'ta-IN-PallaviNeural' },
  telugu: { lang: 'te-IN', voice: 'te-IN-ShrutiNeural' },
  malayalam: { lang: 'ml-IN', voice: 'ml-IN-SobhanaNeural' },
};

// Helper to chunk long text to prevent Edge TTS Websocket timeouts
function chunkText(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = start + maxLength;
    if (end >= text.length) {
      chunks.push(text.slice(start).trim());
      break;
    }
    // Try to find a good breaking point
    let breakPoint = text.lastIndexOf('\n', end);
    if (breakPoint <= start) breakPoint = text.lastIndexOf('.', end);
    if (breakPoint <= start) breakPoint = text.lastIndexOf(' ', end);
    // Force break if no good point found
    if (breakPoint <= start) breakPoint = end;
    
    chunks.push(text.slice(start, breakPoint + 1).trim());
    start = breakPoint + 1;
  }
  return chunks.filter(c => c.length > 0);
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID().substring(0, 8);
  
  try {
    const { text, language } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text content is empty" }, { status: 400 });
    }

    const normalizedLang = (language || "english").toLowerCase();
    const voiceConfig = VOICE_MAP[normalizedLang] || VOICE_MAP['english'];
    
    console.log(`[TTS API][${requestId}] Request: lang=${normalizedLang}, textLength=${text.length}`);

    const chunks = chunkText(text, 1500); // Edge TTS starts timing out around 2000-3000 chars
    console.log(`[TTS API][${requestId}] Processing ${chunks.length} chunks...`);

    const audioBuffers: Buffer[] = [];

    // Process chunks sequentially to respect rate limits and memory
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const tmpFilePath = path.join(os.tmpdir(), `tts-${requestId}-chunk-${i}.mp3`);
      
      try {
        const tts = new EdgeTTS({
          voice: voiceConfig.voice,
          lang: voiceConfig.lang,
          outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
        });

        await tts.ttsPromise(chunk, tmpFilePath);

        if (fs.existsSync(tmpFilePath)) {
          audioBuffers.push(fs.readFileSync(tmpFilePath));
          fs.unlinkSync(tmpFilePath);
        } else {
          throw new Error("Temporary file was not created by the TTS engine.");
        }
      } catch (err: any) {
        console.error(`[TTS API][${requestId}] Error on chunk ${i}:`, err);
        // Clean up on failure
        if (fs.existsSync(tmpFilePath)) fs.unlinkSync(tmpFilePath);
        
        // Rethrow proper error string or message
        throw new Error(typeof err === 'string' ? err : (err.message || "Unknown Error"));
      }
    }

    if (audioBuffers.length === 0) {
      throw new Error("Failed to generate audio content across all chunks.");
    }

    // Combine all MP3 buffers into a single continuous file
    const finalBuffer = Buffer.concat(audioBuffers);
    console.log(`[TTS API][${requestId}] Success: Combined ${audioBuffers.length} chunks, ${finalBuffer.length} bytes`);

    return NextResponse.json({
      audioContent: finalBuffer.toString('base64'),
      voice: voiceConfig.voice,
      format: 'mp3',
      chunksProcessed: chunks.length
    });

  } catch (error: any) {
    console.error(`[TTS API][${requestId}] Failure:`, error);
    return NextResponse.json({ 
      error: "TTS Generation Failed", 
      details: typeof error === 'string' ? error : error.message 
    }, { status: 500 });
  }
}
