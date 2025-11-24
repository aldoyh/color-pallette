
import React, { useState } from 'react';

interface PaletteDisplayProps {
    colors: string[];
}

export const PaletteDisplay: React.FC<PaletteDisplayProps> = ({ colors }) => {
    const [copiedColor, setCopiedColor] = useState<string | null>(null);

    const handleCopy = (color: string) => {
        navigator.clipboard.writeText(color);
        setCopiedColor(color);
        setTimeout(() => setCopiedColor(null), 1500);
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {colors.map((color, index) => (
                <div
                    key={index}
                    onClick={() => handleCopy(color)}
                    className="relative h-24 rounded-lg cursor-pointer group transform transition-transform duration-200 hover:scale-105 shadow-md"
                    style={{ backgroundColor: color }}
                >
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center rounded-lg">
                         <span className="text-white font-mono text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            {copiedColor === color ? 'Copied!' : color}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};
