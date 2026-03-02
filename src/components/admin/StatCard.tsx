import React from 'react';

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color?: string;
    bgColor?: string;
}

export function StatCard({ title, value, icon, color = 'text-gray-300', bgColor = 'bg-slate-800' }: StatCardProps) {
    return (
        <div className={`${bgColor} rounded-lg border border-slate-700 p-4`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">{title}</span>
                <div className={color}>{icon}</div>
            </div>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
        </div>
    );
}
