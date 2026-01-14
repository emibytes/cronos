# Design System - Cronos Frontend

## 🎨 Paleta de Colores

### Colores de Marca (Emibytes)

```css
--emibytes-primary: #138b52;      /* Verde principal */
--emibytes-secondary: #333333;    /* Texto oscuro */
--emibytes-tertiary: #ffffff;     /* Blanco */
--emibytes-background: #f8fafc;   /* Fondo claro */
```

### Tema Oscuro (JIRA-inspired)

Basado en el sistema de diseño de Atlassian JIRA para una experiencia familiar y profesional.

#### Superficies Base

```css
--dark-bg: #1F1F21;              /* Fondo principal (ds-surface) */
--dark-card: #242528;            /* Tarjetas y elementos elevados (ds-surface-raised) */
--dark-sunken: #18191A;          /* Elementos hundidos - inputs (ds-surface-sunken) */
--dark-column: #18191A;          /* Columnas del tablero (project-color-elevation-surface-sunken) */
```

#### Elementos de UI

```css
--dark-border: #3D3F43;          /* Bordes y separadores (ds-surface-overlay-pressed) */
```

#### Modo Claro

```css
--light-column: #F8F8F8;         /* Columnas del tablero en modo claro */
```

## 📦 Uso en Tailwind

### Clases Disponibles

#### Fondos
- `bg-emibytes-dark-bg` - Fondo principal (#1F1F21)
- `bg-emibytes-dark-card` - Tarjetas (#242528)
- `bg-emibytes-dark-sunken` - Elementos hundidos - inputs (#18191A)
- `bg-emibytes-dark-column` - Columnas del tablero (#18191A)
- `bg-emibytes-light-column` - Columnas del tablero modo claro (#F8F8F8)
- `bg-emibytes-dark-hover` - Hover (#2B2C2F)
- `bg-emibytes-dark-overlay` - Overlays (#2B2C2F)

#### Bordes
- `border-emibytes-dark-border` - Bordes (#3D3F43)

#### Estados Interactivos
- `hover:bg-emibytes-dark-hover`
- `active:bg-emibytes-dark-pressed`

### Ejemplos de Uso

#### Columnas del Tablero Kanban
```tsx
<div className="bg-emibytes-light-column dark:bg-emibytes-dark-column 
                rounded-lg p-4 min-h-screen">
  <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">
    POR HACER
  </h2>
  {/* Cards de tareas */}
</div>
```

#### Card con hover
```tsx
<div className="bg-emibytes-dark-card hover:bg-emibytes-dark-hover 
                border border-emibytes-dark-border rounded-lg p-4
                transition-colors duration-200">
  {/* Contenido */}
</div>
```

#### Modal/Overlay
```tsx
<div className="bg-emibytes-dark-overlay border border-emibytes-dark-border 
                rounded-xl p-6 shadow-xl">
  {/* Contenido del modal */}
</div>
```

#### Elementos hundidos (Inputs, áreas de texto)
```tsx
<input 
  className="bg-emibytes-dark-sunken border border-emibytes-dark-border
             focus:border-emibytes-primary rounded-lg px-4 py-2
             text-gray-100 placeholder-gray-400"
  placeholder="Escribe algo..."
/>
```

#### Botón con estados
```tsx
<button 
  className="bg-emibytes-dark-card hover:bg-emibytes-dark-hover 
             active:bg-emibytes-dark-pressed border border-emibytes-dark-border
             rounded-lg px-4 py-2 transition-all duration-150">
  Click me
</button>
```

## 🌓 Modo Oscuro

El proyecto usa `class` strategy para el modo oscuro:

```tsx
// Alternar tema
const toggleDarkMode = () => {
  document.documentElement.classList.toggle('dark');
};

// Detectar preferencia del sistema
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
```

### Aplicar estilos según el tema

```tsx
<div className="bg-emibytes-background dark:bg-emibytes-dark-bg
                text-emibytes-secondary dark:text-gray-100">
  {/* Contenido responsive al tema */}
</div>
```

## 🎯 Componentes Comunes

### Scrollbar Personalizada

```css
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;  /* Light mode */
  border-radius: 4px;
}

.dark::-webkit-scrollbar-thumb {
  background: #3D3F43;  /* Dark mode - JIRA border color */
}
```

### Editor Quill

```css
/* Toolbar - Dark mode */
.dark .ql-toolbar.ql-snow {
  border-color: #3D3F43;
  background: #242528;
}

/* Container - Dark mode */
.dark .ql-container.ql-snow {
  border-color: #3D3F43;
  background: #242528;
  color: #f3f4f6;
}
```

## 📐 Espaciado y Tipografía

### Fuente
- **Familia:** Inter (Google Fonts)
- **Pesos:** 300, 400, 500, 600, 700

### Tamaños Comunes
```css
text-xs     /* 0.75rem - 12px */
text-sm     /* 0.875rem - 14px */
text-base   /* 1rem - 16px */
text-lg     /* 1.125rem - 18px */
text-xl     /* 1.25rem - 20px */
text-2xl    /* 1.5rem - 24px */
```

### Espaciado
Usar la escala de Tailwind: `2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64`

## 🔄 Transiciones

### Estándar
```tsx
className="transition-colors duration-200"
```

### Suave
```tsx
className="transition-all duration-300 ease-in-out"
```

### Rápida (para estados activos)
```tsx
className="transition-all duration-150"
```

## ✅ Checklist de Accesibilidad

- [ ] Contraste mínimo 4.5:1 para texto
- [ ] Estados hover/focus/active visibles
- [ ] Bordes visibles en modo oscuro
- [ ] Transiciones suaves (<300ms)
- [ ] Tamaños de fuente >= 14px para contenido
- [ ] Áreas de click >= 44x44px para botones

## 🎨 Paleta Completa JIRA

Referencia completa del sistema de diseño de Atlassian:

```css
:root {
  /* Superficies */
  --ds-surface: #1F1F21;
  --ds-surface-hovered: #242528;
  --ds-surface-pressed: #2B2C2F;
  --ds-surface-overlay: #2B2C2F;
  --ds-surface-overlay-hovered: #303134;
  --ds-surface-overlay-pressed: #3D3F43;
  --ds-surface-raised: #242528;
  --ds-surface-raised-hovered: #2B2C2F;
  --ds-surface-raised-pressed: #303134;
  --ds-surface-sunken: #18191A;
}
```

---

**Última actualización:** 13 de enero de 2026  
**Versión:** 1.0  
**Framework:** Tailwind CSS + React
