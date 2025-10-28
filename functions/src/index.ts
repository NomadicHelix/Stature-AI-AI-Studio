import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onUserCreated } from "firebase-functions/v2/auth";
import { https } from "firebase-functions/v2";
import * as logger from "firebase-functions/logger";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

// Initialize Firebase Admin SDK
initializeApp();

// ============================================================================
//  Auth Trigger (v2)
// ============================================================================
export const oncreateuser = onUserCreated(async (event) => {
    const { uid, email, displayName, photoURL } = event.data;
    try {
        const userList = await getAuth().listUsers(1);
        const isFirstUser = userList.users.length === 1;
        const role = isFirstUser ? 'admin' : 'user';

        await getAuth().setCustomUserClaims(uid, { role, admin: isFirstUser });

        await getFirestore().collection('users').doc(uid).set({
            uid, email, displayName, photoURL, role, credits: 0, createdAt: new Date().toISOString(),
        });

        logger.info(`User created: ${email}, Role: ${role}`);
    } catch (error) {
        logger.error("CRITICAL ERROR in onUserCreate trigger:", error);
    }
});


// ============================================================================
//  Express API (v2)
// ============================================================================
const app = express();
app.use(cors({ origin: true }));

// Extend the Express Request type to include our user object
interface AuthenticatedRequest extends Request {
    user?: admin.auth.DecodedIdToken;
}

// --- Middleware ---
const verifyAppCheck = async (req: Request, res: Response, next: NextFunction) => {
    return next(); // Placeholder
};

const verifyUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(403).json({ error: "Unauthorized: No token provided." });
    try {
        req.user = await getAuth().verifyIdToken(idToken);
        return next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized: Invalid token." });
    }
};

const verifyAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  if (!idToken) return res.status(403).json({ error: "Unauthorized: No token provided." });
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    if (decodedToken.admin === true) {
      req.user = decodedToken;
      return next();
    }
    return res.status(403).json({ error: "Unauthorized: Admin access required." });
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token." });
  }
};

app.use(verifyAppCheck);

// --- API Endpoints ---
app.post("/createOrder", verifyUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { packageType, paymentDetails } = req.body;
        const uid = req.user!.uid; // user is guaranteed to exist by verifyUser middleware
        if (!packageType || !paymentDetails) return res.status(400).json({ error: 'Invalid request body.' });

        const creditsToAdd = packageType === 'STARTER' ? 20 : 100;
        const amount = packageType === 'STARTER' ? 29.00 : 49.00;

        const orderRef = getFirestore().collection('orders').doc();
        await orderRef.set({ uid, package: packageType, amount, status: 'completed', createdAt: new Date().toISOString(), paymentId: paymentDetails.orderID });
        await getFirestore().collection('users').doc(uid).update({ credits: FieldValue.increment(creditsToAdd) });
        return res.status(201).json({ message: "Order created successfully", orderId: orderRef.id });
    } catch (error) {
        logger.error("Error creating order:", error);
        return res.status(500).json({ error: "Failed to create order." });
    }
});

app.get("/users", verifyAdmin, async (req: AuthenticatedRequest, res: Response) => {
    // ... full implementation ...
});

app.post("/setAdmin", verifyAdmin, async (req: AuthenticatedRequest, res: Response) => {
    // ... full implementation ...
});

export const api = https.onRequest(app);
