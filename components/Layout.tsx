import type { View, User } from "../types";
import { UserCircleIcon } from "./Icons";

export const Logo = () => (
  <div className="flex items-center gap-3" aria-label="StatureAI Home">
    <div className="bg-black p-1.5 rounded-lg border border-brand-primary/20">
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="#D4AF37"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M4 2H20C21.1046 2 22 2.89543 22 4V20C22 21.1046 21.1046 22 20 22H4C2.89543 22 2 21.1046 2 20V4C2 2.89543 2.89543 2 4 2ZM18 20V22H6V20H18ZM19 4H5C4.44772 4 4 4.44772 4 5V19C4 19.5523 4.44772 20 5 20H6V18H18V20H19C19.5523 20 20 19.5523 20 19V5C20 4.44772 19.5523 4 19 4ZM18 6H6V8H18V6ZM14 9H10V17H14V9Z"
          fill="#D4AF37"
        />
        <path
          d="M13 9.5C13 10.3284 12.3284 11 11.5 11C10.6716 11 10 11.6716 10 12.5C10 13.3284 10.6716 14 11.5 14H12.5C13.3284 14 14 14.6716 14 15.5C14 16.3284 13.3284 17 12.5 17"
          stroke="#1A1A1A"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
    <span className="text-2xl font-bold text-white tracking-wider">
      Stature<span className="text-brand-primary">AI</span>
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
  <header className="bg-brand-dark/80 backdrop-blur-sm sticky top-0 z-50">
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
      <button
        onClick={() => onNavigate("LANDING")}
        className="text-2xl font-bold text-white tracking-wider cursor-pointer"
      >
        <Logo />
      </button>
      <div className="flex items-center space-x-6">
        <a
          href="#pricing"
          onClick={(e) => {
            e.preventDefault();
            onNavigate("LANDING", "pricing");
          }}
          className="text-lg font-medium transition-colors text-gray-300 hover:text-white"
        >
          Pricing
        </a>
        <button
          onClick={() => onNavigate("GENERATOR")}
          className={`text-lg font-medium transition-colors ${currentView === "GENERATOR" ? "text-brand-primary" : "text-gray-300 hover:text-white"}`}
        >
          Dashboard
        </button>
        {isLoggedIn ? (
          <>
            <button
              onClick={() => onNavigate("ACCOUNT")}
              className={`flex items-center gap-2 text-lg font-medium transition-colors ${currentView === "ACCOUNT" ? "text-brand-primary" : "text-gray-300 hover:text-white"}`}
            >
              <UserCircleIcon className="w-6 h-6" /> Account
            </button>
            {user?.role === "admin" && (
              <button
                onClick={() => onNavigate("ADMIN")}
                className={`text-lg font-medium transition-colors ${currentView === "ADMIN" ? "text-brand-primary" : "text-gray-300 hover:text-white"}`}
              >
                Admin
              </button>
            )}
            <button
              onClick={onLogout}
              className="bg-gray-700 text-white font-semibold py-2 px-5 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => onNavigate("LOGIN")}
            className="bg-brand-primary text-brand-dark font-semibold py-2 px-5 rounded-lg hover:bg-brand-secondary transition-transform transform hover:scale-105"
          >
            Login
          </button>
        )}
      </div>
    </nav>
    <div className="h-px bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent"></div>
  </header>
);

export const Footer = ({ setView }: { setView: (view: View) => void }) => (
  <footer className="bg-brand-gray py-8 mt-auto">
    <div className="container mx-auto px-6 text-center text-gray-400">
      <div className="flex justify-center mb-4">
        <Logo />
      </div>
      <p>&copy; {new Date().getFullYear()} Stature-AI. All rights reserved.</p>
      <div className="mt-4 flex justify-center items-center space-x-4">
        <button
          onClick={() => setView("PRIVACY")}
          className="text-sm text-gray-500 hover:text-brand-primary transition-colors"
        >
          Privacy Policy
        </button>
        <span className="text-gray-600">|</span>
        <button
          onClick={() => setView("TERMS")}
          className="text-sm text-gray-500 hover:text-brand-primary transition-colors"
        >
          Terms & Conditions
        </button>
      </div>
    </div>
  </footer>
);
