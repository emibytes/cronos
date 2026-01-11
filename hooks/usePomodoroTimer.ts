import { useState, useEffect, useRef, useCallback } from 'react';

export type PomodoroPhase = 'work' | 'break' | 'paused' | 'stopped';

interface UsePomodoroTimerProps {
  workDuration?: number; // en minutos
  breakDuration?: number; // en minutos
  onWorkComplete?: () => void;
  onBreakComplete?: () => void;
}

interface UsePomodoroTimerReturn {
  phase: PomodoroPhase;
  timeLeft: number; // en segundos
  totalTime: number; // en segundos
  isRunning: boolean;
  cycles: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
}

export const usePomodoroTimer = ({
  workDuration = 30, // 30 minutos de trabajo
  breakDuration = 5,  // 5 minutos de descanso
  onWorkComplete,
  onBreakComplete,
}: UsePomodoroTimerProps = {}): UsePomodoroTimerReturn => {
  const [phase, setPhase] = useState<PomodoroPhase>('work');
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [totalTime, setTotalTime] = useState(workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const workCompleteAudioRef = useRef<HTMLAudioElement | null>(null);
  const breakCompleteAudioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializar sonidos
  useEffect(() => {
    // Crear sonidos usando Web Audio API
    workCompleteAudioRef.current = new Audio();
    breakCompleteAudioRef.current = new Audio();
    
    // Sonido de campana simple (data URI)
    const bellSound = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcIGWi77eefTRAMUKfj8LZjHAY4ktfyy3ksBSR3yPDdkEAKFF606+uoVRQKRp/g8r5sIQUrgs7y2Ik3CBlou+3nn00QDFC';
    
    workCompleteAudioRef.current.src = bellSound;
    breakCompleteAudioRef.current.src = bellSound;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Lógica del timer
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Tiempo completado
          if (phase === 'work') {
            // Fin de sesión de trabajo
            playWorkCompleteSound();
            onWorkComplete?.();
            setPhase('break');
            setTotalTime(breakDuration * 60);
            setCycles((c) => c + 1);
            return breakDuration * 60;
          } else if (phase === 'break') {
            // Fin de descanso
            playBreakCompleteSound();
            onBreakComplete?.();
            setPhase('work');
            setTotalTime(workDuration * 60);
            return workDuration * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, phase, workDuration, breakDuration, onWorkComplete, onBreakComplete]);

  const playWorkCompleteSound = useCallback(() => {
    try {
      workCompleteAudioRef.current?.play();
    } catch (error) {
      console.error('Error playing work complete sound:', error);
    }
  }, []);

  const playBreakCompleteSound = useCallback(() => {
    try {
      breakCompleteAudioRef.current?.play();
    } catch (error) {
      console.error('Error playing break complete sound:', error);
    }
  }, []);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    setPhase('paused');
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
    setPhase(timeLeft === totalTime ? 'work' : (totalTime === breakDuration * 60 ? 'break' : 'work'));
  }, [timeLeft, totalTime, breakDuration]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setPhase('stopped');
    setTimeLeft(workDuration * 60);
    setTotalTime(workDuration * 60);
    setCycles(0);
  }, [workDuration]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setPhase('work');
    setTimeLeft(workDuration * 60);
    setTotalTime(workDuration * 60);
    setCycles(0);
  }, [workDuration]);

  return {
    phase,
    timeLeft,
    totalTime,
    isRunning,
    cycles,
    start,
    pause,
    resume,
    stop,
    reset,
  };
};
