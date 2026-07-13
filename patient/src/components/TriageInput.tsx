import React, { useState, useRef, useEffect } from 'react';

interface TriageInputProps {
  onBack: () => void;
  onResult: (result: {
    severity: 'CRITICAL' | 'MEDIUM' | 'LOW';
    summary: string;
    probable_condition: string;
    action_required: string;
    symptoms: string;
  }) => void;
}

const QUICK_PHRASES = [
  { en: 'Chest pain & breathlessness', emoji: '💔' },
  { en: 'High fever & chills', emoji: '🌡️' },
  { en: 'Severe headache', emoji: '🤕' },
  { en: 'Uncontrolled bleeding', emoji: '🩸' },
  { en: 'Unconscious / not responding', emoji: '😵' },
  { en: 'Snake bite / poisoning', emoji: '🐍' },
  { en: 'Road accident / injury', emoji: '🚗' },
  { en: 'Stroke symptoms', emoji: '🧠' },
];

type RecordingState = 'idle' | 'recording' | 'transcribing' | 'done' | 'error';

export default function TriageInput({ onBack, onResult }: TriageInputProps) {
  const [symptoms, setSymptoms] = useState('');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [detectedLang, setDetectedLang] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Recording timer
  useEffect(() => {
    if (recordingState === 'recording') {
      timerRef.current = setInterval(() => setRecordingDuration((d) => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingState !== 'recording') setRecordingDuration(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [recordingState]);

  const formatDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const startRecording = async () => {
    setStatusMsg('');
    setDetectedLang('');
    chunksRef.current = [];

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch {
      setStatusMsg('Microphone access denied. Please allow microphone in browser settings.');
      setRecordingState('error');
      return;
    }

    // Prefer webm/opus — widely supported; fallback to whatever browser supports
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : '';

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      stopStreamTracks();
      sendToWhisper();
    };

    recorder.start(250); // collect in 250ms chunks
    setRecordingState('recording');
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const stopStreamTracks = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const sendToWhisper = async () => {
    if (chunksRef.current.length === 0) {
      setStatusMsg('No audio captured. Please try again.');
      setRecordingState('error');
      return;
    }

    setRecordingState('transcribing');
    setStatusMsg('Sending audio to Whisper AI…');

    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    // Give the file a proper extension so backend can detect format
    formData.append('audio', blob, 'recording.webm');

    try {
      const res = await fetch('http://127.0.0.1:5000/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Transcription failed');
      }

      const data = await res.json();
      const text = data.transcript || '';
      const lang = data.detected_language || '';

      if (!text) {
        setStatusMsg('No speech detected. Please speak clearly and try again.');
        setRecordingState('error');
        return;
      }

      setSymptoms((prev) => (prev ? `${prev} ${text}` : text).trim());
      setDetectedLang(lang);
      setStatusMsg('');
      setRecordingState('done');
    } catch (err: any) {
      console.error('Whisper error:', err);
      setStatusMsg(`Transcription error: ${err.message}. Is the Flask backend running?`);
      setRecordingState('error');
    }
  };

  const handleAnalyze = async () => {
    const text = symptoms.trim();
    if (!text) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: text, original_language: detectedLang || 'English' }),
      });
      const data = await res.json();
      onResult({ ...data, symptoms: text });
    } catch {
      // Offline keyword fallback
      const lower = text.toLowerCase();
      let severity: 'CRITICAL' | 'MEDIUM' | 'LOW' = 'LOW';
      if (lower.match(/chest|heart|cardiac|stroke|unconscious|bleed|breath|snake|accident|seizure/)) severity = 'CRITICAL';
      else if (lower.match(/fever|vomit|burn|fracture|pain|dizzy|faint|dengue|malaria/)) severity = 'MEDIUM';
      onResult({
        severity,
        summary: `Offline assessment for: "${text}". Backend unreachable.`,
        probable_condition: severity === 'CRITICAL' ? 'Possible Emergency' : severity === 'MEDIUM' ? 'Moderate Condition' : 'Minor Ailment',
        action_required: severity === 'CRITICAL' ? 'Call 112 immediately.' : severity === 'MEDIUM' ? 'Visit hospital within an hour.' : 'Visit a clinic.',
        symptoms: text,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- UI helpers ---
  const micLabel = {
    idle: 'Tap to record voice',
    recording: 'Recording… tap to stop',
    transcribing: 'Transcribing with Whisper…',
    done: 'Tap to record again',
    error: 'Tap to retry',
  }[recordingState];

  const micBg = {
    idle: 'bg-[#0cd8d8] shadow-[0_8px_20px_rgba(12,216,216,0.3)]',
    recording: 'bg-[#ef4444] shadow-[0_0_30px_rgba(239,68,68,0.4)]',
    transcribing: 'bg-[#f59e0b] shadow-[0_8px_20px_rgba(245,158,11,0.3)]',
    done: 'bg-[#22c55e] shadow-[0_8px_20px_rgba(34,197,94,0.3)]',
    error: 'bg-[#ef4444] shadow-[0_8px_20px_rgba(239,68,68,0.2)]',
  }[recordingState];

  const micIcon = {
    idle: 'mic',
    recording: 'stop_circle',
    transcribing: 'hourglass_top',
    done: 'check_circle',
    error: 'mic_off',
  }[recordingState];

  const handleMicClick = () => {
    if (recordingState === 'recording') stopRecording();
    else if (recordingState !== 'transcribing') startRecording();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafb] font-['Inter',sans-serif] antialiased">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-10 pb-5">
        <button
          onClick={onBack}
          className="h-10 w-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition"
        >
          <span className="material-symbols-outlined text-[22px] text-slate-600">arrow_back</span>
        </button>
        <div className="flex-1">
          <h1 className="text-[19px] font-extrabold text-[#1e293b] leading-tight">Emergency Triage</h1>
          <p className="text-[11px] text-[#94a3b8] font-medium">Speak in any language · Powered by Whisper AI</p>
        </div>
        <div className="flex items-center gap-1.5 bg-[#fef2f2] px-3 py-1.5 rounded-full border border-[#fecaca]">
          <span className="h-2 w-2 rounded-full bg-[#ef4444] animate-pulse inline-block"></span>
          <span className="text-[11px] font-bold text-[#ef4444] uppercase tracking-wide">SOS</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-5 gap-5 pb-44">

        {/* Whisper Info Banner */}
        <div className="flex items-start gap-3 bg-white border border-slate-100 rounded-[18px] px-4 py-3 shadow-sm">
          <div className="h-8 w-8 rounded-full bg-[#e6f8f7] flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[#0cd8d8] text-[18px]">language</span>
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#1e293b]">Multilingual Voice — Any Language</p>
            <p className="text-[11px] text-[#94a3b8] font-medium leading-relaxed mt-0.5">
              Speak in Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, English, or any other language. Whisper auto-detects and transcribes.
            </p>
          </div>
        </div>

        {/* Voice Recorder Card */}
        <div className={`w-full rounded-[24px] p-6 flex flex-col items-center gap-5 transition-all duration-300 border ${
          recordingState === 'recording' ? 'bg-[#fff5f5] border-[#fecaca]'
          : recordingState === 'done' ? 'bg-[#f0fdf4] border-[#bbf7d0]'
          : recordingState === 'transcribing' ? 'bg-[#fffbeb] border-[#fde68a]'
          : 'bg-white border-slate-100 shadow-sm'
        }`}>

          <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">
            {micLabel}
          </p>

          {/* Mic Button */}
          <button
            onClick={handleMicClick}
            disabled={recordingState === 'transcribing'}
            className={`relative h-[96px] w-[96px] rounded-full flex items-center justify-center transition-all duration-300 ${micBg} ${
              recordingState === 'transcribing' ? 'cursor-not-allowed opacity-80 animate-pulse' : 'hover:scale-105 active:scale-95'
            }`}
          >
            {recordingState === 'recording' && (
              <>
                <span className="absolute inset-0 rounded-full bg-[#ef4444] animate-ping opacity-20"></span>
                <span className="absolute inset-[-10px] rounded-full border-2 border-[#fecaca] animate-pulse"></span>
              </>
            )}
            <span className="material-symbols-outlined text-white text-[42px] fill-1 font-variation-settings-fill relative z-10">
              {micIcon}
            </span>
          </button>

          {/* Recording timer */}
          {recordingState === 'recording' && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-[#ef4444] font-bold text-[16px] tabular-nums">
                {formatDuration(recordingDuration)}
              </span>
              <div className="flex gap-[3px] items-end h-7">
                {[2, 5, 8, 4, 7, 3, 9, 5, 6, 3, 8, 4, 7, 3].map((h, i) => (
                  <div
                    key={i}
                    className="w-[3px] bg-[#ef4444] rounded-full"
                    style={{
                      height: `${h * 3}px`,
                      animation: `soundwave ${0.4 + (i % 4) * 0.1}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.06}s`,
                    }}
                  />
                ))}
              </div>
              <p className="text-[11px] text-[#94a3b8] font-medium">Tap the button again to stop</p>
            </div>
          )}

          {/* Transcribing spinner */}
          {recordingState === 'transcribing' && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-2 items-center">
                <svg className="animate-spin h-4 w-4 text-[#f59e0b]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span className="text-[12px] font-bold text-[#92400e]">Whisper is transcribing your audio…</span>
              </div>
              <p className="text-[11px] text-[#94a3b8] text-center">This may take 5–15 seconds depending on audio length</p>
            </div>
          )}

          {/* Success badge */}
          {recordingState === 'done' && detectedLang && (
            <div className="flex items-center gap-2 bg-[#dcfce7] px-3 py-1.5 rounded-full border border-[#bbf7d0]">
              <span className="material-symbols-outlined text-[#22c55e] text-[14px]">check_circle</span>
              <span className="text-[11px] font-bold text-[#166534]">
                Transcribed · Detected language: <span className="capitalize">{detectedLang}</span>
              </span>
            </div>
          )}

          {/* Error */}
          {(recordingState === 'error' || statusMsg) && (
            <p className="text-[11px] text-[#ef4444] text-center font-medium max-w-[240px] leading-relaxed">
              {statusMsg}
            </p>
          )}
        </div>

        {/* Transcribed text editor */}
        <div className="w-full bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-slate-50">
            <span className="material-symbols-outlined text-[#0cd8d8] text-[16px]">edit_note</span>
            <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">
              {symptoms ? 'Transcribed text — edit if needed' : 'Or type symptoms in English'}
            </p>
          </div>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={4}
            placeholder="Symptoms will appear here after recording, or type them directly…"
            className="w-full p-4 text-[14px] text-[#1e293b] placeholder:text-[#94a3b8] bg-transparent border-0 resize-none focus:outline-none focus:ring-0 leading-relaxed"
          />
          <div className="flex items-center justify-between px-4 py-2 border-t border-slate-50">
            <span className="text-[10px] text-[#94a3b8]">{symptoms.length} characters</span>
            {symptoms && (
              <button
                onClick={() => { setSymptoms(''); setRecordingState('idle'); setDetectedLang(''); }}
                className="text-[11px] text-[#ef4444] font-bold hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest">Quick select</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* Quick Phrases */}
        <div className="flex flex-wrap gap-2">
          {QUICK_PHRASES.map((p) => (
            <button
              key={p.en}
              onClick={() => setSymptoms((prev) => (prev ? `${prev}, ${p.en.toLowerCase()}` : p.en))}
              className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[#475569] hover:bg-[#e6f8f7] hover:border-[#0cd8d8] hover:text-[#0099a8] transition-all shadow-sm"
            >
              <span>{p.emoji}</span>
              {p.en}
            </button>
          ))}
        </div>

      </div>

      {/* Bottom Analyze Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-5 pb-8 pt-4 bg-gradient-to-t from-[#f8fafb] via-[#f8fafb]/90 to-transparent">
        <button
          onClick={handleAnalyze}
          disabled={!symptoms.trim() || isAnalyzing || recordingState === 'recording' || recordingState === 'transcribing'}
          className={`w-full h-[58px] rounded-[18px] flex items-center justify-center gap-3 font-bold text-[16px] transition-all ${
            symptoms.trim() && !isAnalyzing && recordingState !== 'recording' && recordingState !== 'transcribing'
              ? 'bg-[#ef4444] text-white shadow-[0_8px_25px_rgba(239,68,68,0.35)] hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span>Analyzing with AI…</span>
            </>
          ) : recordingState === 'recording' ? (
            <>
              <span className="material-symbols-outlined text-[20px]">mic</span>
              <span>Stop recording first</span>
            </>
          ) : recordingState === 'transcribing' ? (
            <>
              <span className="material-symbols-outlined text-[20px]">hourglass_top</span>
              <span>Transcribing…</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[22px] fill-1 font-variation-settings-fill">psychology</span>
              <span>Analyze Emergency</span>
            </>
          )}
        </button>
        <p className="text-center text-[11px] text-[#94a3b8] font-medium mt-2">
          99 languages · OpenAI Whisper · Gemini AI
        </p>
      </div>

      <style>{`
        @keyframes soundwave {
          from { transform: scaleY(0.3); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
