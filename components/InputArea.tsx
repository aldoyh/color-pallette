
import React, { useState, useCallback, useRef } from 'react';
import { InputType } from '../types';
import { SpinnerIcon, CssIcon, UrlIcon, ImageIcon } from './Icons';

interface InputAreaProps {
    onExtract: (type: InputType, data: string | File) => void;
    isLoading: boolean;
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-sm sm:text-base font-semibold rounded-t-lg transition-all duration-300 border-b-2 ${
            active
                ? 'text-cyan-300 border-cyan-400'
                : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-700/50'
        }`}
    >
        {children}
    </button>
);

export const InputArea: React.FC<InputAreaProps> = ({ onExtract, isLoading }) => {
    const [activeTab, setActiveTab] = useState<InputType>('css');
    const [cssValue, setCssValue] = useState('');
    const [urlValue, setUrlValue] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleExtractClick = useCallback(() => {
        if (isLoading) return;

        if (activeTab === 'css' && cssValue.trim()) {
            onExtract('css', cssValue);
        } else if (activeTab === 'url' && urlValue.trim()) {
            onExtract('url', urlValue);
        } else if (activeTab === 'image' && imageFile) {
            onExtract('image', imageFile);
        }
    }, [activeTab, cssValue, urlValue, imageFile, isLoading, onExtract]);

    const isSubmitDisabled = 
        isLoading ||
        (activeTab === 'css' && !cssValue.trim()) ||
        (activeTab === 'url' && !urlValue.trim()) ||
        (activeTab === 'image' && !imageFile);

    return (
        <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
            <div className="px-4 pt-2 border-b border-gray-700 flex items-center space-x-2">
                <TabButton active={activeTab === 'css'} onClick={() => setActiveTab('css')}>
                    <CssIcon /> CSS
                </TabButton>
                <TabButton active={activeTab === 'url'} onClick={() => setActiveTab('url')}>
                    <UrlIcon /> URL
                </TabButton>
                <TabButton active={activeTab === 'image'} onClick={() => setActiveTab('image')}>
                    <ImageIcon /> Image
                </TabButton>
            </div>

            <div className="p-6">
                {activeTab === 'css' && (
                    <div>
                        <label htmlFor="css-input" className="block text-sm font-medium text-gray-300 mb-2">Paste your CSS code</label>
                        <textarea
                            id="css-input"
                            value={cssValue}
                            onChange={(e) => setCssValue(e.target.value)}
                            placeholder="e.g., body { background-color: #0d1117; color: #c9d1d9; }"
                            className="w-full h-40 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-sm font-mono"
                            disabled={isLoading}
                        />
                    </div>
                )}
                {activeTab === 'url' && (
                     <div>
                        <label htmlFor="url-input" className="block text-sm font-medium text-gray-300 mb-2">Enter a website URL</label>
                        <input
                            id="url-input"
                            type="text"
                            value={urlValue}
                            onChange={(e) => setUrlValue(e.target.value)}
                            placeholder="e.g., https://github.com"
                            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-sm"
                            disabled={isLoading}
                        />
                         <p className="text-xs text-gray-500 mt-2">Note: The AI will generate a palette based on its understanding of the brand at this URL, as it cannot access live websites.</p>
                    </div>
                )}
                {activeTab === 'image' && (
                     <div className="text-center">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/png, image/jpeg, image/webp"
                            className="hidden"
                            disabled={isLoading}
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-48 bg-gray-900 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-cyan-500 transition-colors"
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
                            ) : (
                                <div className="text-gray-500">
                                    <ImageIcon className="mx-auto h-8 w-8"/>
                                    <p className="mt-2 text-sm">Click to upload an image</p>
                                    <p className="text-xs">PNG, JPG, WEBP</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleExtractClick}
                        disabled={isSubmitDisabled}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-cyan-500 text-gray-900 font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {isLoading && <SpinnerIcon />}
                        {isLoading ? 'Extracting...' : 'Extract Colors'}
                    </button>
                </div>
            </div>
        </div>
    );
};

