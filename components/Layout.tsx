import type { View, User } from "../types";
import { UserCircleIcon } from "./Icons";

export const Logo = () => (
  <div className="flex items-center gap-3 group" aria-label="StatureAI Home">
    <div className="bg-black/80 p-2 rounded-xl border border-brand-primary/30 shadow-[0_0_10px_rgba(212,175,55,0.2)] group-hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all duration-300">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="text-brand-primary"
      >
        <path
          d="M12 2L2 7L12 12L22 7L12 2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 17L12 22L22 17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 12L12 17L22 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    <span className="text-2xl font-bold text-white tracking-wider group-hover:text-brand-primary transition-colors duration-300">
      Stature<span className="text-brand-primary group-hover:text-white transition-colors duration-300">AI</span>
    </span>
  </div>
);

export const Header = ({
  currentView,
  onNavigate,
  isLoggedIn,
  onLogout,
  user,
}: {
  currentView: View;
  onNavigate: (view: View, targetId?: string) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  user: User | null;
}) => (
  <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
    <div className="glass-panel border-t-0 border-x-0 rounded-b-2xl mx-4 mt-2">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => onNavigate("LANDING")}
          className="cursor-pointer focus:outline-none"
        >
          <Logo />
        </button>
        <div className="flex items-center space-x-8">
          <a
            href="#pricing"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("LANDING", "pricing");
            }}
            className="text-sm font-medium uppercase tracking-widest text-gray-400 hover:text-brand-primary transition-colors"
          >
            Pricing
          </a>
          <button
            onClick={() => onNavigate("GENERATOR")}
            className={`text-sm font-medium uppercase tracking-widest transition-colors ${currentView === "GENERATOR" ? "text-brand-primary" : "text-gray-400 hover:text-brand-primary"}`}
          >
            Dashboard
          </button>
          {isLoggedIn ? (
            <>
              <button
                onClick={() => onNavigate("ACCOUNT")}
                className={`flex items-center gap-2 text-sm font-medium uppercase tracking-widest transition-colors ${currentView === "ACCOUNT" ? "text-brand-primary" : "text-gray-400 hover:text-brand-primary"}`}
              >
                <UserCircleIcon className="w-5 h-5" /> Account
              </button>
              {user?.role === "admin" && (
                <button
                  onClick={() => onNavigate("ADMIN")}
                  className={`text-sm font-medium uppercase tracking-widest transition-colors ${currentView === "ADMIN" ? "text-brand-primary" : "text-gray-400 hover:text-brand-primary"}`}
                >
                  Admin
                </button>
              )}
              <button
                onClick={onLogout}
                className="glass-button text-white text-sm font-semibold py-2 px-6 rounded-lg hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-200"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => onNavigate("LOGIN")}
              className="btn-primary text-sm uppercase tracking-widest"
            >
              Login
            </button>
          )}
        </div>
      </nav>
    </div>
  </header>
);

export const Footer = ({ setView }: { setView: (view: View) => void }) => (
  <footer className="bg-black/50 backdrop-blur-lg border-t border-white/5 py-12 mt-auto">
    <div className="container mx-auto px-6 text-center text-gray-500">
      <div className="flex justify-center mb-8">
        <Logo />
      </div>
      <p className="mb-6">&copy; {new Date().getFullYear()} Stature-AI. All rights reserved.</p>
      <div className="flex justify-center items-center space-x-6">
        <button
          onClick={() => setView("PRIVACY")}
          className="text-sm hover:text-brand-primary transition-colors"
        >
          Privacy Policy
        </button>
        <span className="text-gray-700">|</span>
        <button
          onClick={() => setView("TERMS")}
          className="text-sm hover:text-brand-primary transition-colors"
        >
          Terms & Conditions
        </button>
      </div>
    </div>
  </footer>
);
