import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import path from 'path';

// Initialize Firebase Admin SDK
// This will automatically use the correct credentials in the App Hosting environment.
admin.initializeApp();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors({ origin: true }));
app.use(express.json());

// ============================================================================
//  API Middleware & Routes (No changes needed here)
// ============================================================================

const verifyUser = async (req, res, next) => {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(403).json({ error: "Unauthorized." });
    try {
        req.user = await admin.auth().verifyIdToken(idToken);
        next();
    } catch (error) {
        console.error("User verification error:", error);
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
        console.error("Admin verification error:", error);
        res.status(401).json({ error: "Unauthorized." });
    }
};

const apiRouter = express.Router();

apiRouter.get('/status', (req, res) => res.status(200).json({ status: 'ok' }));

apiRouter.post('/createOrder', verifyUser, async (req, res) => {
    console.log("Received order creation request for user:", req.user.uid);
    try {
        const { packageType, paymentDetails } = req.body;
        const uid = req.user.uid;
        if (!packageType || !paymentDetails) return res.status(400).json({ error: 'Invalid request body.' });

        const creditsToAdd = packageType === 'STARTER' ? 20 : 100;
        const orderRef = admin.firestore().collection('orders').doc();
        
        await orderRef.set({
            uid,
            package: packageType,
            amount: packageType === 'STARTER' ? 29.00 : 49.00,
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

apiRouter.get('/users', verifyAdmin, async (req, res) => {
    console.log("Admin user", req.user.uid, "attempting to fetch users...");
    try {
        const listUsersResult = await admin.auth().listUsers(1000);
        res.status(200).json(listUsersResult.users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users." });
    }
});

apiRouter.post('/setAdmin', verifyAdmin, async (req, res) => {
    console.log("Admin user", req.user.uid, "attempting to set admin:", req.body);
    try {
        const { uid } = req.body;
        if (!uid) return res.status(400).json({ error: 'UID is required.' });
        await admin.auth().setCustomUserClaims(uid, { admin: true, role: 'admin' });
        await admin.firestore().collection('users').doc(uid).update({ role: 'admin' });
        res.status(200).json({ message: `Successfully made ${uid} an admin.` });
    } catch (error) {
        console.error("Error setting admin:", error);
        res.status(500).json({ error: "Failed to set admin." });
    }
});

app.use('/api', apiRouter);

// ============================================================================
//  Serve Frontend
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDir = path.join(__dirname, 'dist');

app.use(express.static(staticDir));
app.get('*', (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
});

// ============================================================================
//  Start Server
// ============================================================================

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
