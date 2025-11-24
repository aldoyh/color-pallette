import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { InputArea } from './components/InputArea';
import { PaletteDisplay } from './components/PaletteDisplay';
import { SavedThemes } from './components/SavedThemes';
import { ColorTheme, InputType } from './types';
import { extractPaletteFromCss, extractPaletteFromUrl, extractPaletteFromImage, generateThemeName } from './services/geminiService';
import { SpinnerIcon } from './components/Icons';
import { sampleThemes } from './data/sampleThemes';

const App: React.FC = () => {
    const [themes, setThemes] = useState<ColorTheme[]>([]);
    const [extractedPalette, setExtractedPalette] = useState<string[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const savedThemesJSON = localStorage.getItem('chroma-ai-themes');
            if (savedThemesJSON) {
                setThemes(JSON.parse(savedThemesJSON));
            } else {
                setThemes(sampleThemes);
            }
        } catch (e) {
            console.error("Failed to load themes from localStorage", e);
            setError("Could not load your saved themes.");
            setThemes(sampleThemes); // Fallback to samples on parse error
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('chroma-ai-themes', JSON.stringify(themes));
        } catch (e) {
            console.error("Failed to save themes to localStorage", e);
            setError("Could not save your themes.");
        }
    }, [themes]);

    const handleExtract = useCallback(async (type: InputType, data: string | File) => {
        setIsLoading(true);
        setError(null);
        setExtractedPalette(null);
        try {
            let palette: string[] | null = null;
            if (type === 'css' && typeof data === 'string') {
                palette = await extractPaletteFromCss(data);
            } else if (type === 'url' && typeof data === 'string') {
                palette = await extractPaletteFromUrl(data);
            } else if (type === 'image' && data instanceof File) {
                palette = await extractPaletteFromImage(data);
            }
            
            if (palette) {
                setExtractedPalette(palette);
            } else {
                setError("AI could not extract a palette. Please try a different input.");
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An unknown error occurred during extraction.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSaveTheme = useCallback(async () => {
        if (!extractedPalette) return;

        setIsSaving(true);
        let suggestedName = `Theme #${themes.length + 1}`;
        try {
            const aiName = await generateThemeName(extractedPalette);
            if (aiName) {
                suggestedName = aiName;
            }
        } catch (err) {
            console.error("AI name generation failed:", err);
            // Fallback to default name, do not alert user.
        }

        setIsSaving(false);
        const finalName = prompt("Enter a name for this theme:", suggestedName);

        if (finalName !== null) { // User clicked OK
            const newTheme: ColorTheme = {
                id: crypto.randomUUID(),
                name: finalName.trim() || suggestedName,
                colors: extractedPalette,
                createdAt: new Date().toISOString(),
            };
            setThemes(prevThemes => [newTheme, ...prevThemes]);
            setExtractedPalette(null);
        }
    }, [extractedPalette, themes]);

    const handleDeleteTheme = useCallback((id: string) => {
        setThemes(prevThemes => prevThemes.filter(theme => theme.id !== id));
    }, []);
    
    const handleClearExtracted = useCallback(() => {
        setExtractedPalette(null);
        setError(null);
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <Header />
                <main className="mt-8">
                    <InputArea onExtract={handleExtract} isLoading={isLoading} />
                    
                    {error && (
                        <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
                            <p><strong>Error:</strong> {error}</p>
                        </div>
                    )}

                    {extractedPalette && !isLoading && (
                        <div className="mt-8 p-6 bg-gray-800 rounded-2xl border border-gray-700 shadow-lg">
                            <div className="flex justify-between items-center mb-4">
                               <h2 className="text-xl font-bold text-cyan-300">Extracted Palette</h2>
                                <button
                                    onClick={handleClearExtracted}
                                    className="text-gray-400 hover:text-white transition-colors"
                                    aria-label="Clear extracted palette"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <PaletteDisplay colors={extractedPalette} />
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={handleSaveTheme}
                                    disabled={isSaving}
                                    className="flex items-center justify-center gap-2 px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100"
                                >
                                    {isSaving && <SpinnerIcon />}
                                    {isSaving ? 'Naming...' : 'Save Theme'}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <SavedThemes themes={themes} onDelete={handleDeleteTheme} />
                </main>
            </div>
        </div>
    );
};

export default App;
