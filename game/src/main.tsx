import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initI18n } from './i18n';
import { App } from './ui/App';
import './ui/global.css';

initI18n();

const container = document.getElementById('root');
if (container === null) {
  throw new Error('index.html has no #root element');
}
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
