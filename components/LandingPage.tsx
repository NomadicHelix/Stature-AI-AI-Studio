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
      <section id="hero" className="text-center py-20 md:py-32">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
            Generate Perfect{" "}
            <span className="text-brand-primary">AI Headshots</span> in Minutes
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mt-6 max-w-3xl mx-auto">
            Upload your photos, choose your style, and let our AI create
            stunning, professional headshots for you. Elevate your personal
            brand today.
          </p>
          <button
            onClick={onGetStarted}
            className="mt-10 py-4 px-10 bg-brand-primary text-brand-dark text-xl font-bold rounded-lg flex items-center justify-center gap-2 mx-auto hover:bg-brand-secondary transition-all transform hover:scale-105"
          >
            Create Your Headshots <ArrowRightIcon className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-brand-dark/50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-12">
            Simple, Fast, and Professional
          </h2>
          <div className="grid md:grid-cols-3 gap-12 text-left">
            <div className="flex flex-col items-center text-center p-6 bg-brand-gray/30 rounded-2xl">
              <div className="bg-brand-gray/50 p-6 rounded-full border-2 border-brand-primary/30 mb-4">
                <UploadIcon className="w-12 h-12 text-brand-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                1. Upload Photos
              </h3>
              <p className="text-gray-400">
                Easily upload 5-10 of your favorite selfies. Our AI works best
                with a variety of angles.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-brand-gray/30 rounded-2xl">
              <div className="bg-brand-gray/50 p-6 rounded-full border-2 border-brand-primary/30 mb-4">
                <StyleGridIcon className="w-12 h-12 text-brand-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                2. Choose Your Style
              </h3>
              <p className="text-gray-400">
                Select from styles like Corporate or Creative—or let our AI
                recommend the perfect one for you.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-brand-gray/30 rounded-2xl">
              <div className="bg-brand-gray/50 p-6 rounded-full border-2 border-brand-primary/30 mb-4">
                <img
                  src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f929/512.gif"
                  alt="star struck"
                  className="w-12 h-12"
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                3. Get Your Headshots
              </h3>
              <p className="text-gray-400">
                Receive a gallery of high-resolution headshots, ready to
                download and impress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-12">
            Endless Possibilities, One You
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {LANDING_GALLERY_IMAGES.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-[4/5] overflow-hidden rounded-xl shadow-lg"
              >
                <img
                  src={image.imageUrl}
                  alt={image.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <h3 className="text-white text-xl font-bold">{image.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-brand-gray/20">
        <PricingPage onChoosePlan={onPlanSelected} />
      </section>
    </div>
  );
};

export default LandingPage;
