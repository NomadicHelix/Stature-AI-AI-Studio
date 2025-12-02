import React, { useEffect } from "react";
import { ArrowRightIcon, UploadIcon, StyleGridIcon } from "./Icons";
import PricingPage from "./PricingPage";
import { LANDING_GALLERY_IMAGES } from "../constants";
import type { Package } from "../types";

interface LandingPageProps {
  onGetStarted: () => void;
  onPlanSelected: (pkg: Package) => void;
  scrollTarget?: string | null;
  onScrollComplete: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onPlanSelected,
  scrollTarget,
  onScrollComplete,
}) => {
  useEffect(() => {
    if (scrollTarget) {
      const element = document.getElementById(scrollTarget);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      onScrollComplete();
    }
  }, [scrollTarget, onScrollComplete]);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section id="hero" className="text-center py-32 md:py-48 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[120px] -z-10"></div>

        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-6xl md:text-8xl font-black text-white leading-tight tracking-tight animate-fade-in">
            Generate Perfect<br />
            <span className="text-gradient">AI Headshots</span>
          </h1>
          <p className="text-gray-400 text-xl md:text-2xl mt-8 max-w-3xl mx-auto font-light animate-slide-up" style={{ animationDelay: "0.2s" }}>
            Upload your photos, choose your style, and let our AI create
            stunning, professional headshots for you. Elevate your personal
            brand today.
          </p>
          <div className="mt-12 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <button
              onClick={onGetStarted}
              className="btn-primary text-xl flex items-center justify-center gap-3 mx-auto"
            >
              Create Your Headshots <ArrowRightIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-16">
            Simple, Fast, and <span className="text-brand-primary">Professional</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              {
                icon: <UploadIcon className="w-10 h-10 text-brand-primary" />,
                title: "1. Upload Photos",
                desc: "Easily upload 5-10 of your favorite selfies. Our AI works best with a variety of angles.",
              },
              {
                icon: <StyleGridIcon className="w-10 h-10 text-brand-primary" />,
                title: "2. Choose Your Style",
                desc: "Select from styles like Corporate or Creative—or let our AI recommend the perfect one for you.",
              },
              {
                icon: <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f929/512.gif" alt="star" className="w-10 h-10" />,
                title: "3. Get Your Headshots",
                desc: "Receive a gallery of high-resolution headshots, ready to download and impress.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="glass-panel p-8 rounded-3xl hover:bg-white/10 transition-colors duration-300 group"
              >
                <div className="bg-brand-dark/50 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:border-brand-primary/30 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-brand-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-16">
            Endless Possibilities, <span className="text-brand-primary">One You</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {LANDING_GALLERY_IMAGES.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl border border-white/5"
              >
                <img
                  src={image.imageUrl}
                  alt={image.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <h3 className="text-brand-primary text-xl font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    {image.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-black/20 backdrop-blur-sm">
        <PricingPage onChoosePlan={onPlanSelected} />
      </section>
    </div>
  );
};

export default LandingPage;
