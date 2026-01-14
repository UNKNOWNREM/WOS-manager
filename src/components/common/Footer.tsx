import React from 'react';
import { SupportButton, SourceCodeButton } from '../SupportButton';

interface FooterProps {
    className?: string;
    showNote?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ className = '', showNote = true }) => {
    return (
        <footer className={`mt-auto py-6 text-center ${className}`}>
            <div className="flex flex-col items-center gap-3">
                {showNote && (
                    <div className="text-white/20 text-xs">
                        Data stored locally in browser
                    </div>
                )}
                <div className="flex justify-center gap-3">
                    <SourceCodeButton variant="inline" />
                    <SupportButton variant="inline" />
                </div>
            </div>
        </footer>
    );
};
