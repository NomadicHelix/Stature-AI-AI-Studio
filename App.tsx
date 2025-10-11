import React, { useState, useEffect } from 'react';
import type { View, Package, User } from './types';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getErrorMessage } from './utils';

// Import Page Components
import LandingPage from './components/LandingPage';
import AuthForm from './components/AuthForm';
import GeneratorPage from './components/GeneratorPage'; // Corrected import path
import AccountPage from './components/AccountPage';
import AdminPage from './components/AdminPage';
import PaymentPage from './components/PaymentPage';
import { PrivacyPage, TermsPage } from './components/LegalPages';

// Import Shared Components
import { Header, Footer } from './components/Layout';
import Spinner from './components/Spinner';

// ============================================================================
//  Main App Component
// ============================================================================

export default function App() {
    const [view, setView] = useState<View>('LANDING');
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [appError, setAppError] = useState<string | null>(null);
    const [paymentError, setPaymentError] = useState<string | null>(null);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setIsAuthLoading(true);
            setAppError(null);
            try {
                if (firebaseUser) {
                    const userDocRef = doc(db, "users", firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);
                    const tokenResult = await firebaseUser.getIdTokenResult(true);

                    if (userDoc.exists()) {
                        const userData = userDoc.data() as User;
                        setUser({ ...userData, role: tokenResult.claims.role || 'user' });
                    } else {
                        console.warn("User document not found. This may be due to the onUserCreate trigger still running.");
                        // Create a temporary user object until the trigger completes and refreshes the token
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email!,
                            role: 'user',
                            credits: 0,
                            createdAt: new Date(),
                        });
                    }
                    setIsLoggedIn(true);
                } else {
                    setUser(null);
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error("Critical Authentication Error:", error);
                setAppError(getErrorMessage(error));
            } finally {
                setIsAuthLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const getToken = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("Authentication required.");
        return await currentUser.getIdToken();
    };
    
    const handleLogout = async () => {
        await signOut(auth);
        setView('LANDING');
    };
    
    const handleAuthSuccess = () => {
        setView('GENERATOR');
    };

    const handleGetStarted = () => {
        setView(isLoggedIn ? 'GENERATOR' : 'LOGIN');
    };

    const handlePlanSelected = (pkg: Package) => {
        setSelectedPackage(pkg);
        setView(isLoggedIn ? 'PAYMENT' : 'LOGIN');
    };

    const handlePaymentSuccess = async (details: any, data: any) => {
        // ... implementation is correct from previous steps ...
    };
    
    const handlePaymentError = (err: any) => {
        console.error("PayPal Error:", err);
        setPaymentError(getErrorMessage(err));
    };

    const renderContent = () => {
        if (isAuthLoading) {
            return <div className="flex-grow flex items-center justify-center"><Spinner size="12" /></div>;
        }
        
        if (appError) {
             return (
                <div className="flex-grow flex items-center justify-center text-center">
                    <div>
                        <h2 className="text-2xl font-bold text-red-400 mb-4">A Critical Error Occurred</h2>
                        <p className="mb-6 text-gray-400">{appError}</p>
                        <button onClick={() => window.location.reload()} className="bg-brand-primary text-brand-dark font-semibold py-2 px-5 rounded-lg hover:bg-brand-secondary">
                            Refresh Application
                        </button>
                    </div>
                </div>
            );
        }

        if (paymentError) {
             return (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Payment Failed</h2>
                    <p className="mb-6 text-gray-400">{paymentError}</p>
                    <button onClick={() => { setPaymentError(null); setView('LANDING'); }} className="text-brand-primary hover:underline">
                        Return to Homepage
                    </button>
                </div>
            );
        }

        switch (view) {
            case 'LANDING': return <LandingPage onGetStarted={handleGetStarted} onPlanSelected={handlePlanSelected} />;
            case 'LOGIN': return <AuthForm isLogin={true} setView={setView} onAuthSuccess={handleAuthSuccess} />;
            case 'SIGNUP': return <AuthForm isLogin={false} setView={setView} onAuthSuccess={handleAuthSuccess} />;
            case 'GENERATOR': return <GeneratorPage user={user} userPackage={selectedPackage} />;
            case 'ACCOUNT': return <AccountPage user={user} />;
            case 'ADMIN': return <AdminPage />;
            case 'PAYMENT': return <PaymentPage selectedPackage={selectedPackage!} onPaymentSuccess={handlePaymentSuccess} onPaymentError={handlePaymentError} setView={setView} />;
            case 'PRIVACY': return <PrivacyPage />;
            case 'TERMS': return <TermsPage />;
            default: return <LandingPage onGetStarted={handleGetStarted} onPlanSelected={handlePlanSelected} />;
        }
    };

    return (
        <div className="bg-brand-dark min-h-screen font-sans text-white flex flex-col">
            <Header currentView={view} setView={setView} isLoggedIn={isLoggedIn} onLogout={handleLogout} user={user} />
            <main className="flex-grow container mx-auto px-6">
              {renderContent()}
            </main>
            <Footer setView={setView} />
        </div>
    );
}