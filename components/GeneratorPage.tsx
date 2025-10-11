import React, { useState, useEffect } from 'react';
import type { UploadFile, HeadshotStyle, GeneratedImage, Package, User } from '../types';
import { AppStep } from '../types';
import { STYLES } from '../constants';
import { suggestStyle, generateHeadshots, GenerationError } from '../services/geminiService';
import { ArrowRightIcon, DownloadIcon, HeartIcon, SparklesIcon, UploadIcon, CheckCircleIcon, XCircleIcon, StyleGridIcon } from './Icons';
import Spinner from './Spinner';
import { getErrorMessage } from '../utils';

// ============================================================================
//  Dashboard Sub-Components
// ============================================================================

const Stepper = ({ currentStep }: { currentStep: AppStep }) => {
    const steps = [
        { id: AppStep.UPLOAD, name: 'Upload' },
        { id: AppStep.STYLE, name: 'Style' },
        { id: AppStep.GENERATING, name: 'Generate' },
        { id: AppStep.GALLERY, name: 'View Gallery' },
    ];
    
    const currentStepIndex = steps.findIndex(s => s.id === currentStep);

    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                    <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                        {stepIdx < currentStepIndex ? (
                             <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="h-0.5 w-full bg-brand-primary" /></div>
                                <span className="relative flex h-8 w-8 items-center justify-center bg-brand-primary rounded-full"><CheckCircleIcon className="h-5 w-5 text-white" aria-hidden="true" /></span>
                             </>
                        ) : stepIdx === currentStepIndex ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="h-0.5 w-full bg-gray-700" /></div>
                                <span className="relative flex h-8 w-8 items-center justify-center bg-brand-dark border-2 border-brand-primary rounded-full" aria-current="step"><span className="h-2.5 w-2.5 bg-brand-primary rounded-full" aria-hidden="true" /></span>
                            </>
                        ) : (
                             <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="h-0.5 w-full bg-gray-700" /></div>
                                <span className="group relative flex h-8 w-8 items-center justify-center bg-brand-dark border-2 border-gray-700 rounded-full" />
                             </>
                        )}
                         <span className="absolute top-10 -left-2 w-16 text-center text-sm font-medium text-gray-400">{step.name}</span>
                    </li>
                ))}
            </ol>
        </nav>
    );
};


