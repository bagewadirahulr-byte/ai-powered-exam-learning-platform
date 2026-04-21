import { NextResponse } from 'next/server';
import { EdgeTTS } from 'node-edge-tts';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as os from 'os';

// Map internal languages to Microsoft Edge Neural voices
const EDGE_VOICE_MAP: Record<string, { lang: string, voice: string }> = {
  english: { lang: 'en-IN', voice: 'en-IN-NeerjaNeural' },
  hindi: { lang: 'hi-IN', voice: 'hi-IN-SwaraNeural' }, 
  urdu: { lang: 'ur-IN', voice: 'ur-IN-GulNeural' }, 
  kannada: { lang: 'kn-IN', voice: 'kn-IN-SapnaNeural' },
  tamil: { lang: 'ta-IN', voice: 'ta-IN-PallaviNeural' },
  telugu: { lang: 'te-IN', voice: 'te-IN-ShrutiNeural' },
  malayalam: { lang: 'ml-IN', voice: 'ml-IN-SobhanaNeural' },
};

export async function POST(req: Request) {
  try {
    const { text, language } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const normalizedLang = (language || "english").toLowerCase();
    
    // Fallback logic
    let voiceConfig = EDGE_VOICE_MAP[normalizedLang];
    let fallbackUsed = false;

    if (!voiceConfig) {
      console.warn(`[TTS API] Language ${normalizedLang} not natively mapped. Falling back to English.`);
      voiceConfig = EDGE_VOICE_MAP['english'];
      fallbackUsed = true;
    }

    console.log(`[TTS API] Generating Zero-Cost Edge TTS for language: ${normalizedLang}, voice: ${voiceConfig.voice}`);

    const edgeTTS = new EdgeTTS({
      voice: voiceConfig.voice,
      lang: voiceConfig.lang,
      outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
    });

    // Create a temporary file path
    const tmpFilePath = path.join(os.tmpdir(), `${crypto.randomUUID()}.mp3`);

    // Generate audio and write to temp file
    await edgeTTS.ttsPromise(text, tmpFilePath);

    // Read the file back into a buffer
    const audioBuffer = fs.readFileSync(tmpFilePath);
    
    // Clean up the temp file asynchronously
    fs.promises.unlink(tmpFilePath).catch(err => console.error("Failed to delete temp TTS file:", err));

    const base64Audio = audioBuffer.toString('base64');

    return NextResponse.json({
      audioContent: base64Audio,
      fallbackUsed,
      voice: voiceConfig.voice
    });

  } catch (error) {
    console.error('[TTS API] Server Error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
