import React, { useState, useEffect } from 'react';
import type { UploadFile, HeadshotStyle, GeneratedImage, View, Package, User, Order } from './types';
import { AppStep } from './types';
import { STYLES, LANDING_GALLERY_IMAGES } from './constants';
import { suggestStyle, generateHeadshots, GenerationError } from './services/geminiService';
import { ArrowRightIcon, DownloadIcon, HeartIcon, SparklesIcon, UploadIcon, CheckCircleIcon, XCircleIcon, UserCircleIcon, StyleGridIcon } from './components/Icons';
import Spinner from './components/Spinner';

// ============================================================================
//  New & Shared Components
// ============================================================================

const Logo = () => (
    <div className="flex items-center gap-3" aria-label="StatureAI Home">
        <div className="bg-black p-1.5 rounded-lg border border-brand-primary/20">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#D4AF37" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M4 2H20C21.1046 2 22 2.89543 22 4V20C22 21.1046 21.1046 22 20 22H4C2.89543 22 2 21.1046 2 20V4C2 2.89543 2.89543 2 4 2ZM18 20V22H6V20H18ZM19 4H5C4.44772 4 4 4.44772 4 5V19C4 19.5523 4.44772 20 5 20H6V18H18V20H19C19.5523 20 20 19.5523 20 19V5C20 4.44772 19.5523 4 19 4ZM18 6H6V8H18V6ZM14 9H10V17H14V9Z" fill="#D4AF37"/>
                <path d="M13 9.5C13 10.3284 12.3284 11 11.5 11C10.6716 11 10 11.6716 10 12.5C10 13.3284 10.6716 14 11.5 14H12.5C13.3284 14 14 14.6716 14 15.5C14 16.3284 13.3284 17 12.5 17" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        </div>
        <span className="text-2xl font-bold text-white tracking-wider">
            Stature<span className="text-brand-primary">AI</span>
        </span>
    </div>
);


