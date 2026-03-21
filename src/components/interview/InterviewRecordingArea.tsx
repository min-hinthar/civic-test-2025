'use client';

import { RotateCcw, Square, Keyboard, Mic } from 'lucide-react';
import { clsx } from 'clsx';
import { AudioWaveform } from '@/components/interview/AudioWaveform';
import { TextAnswerInput } from '@/components/interview/TextAnswerInput';
import { MAX_REPLAYS, type QuestionPhase } from '@/lib/interview/interviewStateMachine';

interface InterviewRecordingAreaProps {
  isRecording: boolean;
  isListening: boolean;
  stream: MediaStream | null;
  canUseSpeech: boolean;
  micPermission: boolean;
  questionPhase: QuestionPhase;
  replaysUsed: number;
  onRepeat: () => void;
  onManualSubmit: () => void;
  previousTranscription: string | null;
  onTextSubmit: (text: string) => void;
  onToggleInputMode: () => void;
  onSkipToGrade: () => void;
  showBurmese: boolean;
  showRecordingArea: boolean;
  showTextInput: boolean;
  hasSpeechError: boolean;
  speechError: string | null;
  isGreeting: boolean;
}

export function InterviewRecordingArea({
  isRecording, isListening, stream, canUseSpeech, micPermission,
  questionPhase, replaysUsed, onRepeat, onManualSubmit,
  previousTranscription, onTextSubmit, onToggleInputMode, onSkipToGrade,
  showBurmese, showRecordingArea, showTextInput, hasSpeechError, speechError, isGreeting,
}: InterviewRecordingAreaProps) {
  return (
    <div className="border-t border-white/10 px-4 py-3">
      {showRecordingArea ? (
        <div className="space-y-3">
          <AudioWaveform stream={stream} isActive={isRecording} />
          <div className="flex items-center justify-center gap-3">
            {questionPhase === 'responding' && replaysUsed < MAX_REPLAYS && (
              <button type="button" onClick={onRepeat} className={clsx(
                'flex items-center gap-1.5 rounded-xl border border-white/20 px-3 py-2',
                'text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white/80',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
              )}>
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Repeat ({replaysUsed}/{MAX_REPLAYS})</span>
              </button>
            )}
            {questionPhase === 'responding' && (
              <button type="button" onClick={onManualSubmit} className={clsx(
                'flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2',
                'text-xs font-semibold text-white transition-colors hover:bg-primary/90',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              )}>
                <Square className="h-3 w-3" />
                <span>Done</span>
              </button>
            )}
            {canUseSpeech && questionPhase === 'responding' && (
              <button type="button" onClick={onToggleInputMode} title="Switch to text input" className={clsx(
                'flex items-center gap-1 rounded-xl border border-white/20 px-2.5 py-2',
                'text-xs text-white/50 transition-colors hover:bg-white/10 hover:text-white/80',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
              )}>
                <Keyboard className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {isListening && (
            <div className="flex items-center justify-center gap-2">
              <Mic className="h-3.5 w-3.5 animate-pulse text-primary" />
              <span className="text-xs text-white/50">
                Listening...
                {showBurmese && <span className="font-myanmar ml-1">နားထောင်နေသည်...</span>}
              </span>
            </div>
          )}
          {speechError && !isListening && (
            <p className="text-center text-xs text-warning">{speechError}</p>
          )}
        </div>
      ) : showTextInput ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-white/40">
              <Keyboard className="h-3.5 w-3.5" />
              <span className="text-xs">
                {hasSpeechError ? 'Speech recognition failed. Type your answer.'
                  : !canUseSpeech ? 'No microphone. Type your answer.' : 'Type your answer'}
              </span>
            </div>
            {canUseSpeech && !hasSpeechError && questionPhase === 'responding' && (
              <button type="button" onClick={onToggleInputMode} title="Switch to voice input"
                className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 transition-colors">
                <Mic className="h-3.5 w-3.5" /><span>Voice</span>
              </button>
            )}
          </div>
          <TextAnswerInput
            onSubmit={onTextSubmit} disabled={questionPhase !== 'responding'}
            previousTranscription={previousTranscription || undefined}
          />
          {!canUseSpeech && !micPermission && (
            <p className="text-center text-xs text-white/30">Microphone access denied. Use text input instead.</p>
          )}
          <div className="flex justify-center">
            <button type="button" onClick={onSkipToGrade}
              className="text-xs text-white/30 underline hover:text-white/50 transition-colors">
              Skip — self-grade instead
              {showBurmese && <span className="block font-myanmar">ကျော် — ကိုယ်တိုင်အကဲဖြတ်ပါ</span>}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-2">
          <span className="text-xs text-white/30">
            {isGreeting ? 'The USCIS officer is greeting you...'
              : questionPhase === 'grading' || questionPhase === 'feedback' ? 'Reviewing your answer...' : ''}
            {showBurmese && (
              <span className="block font-myanmar mt-0.5">
                {isGreeting ? 'USCIS အရာရှိက နှုတ်ဆက်နေပါသည်...'
                  : questionPhase === 'grading' || questionPhase === 'feedback' ? 'သင့်အဖြေကို စစ်ဆေးနေပါသည်...' : ''}
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
