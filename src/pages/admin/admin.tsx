import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AdminDashboard from '../AdminDashboard.tsx';
import '../../index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            <AdminDashboard />
        </StrictMode>
    );
}
