import { useState, useEffect } from "react";
import type { View, Package, User } from "./types";
import { auth, db } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getErrorMessage } from "./utils";

// COMPONENT IMPORTS
import LandingPage from "./components/LandingPage";
import AuthForm from "./components/AuthForm";
import GeneratorPage from "./components/GeneratorPage";
import AccountPage from "./components/AccountPage";
import AdminPage from "./components/AdminPage";
import PaymentPage from "./components/PaymentPage";
import { PrivacyPage, TermsPage } from "./components/LegalPages";
import { Header, Footer } from "./components/Layout";
import Spinner from "./components/Spinner";

// ============================================================================
//  CORE APP LOGIC (AppContent)
// ============================================================================
const AppContent = () => {
  const [view, setView] = useState<View>("LANDING");
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [appError, setAppError] = useState<string | null>(null);
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);

  const fetchUserData = async (firebaseUser) => {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    const tokenResult = await firebaseUser.getIdTokenResult(true);
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      const claimRole = tokenResult.claims.role;
      const role: "user" | "admin" =
        claimRole === "admin" || claimRole === "user" ? claimRole : "user";
      setUser({ ...userData, role });
    } else {
      const newUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        role: "user",
        credits: 0,
        createdAt: new Date(),
      };
      await setDoc(userDocRef, newUser);
      setUser(newUser);
    }
    setIsLoggedIn(true);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsAuthLoading(true);
      setAppError(null);
      try {
        if (firebaseUser) {
          await fetchUserData(firebaseUser);
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

  const handleNavigate = (targetView: View, targetId?: string) => {
    setView(targetView);
    if (targetId) {
      setTimeout(() => setScrollTarget(targetId), 0);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    handleNavigate("LANDING");
  };
  const handleAuthSuccess = () => handleNavigate("GENERATOR");
  const handleGetStarted = () =>
    handleNavigate(isLoggedIn ? "GENERATOR" : "LOGIN");
  const handlePlanSelected = (pkg: Package) => {
    setSelectedPackage(pkg);
    handleNavigate(isLoggedIn ? "PAYMENT" : "LOGIN");
  };
  const handlePaymentError = (err: any) => {
    console.error("PayPal Error:", err);
    setPaymentError(getErrorMessage(err));
  };
  const handlePaymentSuccess = async (_details: any, data: any) => {
    setPaymentError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch("/api/createOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          packageType: selectedPackage,
          paymentDetails: { orderID: data.orderID },
        }),
      });

      if (!response.ok) {
        const responseClone = response.clone();
        let errorBody;
        try {
          errorBody = await responseClone.json();
        } catch (e) {
          const errorText = await response.text();
          throw new Error(
            errorText || `Server responded with status: ${response.status}`,
          );
        }
        throw new Error(errorBody.error || JSON.stringify(errorBody));
      }

      // Instead of optimistic update, re-fetch user data to get the new credit count
      if (auth.currentUser) {
        await fetchUserData(auth.currentUser);
      }

      handleNavigate("GENERATOR");
    } catch (err: any) {
      setPaymentError(getErrorMessage(err));
    }
  };

  const onScrollComplete = () => {
    setScrollTarget(null);
  };

  const renderContent = () => {
    if (isAuthLoading)
      return (
        <div className="flex-grow flex items-center justify-center">
          <Spinner size="12" />
        </div>
      );
    if (appError) {
      return (
        <div className="flex-grow flex items-center justify-center text-center">
          <div>
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              A Critical Error Occurred
            </h2>
            <p className="mb-6 text-gray-400">{appError}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-brand-primary text-brand-dark font-semibold py-2 px-5 rounded-lg hover:bg-brand-secondary"
            >
              Refresh Application
            </button>
          </div>
        </div>
      );
    }
    if (paymentError) {
      return (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            An Error Occurred
          </h2>
          <p className="mb-6 text-gray-400">{paymentError}</p>
          <button
            onClick={() => {
              setPaymentError(null);
              handleNavigate("LANDING");
            }}
            className="text-brand-primary hover:underline"
          >
            Return to Homepage
          </button>
        </div>
      );
    }
    switch (view) {
      case "LANDING":
        return (
          <LandingPage
            onGetStarted={handleGetStarted}
            onPlanSelected={handlePlanSelected}
            scrollTarget={scrollTarget}
            onScrollComplete={onScrollComplete}
          />
        );
      case "LOGIN":
        return (
          <AuthForm
            isLogin={true}
            setView={setView}
            onAuthSuccess={handleAuthSuccess}
          />
        );
      case "SIGNUP":
        return (
          <AuthForm
            isLogin={false}
            setView={setView}
            onAuthSuccess={handleAuthSuccess}
          />
        );
      case "GENERATOR":
        return <GeneratorPage user={user} userPackage={selectedPackage} />;
      case "ACCOUNT":
        return <AccountPage user={user} />;
      case "ADMIN":
        return <AdminPage />;
      case "PAYMENT":
        return (
          <PaymentPage
            selectedPackage={selectedPackage!}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            setView={setView}
          />
        );
      case "PRIVACY":
        return <PrivacyPage />;
      case "TERMS":
        return <TermsPage />;
      default:
        return (
          <LandingPage
            onGetStarted={handleGetStarted}
            onPlanSelected={handlePlanSelected}
            scrollTarget={scrollTarget}
            onScrollComplete={onScrollComplete}
          />
        );
    }
  };

  return (
    <div className="bg-brand-dark min-h-screen font-sans text-white flex flex-col">
      <Header
        currentView={view}
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        user={user}
      />
      <main className="flex-grow container mx-auto px-6">
        {renderContent()}
      </main>
      <Footer setView={setView} />
    </div>
  );
};

// ============================================================================
//  ROOT COMPONENT (App)
// ============================================================================
export default function App() {
  return (
    <AppContent />
  );
}
