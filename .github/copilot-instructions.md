# Cronos - Task Management System

## Architecture Overview

**Tech Stack**: React 19 + TypeScript + Vite, no build step required (ESM imports via CDN)
- **State Management**: React hooks (useState, useEffect) - no external state library
- **Data Persistence**: localStorage only (`services/taskService.ts` handles all CRUD)
- **Styling**: Tailwind CSS via CDN (config in `index.html`)
- **Key Libraries**: SweetAlert2 (dialogs), ReactQuill (rich text), Recharts (charts), Lucide React (icons)

**Critical**: This app uses ESM imports from `esm.sh` CDN (see `index.html` importmap). No bundler output - runs directly in browser.

## Core Data Model (`types.ts`)

```typescript
Task {
  id: string           // Generated via crypto.randomUUID() or fallback
  title: string
  responsible: string  // Free-text, auto-added to dropdown
  observations: string // Rich HTML from ReactQuill
  status: 'pendiente' | 'en_proceso' | 'completada'
  createdAt: number    // Unix timestamp
  attachments: Attachment[]
}
```

**Storage Keys** (NEVER change - breaks data):
- `emibytes_task_storage_v1` - tasks array
- `emibytes_responsible_storage_v1` - responsible names array

## Component Architecture

**App.tsx** - Central orchestrator
- Manages all state (tasks, view mode, selected task)
- Implements search filtering (title/responsible only)
- Handles theme detection via MutationObserver on `<html class="dark">`
- Uses SweetAlert2 for all confirmations (delete, success toasts)

**View Flow**:
1. Dashboard (charts + recent tasks) OR TaskList (full table)
2. TaskForm (modal) - creates new tasks
3. TaskDetail (modal) - edits observations + status

**Mobile Nav**: Fixed bottom floating pill with Dashboard/Tasks toggle

## Brand & Styling Conventions

**Color System** (in `index.html` Tailwind config):
- Primary: `#138b52` (green) - CTAs, completed status
- Secondary: `#333333` (dark gray) - text
- Backgrounds: `#f8fafc` (light), `#1a1a1a` (dark)
- Cards: `white` / `#2d2d2d` (dark mode)

**UI Patterns**:
- **Rounded corners**: `rounded-2xl` (16px), `rounded-3xl` (24px), `rounded-[32px]` for cards
- **Shadows**: `shadow-lg`, `shadow-xl` on cards
- **Typography**: `font-black` for headers, `font-bold` for labels, `font-medium` for body
- **Transitions**: Always include `transition-all` or `transition-colors`
- **Dark mode**: Uses `dark:` variants extensively - check all color/border classes

**Logo Usage**:
- `/logo-dark.png` - Logo para modo oscuro (sidebar)
- `/logo.png` - Logo pequeño/icono (headers, badges)
- `/logo-preloader.png` - Logo para headers de modales y watermarks
- Ubicación: directorio `public/` en la raíz del proyecto
- Always provide `onError` handlers with fallback icons

## Development Workflow

**Commands** (uses pnpm - required):
```bash
pnpm install     # Install dependencies
pnpm dev         # Start dev server (localhost:3000)
pnpm build       # Build for production
pnpm preview     # Preview production build
```

**Important**: This project uses pnpm, not npm. The `package.json` is configured for pnpm compatibility.

**Dev Server**: Vite runs on port 3000, host `0.0.0.0` (see `vite.config.ts`)

**No Hot Reload Issues**: Since dependencies come from CDN, only local TS/TSX files need reload

**React 19 Compatibility**: Uses `react-quill-new@^3.7.0` for React 19 support (official react-quill 2.x has compatibility issues)

## Key Implementation Patterns

### State Updates with Service Layer
Always use `taskService` methods, then refresh local state:
```typescript
const updatedTasks = taskService.updateTask(id, updates);
setTasks(updatedTasks);
```

### SweetAlert2 Integration
Match theme colors in confirmations:
```typescript
Swal.fire({
  background: isDark ? '#2d2d2d' : '#ffffff',
  color: isDark ? '#ffffff' : '#333333',
  confirmButtonColor: '#138b52',
  // ...
});
```

### Rich Text Editing
ReactQuill modules are standardized (see `TaskForm.tsx`, `TaskDetail.tsx`):
```typescript
const modules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']
  ]
};
```
Custom styling in `index.html` (`.ql-toolbar`, `.ql-container`) - max-height 180px to prevent layout breaks

### Responsible Autocomplete
`TaskForm.tsx` implements custom dropdown with:
- Filter-as-you-type (case-insensitive)
- "Create new" option if no exact match
- Auto-save to localStorage via `taskService.addResponsible()`

## Common Gotchas

1. **Image paths**: Assets in `public/` directory - referenced as `/filename.png` (with leading slash)
2. **localStorage parsing**: Always wrap in try/catch (see `taskService.getTasks()`)
3. **Modal z-index**: Forms/details use `z-50` or `z-[100]`, mobile nav uses `z-[80]`
4. **Dark mode**: Check `isDark` state from `<html>` class, not manual toggle
5. **Observations validation**: Empty Quill editor returns `<p><br></p>` - check in validation
6. **Status badges**: Color logic repeated in `TaskList.tsx` and `Dashboard.tsx` - keep consistent

## Integration Points

- **No backend**: Fully client-side, localStorage only
- **No authentication**: Single-user app
- **No external APIs**: Except CDN dependencies (esm.sh, Tailwind CDN, Google Fonts)

## When Adding Features

- Maintain localStorage compatibility (don't break existing data)
- Follow existing SweetAlert2 patterns for user feedback
- Keep mobile-first responsive design (check `lg:` breakpoints)
- Use `lucide-react` for new icons (already imported)
- Preserve brand colors and rounded aesthetic
- Test both light/dark themes
