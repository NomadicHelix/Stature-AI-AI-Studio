import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig'; // db is no longer needed here
import type { View } from '../types';
import Spinner from './Spinner';
import { GoogleIcon } from './Icons';
import { getErrorMessage } from '../utils';

interface AuthFormProps {
    isLogin: boolean;
    setView: (view: View) => void;
    onAuthSuccess: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ isLogin, setView, onAuthSuccess }) => {
    const [name, setName] = useState(''); // Name is still useful for initial user object
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailPasswordAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                // The backend trigger will now handle Firestore document creation.
                await createUserWithEmailAndPassword(auth, email, password);
            }
            onAuthSuccess();
        } catch (error: any) {
            setError(getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setError(null);
        setIsLoading(true);
        try {
            // The backend trigger will handle Firestore document creation.
            await signInWithPopup(auth, googleProvider);
            onAuthSuccess();
        } catch (error: any) {
            setError(getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto py-20">
            <div className="bg-brand-gray/30 p-8 rounded-2xl border border-gray-700 shadow-2xl">
                <h2 className="text-3xl font-extrabold text-white text-center mb-1">{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
                <p className="text-gray-400 text-center mb-8">{isLogin ? 'Sign in to continue.' : 'Get started in seconds.'}</p>

                {error && <p className="bg-red-900/20 text-red-400 p-3 rounded-lg mb-6 text-center text-sm">{error}</p>}

                <form onSubmit={handleEmailPasswordAuth} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm" htmlFor="name">Display Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-brand-gray border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-brand-gray border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-brand-gray border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full py-3 bg-brand-primary text-brand-dark font-bold rounded-lg hover:bg-brand-secondary transition-colors disabled:opacity-50 flex justify-center items-center" disabled={isLoading}>
                        {isLoading ? <Spinner size="6" /> : (isLogin ? 'Login' : 'Sign Up')}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-600" /></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-brand-gray/30 text-gray-400">OR</span></div>
                </div>
                
                <button onClick={handleGoogleAuth} className="w-full py-3 bg-white text-black font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50" disabled={isLoading}>
                    <GoogleIcon className="w-5 h-5" />
                    Continue with Google
                </button>
                
                <p className="text-center text-gray-400 mt-6">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setView(isLogin ? 'SIGNUP' : 'LOGIN')} className="font-semibold text-brand-primary hover:underline">
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthForm;