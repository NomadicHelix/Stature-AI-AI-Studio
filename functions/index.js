const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

// Initialize Firebase Admin SDK
admin.initializeApp();

// ============================================================================
//  Function Definitions
// ============================================================================

/**
 * Auth Trigger (v1): This function runs every time a new user is created.
 * It checks if the user is the first one and assigns the 'admin' role if so.
 */
const onUserCreateLogic = async (user) => {
    try {
        const { uid, email, displayName, photoURL } = user;
        
        // Check if this is the very first user
        const listUsersResult = await admin.auth().listUsers(1);
        const isFirstUser = listUsersResult.users.length === 1;
        const role = isFirstUser ? 'admin' : 'user';

        // Set custom claims for role-based security
        await admin.auth().setCustomUserClaims(uid, { role, admin: isFirstUser });

        // Create a corresponding user document in Firestore
        await admin.firestore().collection('users').doc(uid).set({
            uid,
            email,
            displayName,
            photoURL,
            role,
            credits: 0,
            createdAt: new Date().toISOString(),
        });

        console.log(`Successfully created user: ${email} with role: ${role}`);
    } catch (error) {
        console.error("CRITICAL ERROR in onUserCreate trigger:", error);
    }
};

/**
 * Express App for all API endpoints.
 */
const app = express();
app.use(cors({ origin: true }));

// --- Middleware ---
const verifyAppCheck = async (req, res, next) => {
    const appCheckToken = req.header('X-Firebase-AppCheck');
    if (!appCheckToken) return res.status(401).json({ error: 'Unauthorized: No App Check token provided.' });
    try {
        await admin.appCheck().verifyToken(appCheckToken);
        return next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid App Check token.' });
    }
};

const verifyUser = async (req, res, next) => {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(403).json({ error: "Unauthorized: No token provided." });
    try {
        req.user = await admin.auth().verifyIdToken(idToken);
        return next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized: Invalid token." });
    }
};

const verifyAdmin = async (req, res, next) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  if (!idToken) return res.status(403).json({ error: "Unauthorized: No token provided." });
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (decodedToken.admin === true) {
      req.user = decodedToken;
      return next();
    }
    return res.status(403).json({ error: "Unauthorized: Admin access required." });
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token." });
  }
};

const verifyUserOrAdmin = async (req, res, next) => {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(403).json({ error: "Unauthorized: No token provided." });
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        if (decodedToken.uid === req.params.uid || decodedToken.admin === true) {
            req.user = decodedToken;
            return next();
        }
        return res.status(403).json({ error: "Forbidden" });
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized: Invalid token." });
    }
};

app.use(verifyAppCheck);

// --- API Endpoints ---
app.post("/createOrder", verifyUser, async (req, res) => {
    try {
        const { packageType, paymentDetails } = req.body;
        const uid = req.user.uid;
        if (!packageType || !paymentDetails) return res.status(400).json({ error: 'Invalid request body.' });

        const creditsToAdd = packageType === 'STARTER' ? 20 : 100;
        const amount = packageType === 'STARTER' ? 29.00 : 49.00;

        const orderRef = admin.firestore().collection('orders').doc();
        await orderRef.set({
            uid, package: packageType, amount, status: 'completed', createdAt: new Date().toISOString(), paymentId: paymentDetails.orderID,
        });
        await admin.firestore().collection('users').doc(uid).update({
            credits: admin.firestore.FieldValue.increment(creditsToAdd)
        });
        return res.status(201).json({ message: "Order created successfully", orderId: orderRef.id });
    } catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({ error: "Failed to create order." });
    }
});

app.get("/users", verifyAdmin, async (req, res) => {
    try {
        const listUsersResult = await admin.auth().listUsers(1000);
        const userRecords = listUsersResult.users.map(user => ({ uid: user.uid, email: user.email, displayName: user.displayName }));
        return res.status(200).json(userRecords);
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch users." });
    }
});

app.post("/setAdmin", verifyAdmin, async (req, res) => {
    try {
        const { uid } = req.body;
        await admin.auth().setCustomUserClaims(uid, { admin: true, role: 'admin' });
        await admin.firestore().collection('users').doc(uid).update({ role: "admin" });
        return res.status(200).json({ message: "Admin role set successfully." });
    } catch (error) {
        return res.status(500).json({ error: "Failed to set admin role." });
    }
});

app.get("/orders/:uid", verifyUserOrAdmin, async (req, res) => {
    try {
        const { uid } = req.params;
        const ordersSnapshot = await admin.firestore().collection("orders").where("uid", "==", uid).get();
        const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch orders." });
    }
});

app.get("/orders", verifyAdmin, async (req, res) => {
    try {
        const ordersSnapshot = await admin.firestore().collection("orders").get();
        const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch all orders." });
    }
});

app.post("/cancelOrder", verifyAdmin, async (req, res) => {
    try {
        const { orderId } = req.body;
        await admin.firestore().collection("orders").doc(orderId).update({ status: "cancelled" });
        return res.status(200).json({ message: "Order cancelled successfully." });
    } catch (error) {
        return res.status(500).json({ error: "Failed to cancel order." });
    }
});


// ============================================================================
//  Exports
// ============================================================================

exports.onUserCreate = functions.auth.user().onCreate(onUserCreateLogic);
exports.api = functions.https.onRequest(app);
