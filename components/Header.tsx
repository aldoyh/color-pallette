
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-200">
                Chroma AI
            </h1>
            <p className="mt-2 text-lg text-gray-400 max-w-2xl mx-auto">
                Extract beautiful color palettes from CSS, URLs, or images with the power of AI.
            </p>
        </header>
    );
};
