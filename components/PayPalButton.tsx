import { useEffect } from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import type { OnApproveData } from "@paypal/paypal-js";
import Spinner from "./Spinner";

interface PayPalButtonProps {
  amount: string;
  onSuccess: (details: any, data: OnApproveData) => void;
  onError: (err: any) => void;
}

const PayPalButtonWrapper: React.FC<PayPalButtonProps> = ({
  amount,
  onSuccess,
  onError,
}) => {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  useEffect(() => {
    if (isRejected) {
      onError(
        "Failed to load the PayPal script. Please check your internet connection or try again later.",
      );
    }
  }, [isRejected, onError]);

  const createOrder = (_data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: amount,
          },
        },
      ],
    });
  };

  const onApprove = (data: OnApproveData, actions: any) => {
    return actions.order.capture().then((details: any) => {
      onSuccess(details, data);
    });
  };

  const handleError = (err: any) => {
    onError(err);
  };

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-12">
        <Spinner />
      </div>
    );
  }

  return (
    <PayPalButtons
      style={{
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "paypal",
      }}
      createOrder={createOrder}
      onApprove={onApprove}
      onError={handleError}
    />
  );
};

export default PayPalButtonWrapper;
