import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Volume2,
} from 'lucide-react';
import { useVoiceCommands, VoiceState } from '../../hooks/useVoiceCommands';
import { StatusBadge } from '../Common/StatusBadge';
import { EmptyState } from '../Common/EmptyState';

export const VoiceControlCenter: React.FC = () => {
  const {
    voiceHistory,
    loadingHistory,
    voiceState,
    transcript,
    feedbackMessage,
    isSupported,
    startListening,
    stopListening,
    executeTextCommand,
    resetVoiceState,
  } = useVoiceCommands();

  const [textInput, setTextInput] = useState('');

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    executeTextCommand(textInput);
    setTextInput('');
  };

  const isListening = voiceState === 'listening';
  const isProcessing = voiceState === 'processing';

  const getMicButtonStyles = () => {
    switch (voiceState) {
      case 'listening':
        return 'bg-rose-600 ring-8 ring-rose-600/30 text-white animate-pulse shadow-rose-600/50 shadow-2xl';
      case 'processing':
        return 'bg-purple-600 text-white animate-spin';
      case 'success':
        return 'bg-emerald-600 ring-4 ring-emerald-600/30 text-white';
      case 'error':
        return 'bg-amber-600 ring-4 ring-amber-600/30 text-white';
      case 'idle':
      default:
        return 'bg-gradient-to-tr from-indigo-600 to-purple-600 hover:scale-105 text-white shadow-indigo-600/30 shadow-2xl';
    }
  };

  return (
    <div className="space-y-6">
      {/* Voice Control Main Interactive Card */}
      <div className="bg-[#151B23] border border-white/8 rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden flex flex-col items-center justify-center">
        {/* Glow ambient background */}
        <div
          className={`absolute w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            isListening
              ? 'bg-rose-600/20 scale-125'
              : voiceState === 'success'
              ? 'bg-emerald-600/20'
              : 'bg-indigo-600/10'
          }`}
        />

        <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/8 text-xs text-[#8B95A5] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Natural Speech IoT Intelligence</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Voice Control
          </h2>
          <p className="text-xs sm:text-sm text-[#8B95A5] mt-1 mb-8">
            Control your smart home with your voice. Instantaneous ESP32 relay actuation.
          </p>

          {/* Large Microphone Button */}
          <div className="my-4 flex flex-col items-center">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${getMicButtonStyles()}`}
              aria-label={isListening ? 'Stop listening' : 'Start voice listening'}
            >
              {isListening ? (
                <Mic className="w-12 h-12 animate-bounce" />
              ) : isProcessing ? (
                <Volume2 className="w-12 h-12" />
              ) : (
                <Mic className="w-12 h-12" />
              )}
            </button>

            {/* State Prompt */}
            <p className="text-sm font-semibold text-white mt-6 tracking-wide">
              {isListening
                ? 'Listening...'
                : isProcessing
                ? 'Understanding...'
                : voiceState === 'success'
                ? feedbackMessage
                : voiceState === 'error'
                ? feedbackMessage
                : 'Tap to Speak'}
            </p>

            {/* Live Transcript Display */}
            {transcript && (
              <div className="mt-3 px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-indigo-300 font-mono italic max-w-md">
                "{transcript}"
              </div>
            )}

            {!isSupported && (
              <p className="text-xs text-amber-400 mt-2">
                Voice recognition is not supported in this browser. Please use the text input below.
              </p>
            )}
          </div>

          {/* Text Fallback Command Input */}
          <form onSubmit={handleTextSubmit} className="w-full max-w-md mt-6 flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Or type a command (e.g. 'Turn on the fan', 'Turn off the fan')..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#8B95A5] focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>

          {/* Example Command Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <span className="text-[11px] text-[#8B95A5]">Try saying:</span>
            {['"Turn on the fan"', '"Switch off the fan"', '"Please turn on the fan"', '"Can you switch off the fan?"'].map(
              (phrase) => (
                <button
                  key={phrase}
                  onClick={() => executeTextCommand(phrase.replace(/"/g, ''))}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-white/80 border border-white/8 transition cursor-pointer"
                >
                  {phrase}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Voice Command History Section */}
      <div className="bg-[#151B23] border border-white/8 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            <span>Voice Command Execution History</span>
          </h3>
          <span className="text-xs text-[#8B95A5]">
            Path: <code className="text-indigo-300 font-mono">VoiceCommands</code>
          </span>
        </div>

        {loadingHistory ? (
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : voiceHistory.length === 0 ? (
          <EmptyState
            icon={Mic}
            title="No voice commands yet"
            description="Use the microphone button above or type commands to dispatch actions. Commands and executions will be stored in your Firebase Realtime Database."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/8 text-[#8B95A5]">
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold">Spoken / Typed Command</th>
                  <th className="pb-3 font-semibold">Parsed Intent</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white">
                {voiceHistory.map((cmd) => (
                  <tr key={cmd.id} className="hover:bg-white/5 transition">
                    <td className="py-3 font-mono text-[#8B95A5]">
                      {cmd.createdAt.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 font-medium text-white">"{cmd.command}"</td>
                    <td className="py-3 font-mono text-indigo-300">{cmd.action}</td>
                    <td className="py-3 text-right">
                      {cmd.status === 'Executed' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Executed</span>
                        </span>
                      ) : cmd.status === 'Blocked' ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Blocked</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Failed</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