const Header = ({ currentView, setView, isLoggedIn, onLogout }: { currentView: View; setView: (view: View) => void; isLoggedIn: boolean; onLogout: () => void; }) => (
    <header className="bg-brand-dark/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
            <button onClick={() => setView('LANDING')} className="text-2xl font-bold text-white tracking-wider cursor-pointer">
                <Logo />
            </button>
            <div className="flex items-center space-x-6">
                <a 
                    href="#pricing" 
                    onClick={(e) => {
                        e.preventDefault();
                        if (currentView !== 'LANDING') {
                            setView('LANDING');
                            setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 100);
                        } else {
                             document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}
                    className="text-lg font-medium transition-colors text-gray-300 hover:text-white"
                >
                    Pricing
                </a>
                <button 
                    onClick={() => setView('GENERATOR')}
                    className={`text-lg font-medium transition-colors ${currentView === 'GENERATOR' ? 'text-brand-primary' : 'text-gray-300 hover:text-white'}`}
                >
                    Dashboard
                </button>
                 {isLoggedIn ? (
                    <>
                        <button 
                            onClick={() => setView('ACCOUNT')}
                            className={`flex items-center gap-2 text-lg font-medium transition-colors ${currentView === 'ACCOUNT' ? 'text-brand-primary' : 'text-gray-300 hover:text-white'}`}
                        >
                           <UserCircleIcon className="w-6 h-6" /> Account
                        </button>
                        <button onClick={onLogout} className="bg-gray-700 text-white font-semibold py-2 px-5 rounded-lg hover:bg-gray-600 transition-colors">
                            Logout
                        </button>
                    </>
                ) : (
                    <button onClick={() => setView('LOGIN')} className="bg-brand-primary text-brand-dark font-semibold py-2 px-5 rounded-lg hover:bg-brand-secondary transition-transform transform hover:scale-105">
                        Login
                    </button>
                )}
            </div>
        </nav>
        <div className="h-px bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent"></div>
    </header>
);

const PricingPage = ({ onChoosePlan }: { onChoosePlan: (pkg: 'STARTER' | 'PRO') => void }) => (
    <div className="w-full max-w-5xl mx-auto">
        <h2 className="text-4xl font-extrabold text-white text-center mb-4">Find Your Perfect Plan</h2>
        <p className="text-gray-400 text-center mb-12 text-lg">Unlock your professional potential with our tailored packages.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-brand-gray/50 border border-gray-700 rounded-2xl p-8 flex flex-col hover:border-brand-primary/50 transition-colors">
                <h3 className="text-2xl font-bold text-brand-secondary">Starter</h3>
                <p className="text-gray-400 mt-2 mb-6">For individuals getting started.</p>
                <p className="text-5xl font-bold text-white mb-6">$29</p>
                <ul className="space-y-4 text-gray-300 mb-8 flex-grow">
                    <li className="flex items-center gap-3"><SparklesIcon className="w-5 h-5 text-brand-primary" /> 20 Headshots</li>
                    <li className="flex items-center gap-3"><SparklesIcon className="w-5 h-5 text-brand-primary" /> 2 Styles</li>
                    <li className="flex items-center gap-3"><SparklesIcon className="w-5 h-5 text-brand-primary" /> Standard Resolution</li>
                    <li className="flex items-center gap-3"><SparklesIcon className="w-5 h-5 text-brand-primary" /> 24-hour Delivery</li>
                </ul>
                <button onClick={() => onChoosePlan('STARTER')} className="w-full py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors">Choose Plan</button>
            </div>
            <div className="bg-brand-gray/50 border-2 border-brand-primary rounded-2xl p-8 flex flex-col relative overflow-hidden transform md:scale-105">
                 <div className="absolute top-0 right-0 bg-brand-primary text-brand-dark px-4 py-1 text-sm font-bold transform translate-x-1/4 -translate-y-1/4 rotate-45">POPULAR</div>
                <h3 className="text-2xl font-bold text-brand-primary">Pro</h3>
                <p className="text-gray-400 mt-2 mb-6">For professionals who need more.</p>
                <p className="text-5xl font-bold text-white mb-6">$49</p>
                <ul className="space-y-4 text-gray-300 mb-8 flex-grow">
                    <li className="flex items-center gap-3"><SparklesIcon className="w-5 h-5 text-brand-primary" /> 100 Headshots</li>
                    <li className="flex items-center gap-3"><SparklesIcon className="w-5 h-5 text-brand-primary" /> 5 Styles</li>
                    <li className="flex items-center gap-3"><SparklesIcon className="w-5 h-5 text-brand-primary" /> High Resolution</li>
                    <li className="flex items-center gap-3"><SparklesIcon className="w-5 h-5 text-brand-primary" /> Priority Processing</li>
                </ul>
                <button onClick={() => onChoosePlan('PRO')} className="w-full py-3 bg-brand-primary text-brand-dark font-bold rounded-lg hover:bg-brand-secondary transition-colors">Choose Plan</button>
            </div>
            <div className="bg-brand-gray/50 border border-gray-700 rounded-2xl p-8 flex flex-col hover:border-brand-primary/50 transition-colors">
                <h3 className="text-2xl font-bold text-brand-secondary">Team</h3>
                <p className="text-gray-400 mt-2 mb-6">For organizations and teams.</p>
                <p className="text-5xl font-bold text-white mb-6">Custom</p>
                <ul className="space-y-4 text-gray-300 mb-8 flex-grow">
                    <li className="flex items-center gap-3"><SparklesIcon className="w-5 h-5 text-brand-primary" /> Unlimited Headshots</li>
                    <li className="flex items-center gap-3"><SparklesIcon className="w-5 h-5 text-brand-primary" /> All Styles</li>
                    <li className="flex items-center gap-3"><SparklesIcon className="w-5 h-5 text-brand-primary" /> Centralized Billing</li>
                    <li className="flex items-center gap-3"><SparklesIcon className="w-5 h-5 text-brand-primary" /> Dedicated Support</li>
                </ul>
                <button className="w-full py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors">Contact Sales</button>
            </div>
        </div>
    </div>
);

const LoginPage = ({ onLogin }: { onLogin: () => void }) => (
    <div className="flex items-center justify-center py-20">
        <div className="w-full max-w-md p-8 space-y-8 bg-brand-gray/50 rounded-2xl shadow-2xl border border-brand-primary/20">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
                <p className="mt-2 text-gray-400">Sign in to continue to Stature<span className="text-brand-primary">AI</span></p>
            </div>
            <form className="mt-8 space-y-6" action="#" method="POST" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
                <div className="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label htmlFor="email-address" className="sr-only">Email address</label>
                        <input id="email-address" name="email" type="email" autoComplete="email" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 placeholder-gray-500 text-white rounded-t-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm" placeholder="Email address" />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input id="password" name="password" type="password" autoComplete="current-password" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 placeholder-gray-500 text-white rounded-b-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm" placeholder="Password" />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-brand-primary bg-gray-800 border-gray-600 rounded focus:ring-brand-primary" />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                            Remember me
                        </label>
                    </div>

                    <div className="text-sm">
                        <a href="#" className="font-medium text-brand-secondary hover:text-brand-primary">
                            Forgot your password?
                        </a>
                    </div>
                </div>

                <div>
                    <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-brand-dark bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-brand-primary transition-colors">
                        Sign in
                    </button>
                </div>
            </form>
             <p className="mt-4 text-center text-sm text-gray-400">
                Don't have an account?{' '}
                <a href="#" className="font-medium text-brand-secondary hover:text-brand-primary">
                    Sign up
                </a>
            </p>
        </div>
    </div>
);

const Footer = ({ setView } : { setView: (view: View) => void }) => (
    <footer className="bg-brand-gray py-8 mt-20">
      <div className="container mx-auto px-6 text-center text-gray-400">
           <div className="flex justify-center mb-4">
              <Logo />
            </div>
          <p>&copy; {new Date().getFullYear()} Stature-AI. All rights reserved.</p>
          <div className="mt-4 flex justify-center items-center space-x-4">
            <button onClick={() => setView('PRIVACY')} className="text-sm text-gray-500 hover:text-brand-primary transition-colors">
                Privacy Policy
            </button>
            <span className="text-gray-600">|</span>
            <button onClick={() => setView('TERMS')} className="text-sm text-gray-500 hover:text-brand-primary transition-colors">
                Terms & Conditions
            </button>
            <span className="text-gray-600">|</span>
            <button onClick={() => setView('ADMIN')} className="text-sm text-gray-500 hover:text-brand-primary transition-colors">
                Admin Panel
            </button>
          </div>
      </div>
    </footer>
);


// ============================================================================
//  Landing Page
// ============================================================================

const LandingPage = ({ onGetStarted, onPlanSelected }: { onGetStarted: () => void, onPlanSelected: (pkg: 'STARTER' | 'PRO') => void }) => {
  return (
    <div className="w-full">
      <section className="text-center py-20 md:py-32">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
            Generate Perfect <span className="text-brand-primary">AI Headshots</span> in Minutes
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mt-6 max-w-3xl mx-auto">
            Upload your photos, choose your style, and let our AI create stunning, professional headshots for you. Elevate your personal brand today.
          </p>
          <button 
            onClick={onGetStarted}
            className="mt-10 py-4 px-10 bg-brand-primary text-brand-dark text-xl font-bold rounded-lg flex items-center justify-center gap-2 mx-auto hover:bg-brand-secondary transition-all transform hover:scale-105"
          >
            Create Your Headshots <ArrowRightIcon className="w-6 h-6" />
          </button>
        </div>
      </section>

      <section className="py-20 bg-brand-dark/50">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-white mb-12">Simple, Fast, and Professional</h2>
            <div className="grid md:grid-cols-3 gap-12 text-left">
                <div className="flex flex-col items-center text-center p-6 bg-brand-gray/30 rounded-2xl">
                    <div className="bg-brand-gray/50 p-6 rounded-full border-2 border-brand-primary/30 mb-4">
                       <UploadIcon className="w-12 h-12 text-brand-primary"/>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">1. Upload Photos</h3>
                    <p className="text-gray-400">Easily upload 5-10 of your favorite selfies. Our AI works best with a variety of angles.</p>
                </div>
                 <div className="flex flex-col items-center text-center p-6 bg-brand-gray/30 rounded-2xl">
                     <div className="bg-brand-gray/50 p-6 rounded-full border-2 border-brand-primary/30 mb-4">
                       <StyleGridIcon className="w-12 h-12 text-brand-primary"/>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">2. Choose Your Style</h3>
                    <p className="text-gray-400">Select from styles like Corporate or Creative—or let our AI recommend the perfect one for you.</p>
                </div>
                 <div className="flex flex-col items-center text-center p-6 bg-brand-gray/30 rounded-2xl">
                     <div className="bg-brand-gray/50 p-6 rounded-full border-2 border-brand-primary/30 mb-4">
                       <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f929/512.gif" alt="star struck" className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">3. Get Your Headshots</h3>
                    <p className="text-gray-400">Receive a gallery of high-resolution headshots, ready to download and impress.</p>
                </div>
            </div>
        </div>
      </section>

      <section className="py-20">
         <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-white mb-12">Endless Possibilities, One You</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {LANDING_GALLERY_IMAGES.map((image) => (
                    <div key={image.id} className="group relative aspect-[4/5] overflow-hidden rounded-xl shadow-lg">
                        <img src={image.imageUrl} alt={image.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                            <h3 className="text-white text-xl font-bold">{image.name}</h3>
                        </div>
                    </div>
                ))}
            </div>
         </div>
      </section>

      <section id="pricing" className="py-20 bg-brand-gray/20">
         <PricingPage onChoosePlan={onPlanSelected} />
      </section>
    </div>
  );
};


