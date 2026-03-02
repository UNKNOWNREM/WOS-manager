import React, { ReactNode } from 'react';

interface HeaderProps {
    title: string;
    subtitle?: string | ReactNode;
    icon?: ReactNode;
    actions?: ReactNode;
    className?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, icon, actions, className = '' }) => {
    return (
        <header className={`bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-50 mb-6 ${className}`}>
            <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Logo / Title Section */}
                <div className="flex items-center gap-3 shrink-0">
                    {icon && (
                        <div className="p-2 bg-indigo-600 rounded-lg shrink-0 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h1 className="text-xl font-bold text-slate-100 tracking-tight leading-tight">{title}</h1>
                        {subtitle && <p className="text-slate-400 text-xs font-medium">{subtitle}</p>}
                    </div>
                </div>

                {/* Actions Section */}
                {actions && (
                    <div className="flex items-center gap-3 flex-wrap md:justify-end">
                        {actions}
                    </div>
                )}
            </div>
        </header>
    );
};
