import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import BuildingManager from '../BuildingManager';
import ErrorBoundary from '../../components/ErrorBoundary';
import '../../index.css';

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