const PhotoUploader = ({ files, setFiles, onFilesConfirmed }: { files: UploadFile[], setFiles: (files: UploadFile[]) => void, onFilesConfirmed: () => void }) => {
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files)
                .slice(0, 10 - files.length)
                .map((file: File) => ({
                    file,
                    preview: URL.createObjectURL(file),
                    id: `${file.name}-${Date.now()}`
                }));
            setFiles([...files, ...newFiles]);
        }
    };
    
    const handleRemoveFile = (id: string) => {
        setFiles(files.filter(f => f.id !== id));
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-8 bg-brand-gray/50 rounded-2xl shadow-2xl border border-brand-primary/20">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white">Upload Your Photos</h2>
                <p className="text-gray-400 mt-2">Upload 5-10 recent photos. For best results, use a variety of angles and expressions.</p>
            </div>
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center bg-brand-dark/50 hover:border-brand-primary transition-colors">
                <input type="file" multiple accept="image/png, image/jpeg" onChange={handleFileChange} className="hidden" id="file-upload" disabled={files.length >= 10} />
                <label htmlFor="file-upload" className={`cursor-pointer flex flex-col items-center ${files.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <UploadIcon className="w-12 h-12 text-gray-500 mb-4" />
                    <span className="font-semibold text-brand-primary">Click to browse</span>
                    <p className="text-xs text-gray-500 mt-1">PNG or JPG | {files.length}/10 photos selected</p>
                </label>
            </div>
            {files.length > 0 && (
                <div className="mt-6">
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                        {files.map(f => (
                            <div key={f.id} className="relative aspect-square group">
                                <img src={f.preview} alt="preview" className="w-full h-full object-cover rounded-lg shadow-md" />
                                <button onClick={() => handleRemoveFile(f.id)} className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <XCircleIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        ))}
                    </div>
                    <button onClick={onFilesConfirmed} disabled={files.length < 5} className="w-full mt-8 py-3 px-6 bg-brand-primary text-brand-dark text-lg font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-brand-secondary transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100">
                        {files.length < 5 ? `Upload ${5 - files.length} more` : 'Continue to Style Selection'}
                        {files.length >= 5 && <ArrowRightIcon className="w-6 h-6" />}
                    </button>
                </div>
            )}
        </div>
    );
};

const StyleSelector = ({ userPackage, onStylesSelected, removePiercings, setRemovePiercings }: { userPackage: Package | null, onStylesSelected: (styles: HeadshotStyle[], count: number, removePiercings: boolean) => void, removePiercings: boolean, setRemovePiercings: (val: boolean) => void }) => {
    const [profession, setProfession] = useState('');
    const [suggestion, setSuggestion] = useState<HeadshotStyle | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedStyles, setSelectedStyles] = useState<HeadshotStyle[]>([]);
    
    const maxStyles = userPackage === 'PRO' ? 5 : 2;
    const maxImages = userPackage === 'PRO' ? 100 : 20;
    const [imageCount, setImageCount] = useState(userPackage === 'PRO' ? 40 : 10);

    const handleSuggestion = async () => {
        if (!profession) return;
        setIsLoading(true);
        const suggested = await suggestStyle(profession);
        setSuggestion(suggested);
        setIsLoading(false);
    };
    
    const handleStyleClick = (style: HeadshotStyle) => {
        setSelectedStyles(prev => {
            const isSelected = prev.find(s => s.id === style.id);
            if (isSelected) return prev.filter(s => s.id !== style.id);
            if (prev.length < maxStyles) return [...prev, style];
            return prev;
        });
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-8 bg-brand-gray/50 rounded-2xl shadow-2xl border border-brand-primary/20">
            <h2 className="text-3xl font-bold text-center text-white mb-2">Configure Your Session</h2>
            <p className="text-gray-400 text-center mb-8">
                Your <span className={`font-bold ${userPackage === 'PRO' ? 'text-brand-primary' : 'text-brand-secondary'}`}>{userPackage || 'Starter'}</span> plan allows up to <span className="font-bold text-white">{maxStyles}</span> style{maxStyles > 1 ? 's' : ''} and <span className="font-bold text-white">{maxImages}</span> headshots.
            </p>

            <div className="mb-8 p-6 bg-brand-dark/50 rounded-xl border border-brand-primary/30">
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2"><SparklesIcon className="w-6 h-6 text-brand-primary" /> AI Style Assistant</h3>
                <p className="text-gray-400 mb-4">Describe your profession or desired vibe, and we'll suggest the perfect style.</p>
                <div className="flex gap-2">
                    <input type="text" value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="e.g., 'Software Engineer' or 'Friendly and confident'" className="flex-grow bg-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                    <button onClick={handleSuggestion} disabled={isLoading || !profession} className="px-6 py-2 bg-brand-primary text-brand-dark font-bold rounded-lg hover:bg-brand-secondary disabled:bg-gray-600 transition-colors flex items-center justify-center w-28">
                        {isLoading ? <Spinner size="5" className="border-brand-dark border-t-transparent" /> : 'Suggest'}
                    </button>
                </div>
                {suggestion && (
                    <div className="mt-4 p-4 bg-green-900/50 border border-green-500 rounded-lg text-center">
                        <p className="text-white">We suggest the <span className="font-bold text-brand-secondary">{suggestion.name}</span> style!</p>
                    </div>
                )}
            </div>
            
            <h3 className="text-xl font-semibold text-center text-white mb-2">Select Your Style(s)</h3>
            <p className="text-gray-400 text-center mb-6">({selectedStyles.length}/{maxStyles} selected)</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {STYLES.map(style => {
                    const isSelected = selectedStyles.some(s => s.id === style.id);
                    return (
                        <div key={style.id} onClick={() => handleStyleClick(style)} className={`bg-brand-dark rounded-xl overflow-hidden border-2 transition-all transform hover:-translate-y-2 cursor-pointer ${ isSelected ? 'border-brand-primary shadow-lg shadow-brand-primary/20' : suggestion?.id === style.id ? 'border-brand-secondary' : 'border-gray-700 hover:border-brand-primary/50'}`}>
                            <div className="relative">
                                <img src={style.imageUrl} alt={style.name} className="w-full h-48 object-cover" />
                                {isSelected && <div className="absolute inset-0 bg-brand-primary/30 flex items-center justify-center"><CheckCircleIcon className="w-16 h-16 text-white/80" /></div>}
                            </div>
                            <div className="p-4">
                                <h3 className="text-xl font-bold text-white">{style.name}</h3>
                                <p className="text-gray-400 text-sm mt-1">{style.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {selectedStyles.length > 0 && (
                <div className="mt-8 pt-8 border-t border-brand-primary/20">
                    <h3 className="text-xl font-semibold text-center text-white mb-2">Choose Quantity & Options</h3>
                     <p className="text-gray-400 text-center mb-6">Select the total number of headshots and other preferences.</p>
                    <div className="flex items-center justify-center gap-6 max-w-lg mx-auto">
                        <input type="range" min={4} max={maxImages} value={imageCount} onChange={(e) => setImageCount(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-primary" />
                        <span className="text-2xl font-bold text-white bg-brand-dark/50 px-4 py-1 rounded-lg w-24 text-center">{imageCount}</span>
                    </div>
                    <div className="flex items-center justify-center mt-6">
                        <input type="checkbox" id="remove-piercings" checked={removePiercings} onChange={(e) => setRemovePiercings(e.target.checked)} className="h-4 w-4 text-brand-primary bg-gray-800 border-gray-600 rounded focus:ring-brand-primary" />
                        <label htmlFor="remove-piercings" className="ml-2 text-gray-300">Remove facial piercings (e.g., nose rings)</label>
                    </div>
                </div>
            )}

             <button onClick={() => onStylesSelected(selectedStyles, imageCount, removePiercings)} disabled={selectedStyles.length === 0} className="w-full max-w-md mx-auto mt-10 py-3 px-6 bg-brand-primary text-brand-dark text-lg font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-brand-secondary transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100">
                Generate Headshots <ArrowRightIcon className="w-6 h-6" />
            </button>
        </div>
    );
};

const GeneratingView = ({ message }: { message: string }) => (
    <div className="text-center p-8 bg-brand-gray/50 rounded-2xl shadow-2xl border border-brand-primary/20 flex flex-col items-center justify-center min-h-[400px]">
        <Spinner size="16" />
        <h2 className="text-3xl font-bold text-white mt-8">Generating Your Headshots</h2>
        <p className="text-gray-300 mt-2 text-lg">{message}</p>
    </div>
);

const GenerationErrorView = ({ message, onRetry, onStartOver }: { message: string, onRetry: () => void, onStartOver: () => void }) => (
    <div className="text-center p-8 bg-red-900/30 rounded-2xl shadow-2xl border border-red-500/50 flex flex-col items-center justify-center min-h-[400px]">
        <XCircleIcon className="w-16 h-16 text-red-400" />
        <h2 className="text-3xl font-bold text-white mt-6">Generation Failed</h2>
        <p className="text-red-200 mt-2 text-lg max-w-lg mx-auto">{message}</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button onClick={onRetry} className="py-3 px-8 bg-brand-primary text-brand-dark font-bold rounded-lg hover:bg-brand-secondary transition-colors">Try Again</button>
            <button onClick={onStartOver} className="py-3 px-8 bg-brand-gray text-white font-bold rounded-lg hover:bg-gray-600 transition-colors">Start Over</button>
        </div>
    </div>
);


const Gallery = ({ images, onReset }: { images: GeneratedImage[], onReset: () => void }) => {
    const [galleryImages, setGalleryImages] = useState(images);
    const [isDownloading, setIsDownloading] = useState(false);
    
    const toggleFavorite = (id: string) => {
        setGalleryImages(prevImages => prevImages.map(img => img.id === id ? { ...img, isFavorite: !img.isFavorite } : img));
    };
    
    const handleDownloadAll = async () => {
        if (isDownloading) return;
        setIsDownloading(true);
        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        for (const image of galleryImages) {
            const link = document.createElement('a');
            link.href = image.src;
            link.download = `stature-ai-headshot-${image.id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            await sleep(300);
        }
        setIsDownloading(false);
    };

    const groupedImages: Record<string, GeneratedImage[]> = {};
    for (const image of galleryImages) {
        const style = image.styleName || 'General';
        if (!groupedImages[style]) groupedImages[style] = [];
        groupedImages[style].push(image);
    }
    
    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-extrabold text-white">Your AI Headshots are Ready!</h2>
                <p className="text-gray-400 mt-2">Favorite and download your new professional look.</p>
            </div>
            
            {Object.entries(groupedImages).map(([styleName, images]) => (
                <section key={styleName} className="mb-16">
                    <h3 className="text-3xl font-bold text-white mb-6 pb-2 border-b-2 border-brand-primary/30">{styleName} Style</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {images.map(image => (
                            <div key={image.id} className="group relative aspect-square overflow-hidden rounded-xl shadow-lg">
                                <img src={image.src} alt={`Generated Headshot in ${styleName} style`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                    <button onClick={() => toggleFavorite(image.id)} className="p-3 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-sm transition-colors" aria-label="Favorite"><HeartIcon className={`w-6 h-6 ${image.isFavorite ? 'text-red-500' : 'text-white'}`} filled={image.isFavorite} /></button>
                                    <a href={image.src} download={`stature-ai-headshot-${image.id}.png`} className="p-3 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-sm transition-colors" aria-label="Download"><DownloadIcon className="w-6 h-6 text-white" /></a>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}

            <div className="mt-12 text-center flex flex-col sm:flex-row justify-center gap-4">
                 <button onClick={handleDownloadAll} disabled={isDownloading} className="py-3 px-8 bg-brand-primary text-brand-dark text-lg font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-brand-secondary transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed">
                    {isDownloading ? <><Spinner size="6" className="border-brand-dark border-t-transparent" /><span>Downloading...</span></> : <><DownloadIcon className="w-6 h-6" /> Download All</>}
                </button>
                <button onClick={onReset} className="py-3 px-8 bg-brand-gray text-white text-lg font-bold rounded-lg hover:bg-gray-600 transition-colors">Start Over</button>
            </div>
        </div>
    );
};

const CreditsDisplay = ({ credits }: { credits: number }) => (
    <div className="bg-brand-gray/50 border border-brand-primary/20 rounded-lg p-4 flex items-center justify-between mb-8">
        <div>
            <p className="text-gray-400 text-sm">Credits Remaining</p>
            <p className="text-2xl font-bold text-white">{credits}</p>
        </div>
        <button className="bg-brand-primary text-brand-dark font-semibold py-2 px-5 rounded-lg hover:bg-brand-secondary transition-colors">Buy More Credits</button>
    </div>
);


// ============================================================================
//  GeneratorPage Main Component
// ============================================================================

const GeneratorPage = ({ user, userPackage }: { user: User | null; userPackage: Package | null }) => {
    const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
    const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
    const [selectedStyles, setSelectedStyles] = useState<HeadshotStyle[]>([]);
    const [imageCount, setImageCount] = useState(0);
    const [removePiercings, setRemovePiercings] = useState(true);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [generationError, setGenerationError] = useState<string | null>(null);

    const generationMessages = ["Analyzing your photos...","Calibrating the AI model...","Crafting your professional look...","Applying finishing touches...","Almost there..."];

    useEffect(() => {
        let interval: number;
        if (step === AppStep.GENERATING && selectedStyles.length <= 1) {
            let i = 0;
            setLoadingMessage(generationMessages[i]);
            interval = window.setInterval(() => {
                i = (i + 1) % generationMessages.length;
                setLoadingMessage(generationMessages[i]);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [step, selectedStyles]);

    const handleFilesConfirmed = () => {
        setStep(AppStep.STYLE);
    };

    const handleStylesSelected = async (styles: HeadshotStyle[], count: number, piercings: boolean) => {
        setGenerationError(null);
        setSelectedStyles(styles);
        setImageCount(count);
        setRemovePiercings(piercings);
        setStep(AppStep.GENERATING);
        
        const filesToProcess = uploadedFiles.map(f => f.file);
        let allGeneratedImages: GeneratedImage[] = [];
        
        const imagesPerStyle = Math.floor(count / styles.length);
        const remainder = count % styles.length;
        const countsPerStyle = styles.map((_, index) => imagesPerStyle + (index < remainder ? 1 : 0));

        try {
            for (const [index, style] of styles.entries()) {
                 if (styles.length > 1) {
                    setLoadingMessage(`(${index + 1}/${styles.length}) Generating ${countsPerStyle[index]} images for '${style.name}' style...`);
                }
                const images = await generateHeadshots(filesToProcess, style, countsPerStyle[index], piercings);
                const styledImages = images.map((imgSrc, i) => ({
                    id: `${style.id}-${i}-${Date.now()}`,
                    src: imgSrc,
                    isFavorite: false,
                    styleName: style.name,
                }));
                allGeneratedImages = [...allGeneratedImages, ...styledImages];
            }
             setGeneratedImages(allGeneratedImages);
             setStep(AppStep.GALLERY);
        } catch (error) {
            setGenerationError(getErrorMessage(error));
        }
    };

    const handleReset = () => {
        setUploadedFiles([]);
        setSelectedStyles([]);
        setGeneratedImages([]);
        setGenerationError(null);
        setStep(AppStep.UPLOAD);
    };

    const renderStepContent = () => {
        switch (step) {
            case AppStep.UPLOAD: return <PhotoUploader files={uploadedFiles} setFiles={setUploadedFiles} onFilesConfirmed={handleFilesConfirmed} />;
            case AppStep.STYLE: return <StyleSelector userPackage={userPackage} onStylesSelected={handleStylesSelected} removePiercings={removePiercings} setRemovePiercings={setRemovePiercings} />;
            case AppStep.GENERATING: 
                if (generationError) {
                    return <GenerationErrorView 
                        message={generationError}
                        onRetry={() => handleStylesSelected(selectedStyles, imageCount, removePiercings)}
                        onStartOver={handleReset}
                    />
                }
                return <GeneratingView message={loadingMessage} />;
            case AppStep.GALLERY: return <Gallery images={generatedImages} onReset={handleReset} />;
            default: return <PhotoUploader files={uploadedFiles} setFiles={setUploadedFiles} onFilesConfirmed={handleFilesConfirmed} />;
        }
    }

    return (
        <div className="py-12">
            {user && <CreditsDisplay credits={user.credits} />}
            <div className="mb-16 flex justify-center">
                 <Stepper currentStep={step} />
            </div>
            {renderStepContent()}
        </div>
    )
};

export default GeneratorPage;
