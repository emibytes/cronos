import React, { useEffect } from 'react';
import { X, Play, Pause, Square, Coffee, Briefcase, CheckCircle2, Timer } from 'lucide-react';
import { Task } from '../types';
import { usePomodoroTimer } from '../hooks/usePomodoroTimer';

interface PomodoroModalProps {
  task: Task;
  onClose: () => void;
  onComplete: () => void;
}

const PomodoroModal: React.FC<PomodoroModalProps> = ({ task, onClose, onComplete }) => {
  const {
    phase,
    timeLeft,
    totalTime,
    isRunning,
    cycles,
    start,
    pause,
    resume,
    stop,
  } = usePomodoroTimer({
    workDuration: Number(import.meta.env.VITE_POMODORO_WORK_DURATION) || 30,
    breakDuration: Number(import.meta.env.VITE_POMODORO_BREAK_DURATION) || 5,
    onWorkComplete: () => {
      // Notificación del navegador
      const workDuration = import.meta.env.VITE_POMODORO_WORK_DURATION || 30;
      const breakDuration = import.meta.env.VITE_POMODORO_BREAK_DURATION || 5;
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('¡Tiempo de descanso! ☕', {
          body: `Has trabajado ${workDuration} minutos. Tómate ${breakDuration} minutos de descanso.`,
          icon: '/logo.png',
        });
      }
    },
    onBreakComplete: () => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('¡De vuelta al trabajo! 💪', {
          body: 'Descanso terminado. Es hora de continuar.',
          icon: '/logo.png',
        });
      }
    },
  });

  // Solicitar permisos de notificación al montar
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Prevenir cierre accidental y recarga de página
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro? Tienes un Pomodoro en progreso.';
        return e.returnValue;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloquear F5 y Ctrl+R
      if ((e.key === 'F5') || (e.ctrlKey && e.key === 'r')) {
        if (isRunning) {
          e.preventDefault();
          return false;
        }
      }
      // Bloquear ESC
      if (e.key === 'Escape') {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRunning]);

  // Iniciar automáticamente al abrir
  useEffect(() => {
    start();
  }, [start]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getPhaseColor = (): string => {
    if (phase === 'work') return 'from-emibytes-primary to-green-600';
    if (phase === 'break') return 'from-amber-500 to-amber-600';
    return 'from-gray-500 to-gray-600';
  };

  const getPhaseIcon = () => {
    if (phase === 'work') return <Briefcase size={32} className="text-white" />;
    if (phase === 'break') return <Coffee size={32} className="text-white" />;
    return <Timer size={32} className="text-white" />;
  };

  const getPhaseText = (): string => {
    if (phase === 'work') return 'Sesión de Trabajo';
    if (phase === 'break') return 'Descanso Activo';
    if (phase === 'paused') return 'Pausado';
    return 'Detenido';
  };

  const handleComplete = () => {
    stop();
    onComplete();
    onClose();
  };

  const handleCloseAttempt = () => {
    // Solo permitir cerrar si está pausado o detenido
    if (!isRunning || phase === 'paused' || phase === 'stopped') {
      stop();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="bg-white dark:bg-emibytes-dark-card w-full max-w-2xl max-h-[98vh] sm:max-h-[95vh] rounded-2xl sm:rounded-3xl shadow-2xl overflow-y-auto animate-in zoom-in-95 duration-300 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente según fase */}
        <div className={`bg-gradient-to-r ${getPhaseColor()} p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          
          <button
            onClick={handleCloseAttempt}
            disabled={isRunning && phase !== 'paused'}
            className={`absolute top-2 right-2 sm:top-4 sm:right-4 p-2 rounded-full transition-colors z-10 ${
              isRunning && phase !== 'paused' 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-white/20 cursor-pointer'
            }`}
            title={isRunning && phase !== 'paused' ? 'Pausa el timer para cerrar' : 'Cerrar'}
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>

          <div className="relative z-10">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="hidden sm:block">{getPhaseIcon()}</div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-black mb-1">{getPhaseText()}</h2>
                <p className="text-white/90 text-xs sm:text-sm font-medium line-clamp-2">{task.title}</p>
              </div>
            </div>

            {/* Información de ciclos */}
            <div className="flex items-center gap-2 text-white/80 text-xs sm:text-sm">
              <CheckCircle2 size={14} className="sm:w-4 sm:h-4" />
              <span className="font-bold">{cycles} ciclo(s) completado(s)</span>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Timer Display */}
          <div className="text-center">
            <div className="inline-block relative">
              <svg className="transform -rotate-90 w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64" viewBox="0 0 256 256">
                {/* Círculo de fondo */}
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                {/* Círculo de progreso */}
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${2 * Math.PI * 120 * (1 - getProgress() / 100)}`}
                  className={`transition-all duration-1000 ${
                    phase === 'work' ? 'text-emibytes-primary' :
                    phase === 'break' ? 'text-amber-500' : 'text-gray-400'
                  }`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-emibytes-secondary dark:text-white">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                    {phase === 'work' ? 'Mantén el enfoque' : phase === 'break' ? 'Relájate' : 'Timer pausado'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {!isRunning ? (
              <button
                onClick={resume}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-emibytes-primary text-white rounded-xl sm:rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emibytes-primary/30 text-sm sm:text-base"
              >
                <Play size={18} className="sm:w-5 sm:h-5" fill="currentColor" />
                <span>Reanudar</span>
              </button>
            ) : (
              <button
                onClick={pause}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-amber-500 text-white rounded-xl sm:rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-500/30 text-sm sm:text-base"
              >
                <Pause size={18} className="sm:w-5 sm:h-5" />
                <span>Pausar</span>
              </button>
            )}

            <button
              onClick={handleComplete}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-green-600 text-white rounded-xl sm:rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-600/30 text-sm sm:text-base"
            >
              <CheckCircle2 size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Finalizar Tarea</span>
              <span className="sm:hidden">Finalizar</span>
            </button>

            <button
              onClick={() => {
                stop();
                onClose();
              }}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl sm:rounded-2xl font-black hover:scale-105 active:scale-95 transition-all text-sm sm:text-base"
            >
              <Square size={18} className="sm:w-5 sm:h-5" />
              <span>Detener</span>
            </button>
          </div>

          {/* Información de la técnica */}
          <div className="bg-emibytes-primary/10 dark:bg-emibytes-primary/20 p-3 sm:p-4 rounded-xl border border-emibytes-primary/30 dark:border-emibytes-primary/40">
            <h4 className="font-black text-xs sm:text-sm text-emibytes-primary mb-2">💡 Técnica Pomodoro Adaptada</h4>
            <ul className="text-[11px] sm:text-xs text-emibytes-secondary dark:text-gray-300 space-y-1 font-medium">
              <li>• {import.meta.env.VITE_POMODORO_WORK_DURATION || 30} minutos de trabajo enfocado</li>
              <li>• {import.meta.env.VITE_POMODORO_BREAK_DURATION || 5} minutos de descanso activo</li>
              <li>• Notificaciones sonoras automáticas</li>
              <li>• Maximiza productividad y bienestar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroModal;
