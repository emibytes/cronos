
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Inicializar tema antes de renderizar
const initializeTheme = () => {
  const root = window.document.documentElement;
  const savedTheme = localStorage.getItem('theme');
  
  // Priorizar el tema guardado, luego preferencia del sistema, por defecto dark
  const shouldBeDark = savedTheme === 'dark' || 
    (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) ||
    !savedTheme;
  
  if (shouldBeDark) {
    root.classList.add('dark');
    if (!savedTheme) {
      localStorage.setItem('theme', 'dark');
    }
  } else {
    root.classList.remove('dark');
  }
};

initializeTheme();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
