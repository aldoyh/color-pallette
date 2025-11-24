
import React from 'react';
import { ColorTheme } from '../types';
import { PaletteDisplay } from './PaletteDisplay';
import { TrashIcon } from './Icons';

interface ThemeCardProps {
    theme: ColorTheme;
    onDelete: (id: string) => void;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({ theme, onDelete }) => {
    return (
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5 flex flex-col gap-4 shadow-lg hover:border-cyan-500/50 transition-all duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-white">{theme.name}</h3>
                    <p className="text-xs text-gray-500">
                        Saved on {new Date(theme.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <button
                    onClick={() => onDelete(theme.id)}
                    className="p-1.5 rounded-full text-gray-500 hover:bg-red-900/50 hover:text-red-400 transition-colors"
                    aria-label="Delete theme"
                >
                    <TrashIcon />
                </button>
            </div>
            <PaletteDisplay colors={theme.colors} />
        </div>
    );
};
