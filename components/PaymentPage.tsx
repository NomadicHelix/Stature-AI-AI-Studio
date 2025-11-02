import React from "react";
import type { Package, View } from "../types";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PayPalButton from "./PayPalButton";
import { SparklesIcon } from "./Icons";

interface PaymentPageProps {
  selectedPackage: Package;
  onPaymentSuccess: (details: any, data: any) => void;
  onPaymentError: (err: any) => void;
  setView: (view: View) => void;
}

const packageDetails = {
  STARTER: {
    name: "Starter",
    price: "29.00",
    features: ["20 Headshots", "2 Styles", "Standard Resolution"],
  },
  PRO: {
    name: "Pro",
    price: "49.00",
    features: ["100 Headshots", "5 Styles", "High Resolution"],
  },
};

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb";

const PaymentPage: React.FC<PaymentPageProps> = ({
  selectedPackage,
  onPaymentSuccess,
  onPaymentError,
  setView,
}) => {
  if (!selectedPackage || !packageDetails[selectedPackage]) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">
          No package selected.
        </h2>
        <button
          onClick={() => setView("LANDING")}
          className="text-brand-primary hover:underline"
        >
          Please select a plan to continue.
        </button>
      </div>
    );
  }

  const details = packageDetails[selectedPackage];
  const paypalOptions = {
    "client-id": PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <div className="w-full max-w-lg mx-auto py-20">
        <div className="bg-brand-gray/30 p-8 rounded-2xl border border-gray-700 shadow-2xl">
          <h2 className="text-3xl font-extrabold text-white text-center mb-2">
            Complete Your Order
          </h2>
          <p className="text-gray-400 text-center mb-8">
            You're one step away from amazing headshots.
          </p>

          <div className="bg-brand-dark/50 p-6 rounded-xl border border-brand-primary/20">
            <h3
              className={`text-2xl font-bold text-brand-${selectedPackage === "PRO" ? "primary" : "secondary"}`}
            >
              {details.name} Plan
            </h3>
            <p className="text-5xl font-bold text-white my-4">
              ${details.price}
            </p>
            <ul className="space-y-3 text-gray-300 mb-6">
              {details.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <SparklesIcon className="w-5 h-5 text-brand-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <p className="text-center text-gray-400 mb-4">
              Proceed with secure payment:
            </p>
            <PayPalButton
              amount={details.price}
              onSuccess={onPaymentSuccess}
              onError={onPaymentError}
            />
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default PaymentPage;
