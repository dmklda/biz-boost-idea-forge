
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n/config.ts';
import { CompareIdeasModalProvider } from './components/ideas/CompareIdeasModal';

// Envolver o App com o CompareIdeasModalProvider para disponibilizar a funcionalidade de comparação em toda a aplicação
createRoot(document.getElementById("root")!).render(
  <CompareIdeasModalProvider>
    <App />
  </CompareIdeasModalProvider>
);
