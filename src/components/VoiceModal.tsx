import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Send, ArrowUp, Sparkles } from 'lucide-react';
import { Language, translations } from '../i18n';
import { VoiceAssistant, VoiceQueryResult } from '../services/voice';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onNavigateTab: (tab: string) => void;
}

// Reveals text progressively for a "generating" feel, similar to Google's AI Mode.
function useStreamedText(fullText: string | undefined, speedMs = 12) {
  const [shown, setShown] = useState('');

  useEffect(() => {
    if (!fullText) {
      setShown('');
      return;
    }
    setShown('');
    let i = 0;
    const interval = setInterval(() => {
      i += Math.max(1, Math.round(fullText.length / 60));
      setShown(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(interval);
    }, speedMs);
    return () => clearInterval(interval);
  }, [fullText, speedMs]);

  return shown;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  lang,
  onNavigateTab
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<VoiceQueryResult | null>(null);
  const [textQuery, setTextQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const t = translations[lang];
  const streamedResponse = useStreamedText(response?.response);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setResponse(null);
      setTranscript('');
      handleStartListening();
    } else {
      VoiceAssistant.stopListening();
      setIsListening(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartListening = () => {
    setErrorMsg('');
    setIsListening(true);
    VoiceAssistant.startListening(
      lang,
      (text: string) => {
        setTranscript(text);
        setIsListening(false);
        const res = VoiceAssistant.processQuery(text, lang);
        setResponse(res);
        VoiceAssistant.speak(res.response, lang);
      },
      (err: any) => {
        setIsListening(false);
        setErrorMsg(friendlyMicError(typeof err === 'string' ? err : ''));
      }
    );
  };

  const handleStopListening = () => {
    VoiceAssistant.stopListening();
    setIsListening(false);
  };

  const runQuery = (query: string) => {
    if (!query.trim()) return;
    setErrorMsg('');
    const res = VoiceAssistant.processQuery(query, lang);
    setTranscript(query);
    setResponse(res);
    VoiceAssistant.speak(res.response, lang);
  };

  const friendlyMicError = (raw: string): string => {
    if (raw === 'not-allowed' || raw === 'permission-denied') {
      return lang === 'mr'
        ? 'मायक्रोफोन परवानगी नाकारली गेली आहे. कृपया खाली टाइप करा.'
        : lang === 'hi'
        ? 'माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया नीचे टाइप करें।'
        : "I don't have microphone access — you can type your question below instead.";
    }
    if (raw === 'no-speech') {
      return lang === 'mr'
        ? 'काही ऐकू आले नाही. पुन्हा प्रयत्न करा किंवा टाइप करा.'
        : lang === 'hi'
        ? 'कुछ सुनाई नहीं दिया। दोबारा कोशिश करें या टाइप करें।'
        : "I didn't catch that — try again, or type your question below.";
    }
    return lang === 'mr'
      ? 'आवाज ऐकता आला नाही. कृपया टाइप करा.'
      : lang === 'hi'
      ? 'आवाज़ नहीं सुनी जा सकी। कृपया टाइप करें।'
      : 'Voice input is unavailable right now — you can type your question below.';
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runQuery(textQuery);
    setTextQuery('');
  };

  const handleAction = () => {
    if (response?.targetTab) {
      onNavigateTab(response.targetTab);
      onClose();
    }
  };

  const sampleVoicePrompts = [
    lang === 'mr' ? 'टोमॅटोचा आजचा बाजारभाव काय आहे?' : lang === 'hi' ? 'टमाटर का आज का मंडी भाव क्या है?' : 'What is the market price for Tomato?',
    lang === 'mr' ? 'पानावरील करपा रोग नियंत्रण उपाय' : lang === 'hi' ? 'पत्ती रोग निदान और उपाय' : 'Diagnose this tomato leaf disease',
    lang === 'mr' ? 'कापणी गुणवत्ता प्रतवारी दाखवा' : lang === 'hi' ? 'बैच गुणवत्ता ग्रेडिंग दिखाएं' : 'Show my latest batch quality grade',
    lang === 'mr' ? 'नवीन कापणी नोंदवा' : lang === 'hi' ? 'कटाई बैच दर्ज करें' : 'Register a new harvest batch'
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white text-neutral-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span
              className="flex size-8 items-center justify-center rounded-full text-white shrink-0"
              style={{ background: 'conic-gradient(from 180deg, #4285F4, #9B72CB, #D96570, #4285F4)' }}
            >
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">AI Mode</h3>
              <p className="text-[11px] text-neutral-500">
                {lang === 'mr' ? 'मराठी' : lang === 'hi' ? 'हिन्दी' : 'English'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition"
            aria-label="Close"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Conversation area */}
        <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-4">
          {!transcript && !errorMsg && (
            <div className="flex flex-col items-center text-center py-8 gap-4">
              <div className="relative flex items-center justify-center">
                {isListening && (
                  <span
                    className="absolute size-24 rounded-full opacity-30 animate-ping"
                    style={{ background: 'conic-gradient(from 180deg, #4285F4, #9B72CB, #D96570, #4285F4)' }}
                  />
                )}
                <button
                  onClick={isListening ? handleStopListening : handleStartListening}
                  className="relative z-10 size-16 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95"
                  style={{ background: 'conic-gradient(from 180deg, #4285F4, #9B72CB, #D96570, #4285F4)' }}
                >
                  <Mic className="w-6 h-6" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800">
                  {isListening
                    ? (lang === 'mr' ? 'ऐकत आहे...' : lang === 'hi' ? 'सुन रहा हूँ...' : 'Listening...')
                    : (lang === 'mr' ? 'बोलण्यासाठी टॅप करा किंवा खाली टाइप करा' : lang === 'hi' ? 'बोलने के लिए टैप करें या नीचे टाइप करें' : 'Tap to speak, or type below')}
                </p>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm">{t.voicePrompt}</p>
              </div>
            </div>
          )}

          {transcript && (
            <div className="flex justify-end">
              <div className="max-w-[85%] bg-neutral-100 text-neutral-900 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm">
                {transcript}
              </div>
            </div>
          )}

          {response && (
            <div className="flex items-start gap-2.5">
              <span
                className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: 'conic-gradient(from 180deg, #4285F4, #9B72CB, #D96570, #4285F4)' }}
              >
                <Sparkles className="w-3 h-3" />
              </span>
              <div className="max-w-[85%] space-y-2.5">
                <p className="text-sm text-neutral-800 leading-relaxed">
                  {streamedResponse}
                  {streamedResponse.length < response.response.length && (
                    <span className="inline-block w-1 h-3.5 ml-0.5 bg-neutral-400 animate-pulse align-middle" />
                  )}
                </p>
                {response.targetTab && streamedResponse.length >= response.response.length && (
                  <button
                    onClick={handleAction}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-full transition shadow-sm"
                  >
                    <span>
                      {lang === 'mr' ? 'उघडा' : lang === 'hi' ? 'खोलें' : 'Open'}
                    </span>
                    <ArrowUp className="w-3 h-3 rotate-45" />
                  </button>
                )}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-xl">
              {errorMsg}
            </div>
          )}

          {!transcript && (
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {sampleVoicePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => runQuery(prompt)}
                  className="px-3 py-1.5 text-xs rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input bar */}
        <form onSubmit={handleTextSubmit} className="flex items-center gap-2 px-4 py-3 border-t border-neutral-100">
          <input
            ref={inputRef}
            type="text"
            value={textQuery}
            onChange={(e) => setTextQuery(e.target.value)}
            placeholder={lang === 'mr' ? 'Ask Agronauts काहीही विचारा...' : lang === 'hi' ? 'Agronauts से कुछ भी पूछें...' : 'Ask Agronauts anything...'}
            className="flex-1 px-4 py-2.5 text-sm bg-neutral-100 rounded-full text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
          />
          <button
            type="button"
            onClick={isListening ? handleStopListening : handleStartListening}
            className={`p-2.5 rounded-full transition shrink-0 ${isListening ? 'bg-red-50 text-red-500' : 'text-neutral-500 hover:bg-neutral-100'}`}
            aria-label="Voice input"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            type="submit"
            disabled={!textQuery.trim()}
            className="p-2.5 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-neutral-900 transition shrink-0"
            aria-label="Send"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
