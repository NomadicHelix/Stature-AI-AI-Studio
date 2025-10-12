const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

// Initialize Firebase Admin SDK
admin.initializeApp();

// ============================================================================
//  Auth Trigger (v1): onUserCreate
//  This function runs every time a new user is created in Firebase Auth.
// ============================================================================
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
    try {
        const { uid, email, displayName, photoURL } = user;
        const listUsersResult = await admin.auth().listUsers(1);
        const isFirstUser = listUsersResult.users.length === 1;
        const role = isFirstUser ? 'admin' : 'user';

        await admin.auth().setCustomUserClaims(uid, { role, admin: isFirstUser });

        await admin.firestore().collection('users').doc(uid).set({
            uid, email, displayName, photoURL, role, credits: 0, createdAt: new Date().toISOString(),
        });

        console.log(`Successfully created user: ${email} with role: ${role}`);
        return null;
    } catch (error) {
        console.error("CRITICAL ERROR in onUserCreate trigger:", error);
        return null;
    }
});


// ============================================================================
//  Express API
// ============================================================================
const app = express();
app.use(cors({ origin: true }));

// ============================================================================
//  "Gold Standard" Diagnostic Logging
// ============================================================================
app.use((req, res, next) => {
    console.log("============================================================");
    console.log(`[DIAGNOSTIC LOG] Request Received by Express App:`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Path: ${req.path}`);
    console.log(`Method: ${req.method}`);
    console.log("============================================================");
    next();
});

// ============================================================================
//  Middleware Definitions
// ============================================================================
const verifyAppCheck = async (req, res, next) => {
    // NOTE: Temporarily disabled for easier local development. Re-enable before production.
    return next();
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

// ============================================================================
//  API Endpoints
// ============================================================================
app.post("/createOrder", verifyUser, async (req, res) => {
    try {
        const { packageType, paymentDetails } = req.body;
        const uid = req.user.uid;
        if (!packageType || !paymentDetails) return res.status(400).json({ error: 'Invalid request body.' });
        const creditsToAdd = packageType === 'STARTER' ? 20 : 100;
        const amount = packageType === 'STARTER' ? 29.00 : 49.00;
        const orderRef = admin.firestore().collection('orders').doc();
        await orderRef.set({ uid, package: packageType, amount, status: 'completed', createdAt: new Date().toISOString(), paymentId: paymentDetails.orderID });
        await admin.firestore().collection('users').doc(uid).update({ credits: admin.firestore.FieldValue.increment(creditsToAdd) });
        return res.status(201).json({ message: "Order created successfully", orderId: orderRef.id });
    } catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({ error: "Failed to create order." });
    }
});

app.get("/users", verifyAdmin, async (req, res) => {
    console.log("--> Request successfully reached /users endpoint.");
    try {
        const listUsersResult = await admin.auth().listUsers(1000);
        const firestoreUsers = await admin.firestore().collection('users').get();
        const firestoreUsersMap = new Map();
        firestoreUsers.forEach(doc => { firestoreUsersMap.set(doc.id, doc.data()); });
        const combinedUsers = listUsersResult.users.map(user => {
            const firestoreData = firestoreUsersMap.get(user.uid) || {};
            return {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || firestoreData.displayName,
                role: firestoreData.role || 'user',
                credits: firestoreData.credits ?? 0,
            };
        });
        return res.status(200).json(combinedUsers);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: "Failed to fetch users." });
    }
});

app.post("/setAdmin", verifyAdmin, async (req, res) => { /* ... full implementation ... */ });
app.get("/orders/:uid", verifyUserOrAdmin, async (req, res) => { /* ... full implementation ... */ });
app.get("/orders", verifyAdmin, async (req, res) => { /* ... full implementation ... */ });
app.post("/cancelOrder", verifyAdmin, async (req, res) => { /* ... full implementation ... */ });

// ============================================================================
//  Exports
// ============================================================================
exports.api = functions.https.onRequest(app);
