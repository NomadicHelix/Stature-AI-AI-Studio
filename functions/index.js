const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();

// Auth Trigger (v1)
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
    const { uid, email, displayName, photoURL } = user;
    try {
        const listUsersResult = await admin.auth().listUsers(1);
        const isFirstUser = listUsersResult.users.length === 1;
        const role = isFirstUser ? 'admin' : 'user';

        await admin.auth().setCustomUserClaims(uid, { role, admin: isFirstUser });

        await admin.firestore().collection('users').doc(uid).set({
            uid, email, displayName, photoURL, role, credits: 0, createdAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error in onUserCreate trigger:", error);
    }
});

// Express API (v1)
const app = express();
app.use(cors({ origin: true }));

// Health Check Endpoint
app.get('/status', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

const verifyUser = async (req, res, next) => {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(403).json({ error: "Unauthorized." });
    try {
        req.user = await admin.auth().verifyIdToken(idToken);
        next();
    } catch (error) {
        res.status(401).json({ error: "Unauthorized." });
    }
};

const verifyAdmin = async (req, res, next) => {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(403).json({ error: "Unauthorized." });
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        if (decodedToken.admin) {
            req.user = decodedToken;
            next();
        } else {
            res.status(403).json({ error: "Forbidden." });
        }
    } catch (error) {
        res.status(401).json({ error: "Unauthorized." });
    }
};

app.post('/createOrder', verifyUser, async (req, res) => {
    console.log("Received order creation request:", req.body);
    try {
        const { packageType, paymentDetails } = req.body;
        const uid = req.user.uid;
        if (!packageType || !paymentDetails) return res.status(400).json({ error: 'Invalid request.' });

        const creditsToAdd = packageType === 'STARTER' ? 20 : 100;
        const amount = packageType === 'STARTER' ? 29.00 : 49.00;

        const orderRef = admin.firestore().collection('orders').doc();
        await orderRef.set({
            uid,
            package: packageType,
            amount,
            status: 'completed',
            createdAt: new Date().toISOString(),
            paymentId: paymentDetails.orderID,
        });

        await admin.firestore().collection('users').doc(uid).update({
            credits: admin.firestore.FieldValue.increment(creditsToAdd)
        });

        res.status(201).json({ message: "Order created successfully", orderId: orderRef.id });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Failed to create order." });
    }
});

app.get('/users', verifyAdmin, async (_req, res) => {
    console.log("Attempting to fetch users...");
    try {
        const listUsersResult = await admin.auth().listUsers(1000);
        console.log("Successfully fetched users.");
        res.status(200).json(listUsersResult.users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users." });
    }
});

app.post('/setAdmin', verifyAdmin, async (req, res) => {
    console.log("Attempting to set admin:", req.body);
    try {
        const { uid } = req.body;
        if (!uid) return res.status(400).json({ error: 'UID is required.' });
        await admin.auth().setCustomUserClaims(uid, { admin: true, role: 'admin' });
        await admin.firestore().collection('users').doc(uid).update({ role: 'admin' });
        console.log("Successfully set admin.");
        res.status(200).json({ message: `Successfully made ${uid} an admin.` });
    } catch (error) {
        console.error("Error setting admin:", error);
        res.status(500).json({ error: "Failed to set admin." });
    }
});

exports.api = functions.https.onRequest(app);
