import React from 'react';
import { SparklesIcon } from './Icons';
import type { Package } from '../types';

interface PricingPageProps {
    onChoosePlan: (pkg: Package) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onChoosePlan }) => (
    <div className="w-full max-w-5xl mx-auto">
        <h2 className="text-4xl font-extrabold text-white text-center mb-4">Find Your Perfect Plan</h2>
        <p className="text-gray-400 text-center mb-12 text-lg">Unlock your professional potential with our tailored packages.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
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

            {/* Pro Plan */}
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

            {/* Team Plan */}
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

export default PricingPage;