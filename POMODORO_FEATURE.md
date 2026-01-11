# ⏱️ Sistema Pomodoro Integrado

## 📋 Descripción

Sistema de productividad integrado en el Tablero de Tareas que implementa la **Técnica Pomodoro adaptada** para ayudar a los usuarios a mantener pausas activas y trabajar de manera más eficiente.

## 🎯 Funcionamiento

### Flujo de Trabajo

1. **Inicio Automático**: Cuando una tarea se arrastra de cualquier estado a "En Proceso", se abre automáticamente el **Pomodoro Modal**

2. **Ciclo de Trabajo**: 
   - ⏰ **30 minutos** de trabajo enfocado
   - ☕ **5 minutos** de descanso activo
   - 🔔 Notificaciones sonoras y de navegador al finalizar cada fase

3. **Controles Disponibles**:
   - **Pausar/Reanudar**: Detener temporalmente el timer
   - **Finalizar Tarea**: Marca la tarea como completada y cierra el modal
   - **Detener**: Detiene el timer y cierra el modal (tarea permanece en proceso)

### Características

✅ **Timer Visual Circular**: Indicador de progreso con código de colores
- 🔵 Azul: Sesión de trabajo
- 🟢 Verde: Descanso activo
- ⚪ Gris: Pausado

✅ **Notificaciones Inteligentes**:
- Sonido de campana al completar cada fase
- Notificaciones del navegador (requiere permiso)
- Mensajes motivacionales

✅ **Contador de Ciclos**: Rastrea cuántos ciclos Pomodoro has completado

✅ **Diseño Responsive**: Funciona perfectamente en móviles y desktop

## 🎨 Componentes Creados

### 1. `PomodoroModal.tsx`
Modal principal con interfaz de usuario del timer Pomodoro.

**Props**:
- `task`: Tarea en proceso
- `onClose`: Función para cerrar el modal
- `onComplete`: Función que se ejecuta al finalizar la tarea

### 2. `usePomodoroTimer.ts` (Hook)
Lógica del timer reutilizable.

**Parámetros**:
```typescript
{
  workDuration: number,    // Minutos de trabajo (default: 30)
  breakDuration: number,   // Minutos de descanso (default: 5)
  onWorkComplete: () => void,
  onBreakComplete: () => void
}
```

**Retorna**:
```typescript
{
  phase: 'work' | 'break' | 'paused' | 'stopped',
  timeLeft: number,        // Segundos restantes
  totalTime: number,       // Total de segundos de la fase actual
  isRunning: boolean,
  cycles: number,          // Ciclos completados
  start: () => void,
  pause: () => void,
  resume: () => void,
  stop: () => void,
  reset: () => void
}
```

## 🔧 Integración

### TaskBoard.tsx

```typescript
// Estado para manejar el modal
const [pomodoroTask, setPomodoroTask] = useState<Task | null>(null);

// Abrir modal cuando se arrastra a "En Proceso"
const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
  if (status === 'en_proceso' && draggedTask.status !== 'en_proceso') {
    setPomodoroTask(draggedTask);
    onUpdateTaskStatus(draggedTask.id, status);
  }
};

// Renderizar modal
{pomodoroTask && (
  <PomodoroModal
    task={pomodoroTask}
    onClose={() => setPomodoroTask(null)}
    onComplete={() => {
      onUpdateTaskStatus(pomodoroTask.id, 'completada');
      setPomodoroTask(null);
    }}
  />
)}
```

## 🔊 Sonidos y Notificaciones

### Sonidos
- Utiliza Web Audio API con sonido base64 embebido
- No requiere archivos externos
- Campana simple para indicar cambios de fase

### Notificaciones del Navegador
- **Trabajo Completado**: "¡Tiempo de descanso! ☕"
- **Descanso Completado**: "¡De vuelta al trabajo! 💪"
- Solicita permisos automáticamente al abrir el modal

## 📱 Responsive Design

**Móvil**:
- Timer adaptado a pantallas pequeñas
- Botones apilados verticalmente
- Texto y círculo de progreso escalados

**Desktop**:
- Timer más grande y prominente
- Botones en fila horizontal
- Mayor espaciado y padding

## 🎓 Beneficios de la Técnica Pomodoro

1. **Mejora la concentración**: Trabajas en bloques enfocados sin distracciones
2. **Previene el agotamiento**: Descansos regulares mantienen la mente fresca
3. **Aumenta la productividad**: Más trabajo de calidad en menos tiempo
4. **Reduce la procrastinación**: Compromisos de tiempo manejables
5. **Mejora la salud**: Pausas activas previenen fatiga física y mental

## 🚀 Futuras Mejoras (Opcionales)

- [ ] Configuración personalizable de tiempos
- [ ] Historial de sesiones Pomodoro
- [ ] Estadísticas de productividad
- [ ] Integración con calendario
- [ ] Sonidos personalizables
- [ ] Modo "no molestar" en el sistema operativo
- [ ] Sincronización entre dispositivos
- [ ] Descansos largos cada 4 ciclos (tradicional Pomodoro)

## 💡 Tips de Uso

1. **Elimina distracciones** antes de iniciar una sesión
2. **Respeta los descansos**: Son tan importantes como el trabajo
3. **Usa los 5 minutos**: Estira, camina, toma agua
4. **No interrumpas** el timer a menos que sea urgente
5. **Celebra cada ciclo**: Cada uno es un logro

---

**Desarrollado con** ❤️ **para maximizar la productividad del equipo Emibytes**
