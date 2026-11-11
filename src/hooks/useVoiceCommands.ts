import { useState, useEffect, useCallback, useRef } from 'react';
import { VoiceCommandRecord } from '../types';
import { subscribeVoiceCommands, logVoiceCommand, updateFanState } from '../firebase/database';
import { parseVoiceIntent } from '../utils/voiceParser';

// Type definitions for SpeechRecognition Web API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionResultItem;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: {
      new (): SpeechRecognitionInstance;
    };
    webkitSpeechRecognition?: {
      new (): SpeechRecognitionInstance;
    };
  }
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'success' | 'error';

export function useVoiceCommands() {
  const [voiceHistory, setVoiceHistory] = useState<VoiceCommandRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean>(true);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Subscribe to real-time voice history from Firebase
  useEffect(() => {
    setLoadingHistory(true);
    const unsubscribe = subscribeVoiceCommands((data) => {
      setVoiceHistory(data);
      setLoadingHistory(false);
    });

    return () => unsubscribe();
  }, []);

  // Initialize SpeechRecognition support check
  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setVoiceState('listening');
        setFeedbackMessage('Listening...');
        setTranscript('');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setVoiceState('error');
        if (event.error === 'not-allowed') {
          setFeedbackMessage('Microphone permission denied. Please allow microphone access or use text input.');
        } else if (event.error === 'no-speech') {
          setFeedbackMessage('No speech detected. Please try again.');
        } else {
          setFeedbackMessage(`Voice error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // Will process after end if not already error
      };

      recognitionRef.current = recognition;
    } catch {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Execute intent parsing and Firebase updates
  const executeCommand = useCallback(async (commandText: string) => {
    const trimmed = commandText.trim();
    if (!trimmed) return;

    setVoiceState('processing');
    setFeedbackMessage('Understanding...');

    const result = parseVoiceIntent(trimmed);

    if (result.matched && result.targetDevice === 'fan' && result.targetValue !== undefined) {
      try {
        // 1. Update Firebase RTDB Devices/CurrentState/fan
        await updateFanState(result.targetValue);
        // 2. Log to VoiceCommands in Firebase
        await logVoiceCommand(trimmed, result.intent, 'Executed');

        setVoiceState('success');
        setFeedbackMessage('Fan command sent');
      } catch {
        await logVoiceCommand(trimmed, result.intent, 'Failed');
        setVoiceState('error');
        setFeedbackMessage('Unable to control the fan. Please check your connection.');
      }
    } else if (result.isBlocked) {
      // Blocked read-only device commands (Light, Door, Alarm)
      await logVoiceCommand(trimmed, result.intent, 'Blocked');
      setVoiceState('error');
      setFeedbackMessage(result.feedbackMessage);
    } else {
      // Log unparsed command
      await logVoiceCommand(trimmed, 'unknown', 'Failed');
      setVoiceState('error');
      setFeedbackMessage(result.feedbackMessage);
    }
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.abort();
      recognitionRef.current.start();
    } catch {
      // If already started, abort and restart
      try {
        recognitionRef.current.stop();
        recognitionRef.current.start();
      } catch {
        setVoiceState('error');
        setFeedbackMessage('Microphone is busy. Please try again.');
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      if (transcript) {
        executeCommand(transcript);
      } else {
        setVoiceState('idle');
        setFeedbackMessage('');
      }
    } catch {
      setVoiceState('idle');
    }
  }, [transcript, executeCommand]);

  // When speech ends and we have transcript, auto-execute
  useEffect(() => {
    if (voiceState === 'listening' && recognitionRef.current) {
      const rec = recognitionRef.current;
      rec.onend = () => {
        if (transcript.trim()) {
          executeCommand(transcript);
        } else {
          setVoiceState('idle');
          setFeedbackMessage('');
        }
      };
    }
  }, [voiceState, transcript, executeCommand]);

  const resetVoiceState = useCallback(() => {
    setVoiceState('idle');
    setTranscript('');
    setFeedbackMessage('');
  }, []);

  return {
    voiceHistory,
    loadingHistory,
    voiceState,
    transcript,
    feedbackMessage,
    isSupported,
    startListening,
    stopListening,
    executeTextCommand: executeCommand,
    resetVoiceState,
  };
}
