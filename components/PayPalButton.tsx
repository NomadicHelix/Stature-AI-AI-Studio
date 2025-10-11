import React, { useEffect, useRef } from 'react';

interface PayPalButtonProps {
    amount: string;
    onSuccess: (details: any, data: any) => void;
    onError: (err: any) => void;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({ amount, onSuccess, onError }) => {
    const paypalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!window.paypal) {
            onError("PayPal SDK not loaded.");
            return;
        }
        if (paypalRef.current) {
            // Clear out the button container on re-render
            paypalRef.current.innerHTML = '';
            
            try {
                window.paypal.Buttons({
                    createOrder: (data: any, actions: any) => {
                        return actions.order.create({
                            purchase_units: [{
                                amount: {
                                    value: amount,
                                },
                            }],
                        });
                    },
                    onApprove: async (data: any, actions: any) => {
                        const details = await actions.order.capture();
                        onSuccess(details, data);
                    },
                    onError: (err: any) => {
                        onError(err);
                    },
                }).render(paypalRef.current);
            } catch (error) {
                onError(error);
            }
        }
    }, [amount, onSuccess, onError]);

    return <div ref={paypalRef}></div>;
};

// Add this to your types.ts or a global declaration file if you haven't already
declare global {
    interface Window {
        paypal: any;
    }
}


export default PayPalButton;
