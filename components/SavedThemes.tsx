
import React from 'react';
import { ColorTheme } from '../types';
import { ThemeCard } from './ThemeCard';

interface SavedThemesProps {
    themes: ColorTheme[];
    onDelete: (id: string) => void;
}

export const SavedThemes: React.FC<SavedThemesProps> = ({ themes, onDelete }) => {
    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-300 mb-6 border-b border-gray-700 pb-2">My Saved Themes</h2>
            {themes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {themes.map(theme => (
                        <ThemeCard key={theme.id} theme={theme} onDelete={onDelete} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 px-6 bg-gray-800 rounded-2xl border border-dashed border-gray-700">
                    <p className="text-gray-500">You haven't saved any themes yet.</p>
                    <p className="text-gray-500 text-sm mt-1">Use the extractor above to get started!</p>
                </div>
            )}
        </div>
    );
};
