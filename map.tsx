import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import BuildingManager from './src/pages/BuildingManager';
import ErrorBoundary from './src/components/ErrorBoundary';
import './src/index.css';

// Error listeners moved to HTML head for earlier execution

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <BuildingManager />
      </ErrorBoundary>
    </StrictMode>
  );
}
