import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AdminDashboard from './src/pages/AdminDashboard.tsx';
import './src/index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            <AdminDashboard />
        </StrictMode>
    );
}