// ============================================================================
//  Dashboard Components
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
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-brand-primary" />
                                </div>
                                <span
                                    className="relative flex h-8 w-8 items-center justify-center bg-brand-primary rounded-full"
                                >
                                    <CheckCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                                </span>
                             </>
                        ) : stepIdx === currentStepIndex ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-gray-700" />
                                </div>
                                <span
                                    className="relative flex h-8 w-8 items-center justify-center bg-brand-dark border-2 border-brand-primary rounded-full"
                                    aria-current="step"
                                >
                                    <span className="h-2.5 w-2.5 bg-brand-primary rounded-full" aria-hidden="true" />
                                </span>
                            </>
                        ) : (
                             <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-gray-700" />
                                </div>
                                <span
                                    className="group relative flex h-8 w-8 items-center justify-center bg-brand-dark border-2 border-gray-700 rounded-full"
                                >
                                </span>
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
            if (isSelected) {
                return prev.filter(s => s.id !== style.id);
            }
            if (prev.length < maxStyles) {
                return [...prev, style];
            }
            // Fix: Removed impossible condition `maxStyles === 1` which caused a TypeScript error.
            if (maxStyles === 2 && prev.length === 2) { // handle starter double selection replacement
                const newSelection = [...prev];
                newSelection.shift(); // remove the oldest selection
                newSelection.push(style);
                return newSelection;
            }
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
                        <input 
                            type="range" 
                            min={4} 
                            max={maxImages} 
                            value={imageCount} 
                            onChange={(e) => setImageCount(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-primary" 
                        />
                        <span className="text-2xl font-bold text-white bg-brand-dark/50 px-4 py-1 rounded-lg w-24 text-center">{imageCount}</span>
                    </div>
                    <div className="flex items-center justify-center mt-6">
                        <input
                            type="checkbox"
                            id="remove-piercings"
                            checked={removePiercings}
                            onChange={(e) => setRemovePiercings(e.target.checked)}
                            className="h-4 w-4 text-brand-primary bg-gray-800 border-gray-600 rounded focus:ring-brand-primary"
                        />
                        <label htmlFor="remove-piercings" className="ml-2 text-gray-300">
                            Remove facial piercings (e.g., nose rings)
                        </label>
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
            <button onClick={onRetry} className="py-3 px-8 bg-brand-primary text-brand-dark font-bold rounded-lg hover:bg-brand-secondary transition-colors">
                Try Again
            </button>
            <button onClick={onStartOver} className="py-3 px-8 bg-brand-gray text-white font-bold rounded-lg hover:bg-gray-600 transition-colors">
                Start Over
            </button>
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

    // Fix: Refactored image grouping to use a standard for-loop to avoid type inference issues with reduce.
    const groupedImages: Record<string, GeneratedImage[]> = {};
    for (const image of galleryImages) {
        const style = image.styleName || 'General';
        if (!groupedImages[style]) {
            groupedImages[style] = [];
        }
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
                                    <button onClick={() => toggleFavorite(image.id)} className="p-3 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-sm transition-colors" aria-label="Favorite this image">
                                        <HeartIcon className={`w-6 h-6 ${image.isFavorite ? 'text-red-500' : 'text-white'}`} filled={image.isFavorite} />
                                    </button>
                                    <a href={image.src} download={`stature-ai-headshot-${image.id}.png`} className="p-3 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-sm transition-colors" aria-label="Download this image">
                                        <DownloadIcon className="w-6 h-6 text-white" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}

            <div className="mt-12 text-center flex flex-col sm:flex-row justify-center gap-4">
                 <button
                    onClick={handleDownloadAll}
                    disabled={isDownloading}
                    className="py-3 px-8 bg-brand-primary text-brand-dark text-lg font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-brand-secondary transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed"
                 >
                    {isDownloading ? (
                        <>
                           <Spinner size="6" className="border-brand-dark border-t-transparent" />
                           <span>Downloading...</span>
                        </>
                    ) : (
                        <>
                            <DownloadIcon className="w-6 h-6" /> Download All
                        </>
                    )}
                </button>
                <button onClick={onReset} className="py-3 px-8 bg-brand-gray text-white text-lg font-bold rounded-lg hover:bg-gray-600 transition-colors">
                    Start Over
                </button>
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
        <button className="bg-brand-primary text-brand-dark font-semibold py-2 px-5 rounded-lg hover:bg-brand-secondary transition-colors">
            Buy More Credits
        </button>
    </div>
);

const Dashboard = ({ userPackage, uploadedFiles, setUploadedFiles, user }: { userPackage: Package | null, uploadedFiles: UploadFile[], setUploadedFiles: (files: UploadFile[]) => void, user: User | null }) => {
    const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
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
            if (error instanceof GenerationError) {
                setGenerationError(error.message);
            } else {
                setGenerationError('An unknown error occurred during image generation.');
            }
        }
    };

    const handleReset = () => {
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
        <div>
            {user && <CreditsDisplay credits={user.credits} />}
            <div className="mb-16 flex justify-center">
                 <Stepper currentStep={step} />
            </div>
            {renderStepContent()}
        </div>
    )
};

