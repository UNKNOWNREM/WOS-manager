import React from 'react';
import { Globe } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export function LanguageSwitcher() {
    const [language, setLanguage] = useLocalStorage<'en' | 'zh-TW'>('app_language', 'en');
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 transition-colors"
            >
                <Globe size={16} />
                <span>{language === 'en' ? 'English' : '繁體中文'}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <button
                        onClick={() => {
                            setLanguage('en');
                            setIsOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${language === 'en' ? 'text-indigo-400 bg-indigo-900/10' : 'text-slate-300'
                            }`}
                    >
                        English
                    </button>
                    <button
                        onClick={() => {
                            setLanguage('zh-TW');
                            setIsOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${language === 'zh-TW' ? 'text-indigo-400 bg-indigo-900/10' : 'text-slate-300'
                            }`}
                    >
                        繁體中文
                    </button>
                </div>
            )}

            {/* Backdrop to close on click outside */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
