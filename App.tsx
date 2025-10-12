import React, { useState, useEffect } from 'react';
import type { View, Package, User } from './types';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getErrorMessage } from './utils';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

// ============================================================================
//  COMPONENT IMPORTS
//  All page and layout components are imported here.
// ============================================================================
import LandingPage from './components/LandingPage';
import AuthForm from './components/AuthForm';
import GeneratorPage from './components/GeneratorPage';
import AccountPage from './components/AccountPage';
import AdminPage from './components/AdminPage';
import PaymentPage from './components/PaymentPage';
import { PrivacyPage, TermsPage } from './components/LegalPages';
import { Header, Footer } from './components/Layout';
import Spinner from './components/Spinner';

// ============================================================================
//  CORE APP LOGIC (AppContent)
//  This component contains all state, handlers, and rendering logic.
//  IT MUST NOT BE DELETED.
// ============================================================================
const AppContent = () => {
    const [view, setView] = useState<View>('LANDING');
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setIsAuthLoading(true);
            try {
                if (firebaseUser) {
                    const userDocRef = doc(db, "users", firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);
                    const tokenResult = await firebaseUser.getIdTokenResult(true);

                    if (userDoc.exists()) {
                        const userData = userDoc.data() as User;
                        setUser({ ...userData, role: tokenResult.claims.role || 'user' });
                    } else {
                        const newUser: User = { uid: firebaseUser.uid, email: firebaseUser.email!, role: 'user', credits: 0, createdAt: new Date() };
                        await setDoc(userDocRef, newUser);
                        setUser(newUser);
                    }
                    setIsLoggedIn(true);
                } else {
                    setUser(null);
                    setIsLoggedIn(false);
                }
            } catch (error) {
                setPaymentError(getErrorMessage(error)); // Use paymentError state for critical auth errors
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
    
    const handleAuthSuccess = () => setView('GENERATOR');
    const handleGetStarted = () => setView(isLoggedIn ? 'GENERATOR' : 'LOGIN');
    const handlePlanSelected = (pkg: Package) => {
        setSelectedPackage(pkg);
        setView(isLoggedIn ? 'PAYMENT' : 'LOGIN');
    };

    const handlePaymentSuccess = async (details: any, data: any) => {
        setPaymentError(null);
        try {
            const token = await getToken();
            const response = await fetch('/api/createOrder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ packageType: selectedPackage, paymentDetails: { orderID: data.orderID } })
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ error: "An unknown error occurred during payment processing." }));
                throw new Error(errorBody.error);
            }
            
            if (user) {
                const creditsToAdd = selectedPackage === 'STARTER' ? 20 : 100;
                setUser({ ...user, credits: user.credits + creditsToAdd });
            }
            setView('GENERATOR');
        } catch (err: any) {
            setPaymentError(getErrorMessage(err));
        }
    };
    
    const handlePaymentError = (err: any) => {
        console.error("PayPal Error:", err);
        setPaymentError(getErrorMessage(err));
    };

    const renderContent = () => {
        if (isAuthLoading) return <div className="flex-grow flex items-center justify-center"><Spinner size="12" /></div>;
        if (paymentError) {
             return (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">An Error Occurred</h2>
                    <p className="mb-6 text-gray-400">{paymentError}</p>
                    <button onClick={() => { setPaymentError(null); setView('LANDING'); }} className="text-brand-primary hover:underline">Return to Homepage</button>
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
            <main className="flex-grow container mx-auto px-6">{renderContent()}</main>
            <Footer setView={setView} />
        </div>
    );
};


// ============================================================================
//  ROOT COMPONENT (App)
//  This component's only job is to provide the PayPal context.
// ============================================================================
export default function App() {
  const initialOptions = {
    "client-id": "AT79x4v24KXLI-ROB8BLiKCZEOXR511J34tl0jhZZuat2i3hmfooIgyFDMNGN2c-iLAWIfapEL1CNtYM",
    currency: "USD",
    intent: "capture",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <AppContent />
    </PayPalScriptProvider>
  );
}