// ============================================================================
//  Account Page
// ============================================================================
const AccountPage = ({ user, orders }: { user: User | null; orders: Order[] }) => {
    const [activeTab, setActiveTab] = useState('history');

    const OrderHistory = () => (
         <table className="w-full text-left">
            <thead className="bg-brand-gray/60">
                <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Amount</th>
                </tr>
            </thead>
            <tbody>
                {orders.map(order => (
                     <tr key={order.id} className="border-b border-gray-700 hover:bg-brand-gray/50">
                        <td className="p-3">{order.date}</td>
                        <td className="p-3">{order.description}</td>
                        <td className="p-3">{order.amount}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

     const ProfileSettings = () => (
        <div>
            <div className="space-y-4">
                 <div>
                    <label className="text-sm text-gray-400">Name</label>
                    <input type="text" value={user?.name} readOnly className="w-full mt-1 bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600"/>
                </div>
                 <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <input type="email" value={user?.email} readOnly className="w-full mt-1 bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600"/>
                </div>
                <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Change Password</button>
            </div>
        </div>
    );

    const AccountContent = () => {
        switch (activeTab) {
            case 'history': return <OrderHistory />;
            case 'settings': return <ProfileSettings />;
            default: return null;
        }
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 bg-brand-gray/30 p-8 rounded-2xl border border-brand-primary/20">
            <aside className="w-full md:w-1/4">
                 <h1 className="text-2xl font-bold text-white mb-6">My Account</h1>
                <nav className="flex flex-col space-y-2">
                    <button onClick={() => setActiveTab('history')} className={`text-left p-3 rounded-lg capitalize transition-colors ${activeTab === 'history' ? 'bg-brand-primary text-brand-dark font-bold' : 'hover:bg-brand-gray/50 text-gray-300'}`}>
                        Order History
                    </button>
                     <button onClick={() => setActiveTab('settings')} className={`text-left p-3 rounded-lg capitalize transition-colors ${activeTab === 'settings' ? 'bg-brand-primary text-brand-dark font-bold' : 'hover:bg-brand-gray/50 text-gray-300'}`}>
                        Profile Settings
                    </button>
                </nav>
            </aside>
            <main className="w-full md:w-3/4 bg-brand-dark/30 p-6 rounded-lg">
                <AccountContent/>
            </main>
        </div>
    );
};


// ============================================================================
//  Admin Panel
// ============================================================================
const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('users');

    const AdminUserRow = ({ name, email, credits, status }: { name: string, email: string, credits: number, status: 'Active' | 'Banned' }) => (
        <tr className="border-b border-gray-700 hover:bg-brand-gray/50">
            <td className="p-3">{name}</td>
            <td className="p-3">{email}</td>
            <td className="p-3">{credits}</td>
            <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full ${status === 'Active' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>{status}</span></td>
            <td className="p-3"><button className="text-brand-secondary hover:underline">Edit</button></td>
        </tr>
    );

    const AdminCouponRow = ({ code, discount, used, status }: { code: string, discount: string, used: number, status: 'Active' | 'Expired' }) => (
         <tr className="border-b border-gray-700 hover:bg-brand-gray/50">
            <td className="p-3 font-mono">{code}</td>
            <td className="p-3">{discount}</td>
            <td className="p-3">{used} / 100</td>
            <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full ${status === 'Active' ? 'bg-green-800 text-green-200' : 'bg-gray-600 text-gray-300'}`}>{status}</span></td>
            <td className="p-3"><button className="text-brand-secondary hover:underline">Deactivate</button></td>
        </tr>
    );

    const AdminContent = () => {
        switch (activeTab) {
            case 'users': return (
                <div>
                    <h2 className="text-3xl font-bold text-white mb-6">User Management</h2>
                    <table className="w-full text-left">
                        <thead className="bg-brand-gray/60">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Credits</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AdminUserRow name="John Doe" email="john@example.com" credits={100} status="Active" />
                            <AdminUserRow name="Jane Smith" email="jane@example.com" credits={20} status="Active" />
                            <AdminUserRow name="Sam Wilson" email="sam@example.com" credits={0} status="Banned" />
                        </tbody>
                    </table>
                </div>
            );
            case 'jobs': return (
                <div>
                    <h2 className="text-3xl font-bold text-white mb-6">Active Jobs</h2>
                     <p className="text-gray-400">No active jobs to display.</p>
                </div>
            );
            case 'coupons': return (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-white">Coupon Management</h2>
                        <button className="bg-brand-primary text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary">Create Coupon</button>
                    </div>
                     <table className="w-full text-left">
                        <thead className="bg-brand-gray/60">
                            <tr>
                                <th className="p-3">Code</th>
                                <th className="p-3">Discount</th>
                                <th className="p-3">Usage</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AdminCouponRow code="SUMMER24" discount="20%" used={42} status="Active" />
                            <AdminCouponRow code="WELCOME10" discount="$10 Off" used={100} status="Expired" />
                        </tbody>
                    </table>
                </div>
            );
            default: return null;
        }
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 bg-brand-gray/30 p-8 rounded-2xl border border-brand-primary/20">
            <aside className="w-full md:w-1/4">
                 <h1 className="text-2xl font-bold text-white mb-6">Admin Panel</h1>
                <nav className="flex flex-col space-y-2">
                    {['users', 'jobs', 'coupons'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`text-left p-3 rounded-lg capitalize transition-colors ${activeTab === tab ? 'bg-brand-primary text-brand-dark font-bold' : 'hover:bg-brand-gray/50 text-gray-300'}`}>
                            {tab}
                        </button>
                    ))}
                </nav>
            </aside>
            <main className="w-full md:w-3/4 bg-brand-dark/30 p-6 rounded-lg">
                <AdminContent/>
            </main>
        </div>
    );
};


// ============================================================================
//  Legal Pages
// ============================================================================

const PrivacyPolicyPage = () => (
    <div className="max-w-4xl mx-auto text-gray-300 prose prose-invert prose-h1:text-brand-primary prose-h2:text-brand-secondary">
        <h1>Privacy Policy</h1>
        <p><em>Last updated: October 26, 2023</em></p>
        
        <p>Stature-AI ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>

        <h2>1. Information We Collect</h2>
        <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
        <ul>
            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name and email address, that you voluntarily give to us when you register with the application.</li>
            <li><strong>Uploaded Images:</strong> We collect the photos you upload to our service for the sole purpose of generating AI headshots.</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>Having accurate information permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:</p>
        <ul>
            <li>Create and manage your account.</li>
            <li>Generate your AI headshots as requested.</li>
            <li>Improve our application and services. We will not use your uploaded photos to train our AI models without your explicit consent.</li>
            <li>Email you regarding your account or order.</li>
        </ul>

        <h2>3. Data Storage and Security</h2>
        <p>Your uploaded images are temporarily stored on secure servers, such as those provided by Firebase, to perform the generation process. We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.</p>

        <h2>4. Disclosure of Your Information</h2>
        <p>We do not share, sell, rent, or trade your personal information or uploaded photos with third parties for their commercial purposes.</p>

        <h2>5. Your Rights</h2>
        <p>You have the right to request access to the personal data we hold about you, to request that we correct any inaccurate data, and to request that we delete your data. You can typically delete your uploaded photos and generated results from within your account dashboard.</p>

        <h2>6. Contact Us</h2>
        <p>If you have questions or comments about this Privacy Policy, please contact us at:</p>
        <p>Stature-AI<br/>California, USA<br/>contact@stature-ai.com</p>
    </div>
);

const TermsAndConditionsPage = () => (
    <div className="max-w-4xl mx-auto text-gray-300 prose prose-invert prose-h1:text-brand-primary prose-h2:text-brand-secondary">
        <h1>Terms and Conditions</h1>
        <p><em>Last updated: October 26, 2023</em></p>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using the Stature-AI application (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this Service.</p>

        <h2>2. Description of Service</h2>
        <p>Stature-AI provides users with the ability to generate AI-powered headshots from photos they upload. The quality and accuracy of the generated images may vary.</p>
        
        <h2>3. User Content</h2>
        <p>You retain all rights and ownership of the content (photos) you upload to the Service. By uploading your photos, you grant Stature-AI a worldwide, non-exclusive, royalty-free license to use, reproduce, and modify your content for the sole purpose of providing the Service to you.</p>

        <h2>4. Prohibited Conduct</h2>
        <p>You agree not to upload any content that is illegal, harmful, threatening, abusive, defamatory, obscene, or otherwise objectionable. We reserve the right to terminate accounts that are found to be in violation of this policy.</p>

        <h2>5. Intellectual Property</h2>
        <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Stature-AI and its licensors. The Service is protected by copyright, trademark, and other laws of the USA.</p>

        <h2>6. Limitation of Liability</h2>
        <p>In no event shall Stature-AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

        <h2>7. Governing Law</h2>
        <p>These Terms shall be governed and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.</p>
        
        <h2>8. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at:</p>
        <p>Stature-AI<br/>California, USA<br/>contact@stature-ai.com</p>
    </div>
);


// ============================================================================
//  Main App Component
// ============================================================================

const MOCK_USER: User = {
    name: "Alex Johnson",
    email: "alex.j@email.com",
    credits: 85,
};

const MOCK_ORDERS: Order[] = [
    { id: '1', date: '2024-07-20', description: 'Pro Plan Activation', amount: '$49.00' },
    { id: '2', date: '2024-07-20', description: '50 Credits Pack', amount: '$19.00' },
    { id: '3', date: '2024-06-15', description: 'Starter Plan Activation', amount: '$29.00' },
];

export default function App() {
    const [view, setView] = useState<View>('LANDING');
    const [userPackage, setUserPackage] = useState<Package | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user] = useState<User | null>(MOCK_USER);
    const [orders] = useState<Order[]>(MOCK_ORDERS);

    const handlePlanSelected = (pkg: 'STARTER' | 'PRO') => {
        setUserPackage(pkg);
        setView('GENERATOR');
    };

    const handleGetStarted = () => {
        // Default to starter and navigate to the dashboard from hero CTA
        setUserPackage('STARTER');
        setView('GENERATOR');
    }

    const handleLogin = () => {
        setIsLoggedIn(true);
        setView('GENERATOR');
    }

    const handleLogout = () => {
        setIsLoggedIn(false);
        setView('LANDING');
    }

    const renderView = () => {
        switch (view) {
            case 'LANDING': return <LandingPage onGetStarted={handleGetStarted} onPlanSelected={handlePlanSelected} />;
            case 'GENERATOR': return <div className="py-12"><Dashboard userPackage={userPackage} uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} user={user}/></div>;
            case 'LOGIN': return <LoginPage onLogin={handleLogin} />;
            case 'ADMIN': return <div className="py-12"><AdminPage /></div>;
            case 'ACCOUNT': return <div className="py-12"><AccountPage user={user} orders={orders} /></div>;
            case 'PRIVACY': return <div className="py-12"><PrivacyPolicyPage /></div>;
            case 'TERMS': return <div className="py-12"><TermsAndConditionsPage /></div>;
            default: return <LandingPage onGetStarted={handleGetStarted} onPlanSelected={handlePlanSelected} />;
        }
    }

    return (
        <div className="bg-brand-dark min-h-screen font-sans text-white">
            <Header currentView={view} setView={setView} isLoggedIn={isLoggedIn} onLogout={handleLogout} />
            <main className="container mx-auto px-6">
                {renderView()}
            </main>
            <Footer setView={setView} />
        </div>
    );
}