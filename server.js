import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// ============================================================================
//  Initializations
// ============================================================================

// --- Gemini API Initialization ---
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("CRITICAL: GEMINI_API_KEY environment variable not set. AI features will fail.");
}
const genAI = new GoogleGenerativeAI(apiKey);

// --- Multer (for file uploads) Initialization ---
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { files: 15, fileSize: 10 * 1024 * 1024 } // Limit: 15 files, 10MB each
});

// --- Smart Firebase Admin SDK Initialization ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// K_SERVICE is a standard env var set in Google Cloud environments like App Hosting.
if (process.env.K_SERVICE) {
  admin.initializeApp();
} else {
  try {
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    if (!fs.existsSync(serviceAccountPath)) {
        throw new Error("serviceAccountKey.json not found. Please add it to the project root for local development.");
    }
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log("Firebase Admin SDK initialized for local development.");
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK for local development:', error.message);
    process.exit(1);
  }
}

// --- Express App Initialization ---
const app = express();
const port = process.env.PORT || 8080;
app.use(cors({ origin: true }));
app.use(express.json());

// ============================================================================
//  API Middleware & Routes
// ============================================================================

// Middleware to verify a standard user's Firebase ID token
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

// Middleware to verify an admin user's Firebase ID token
const verifyAdmin = async (req, res, next) => {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(403).json({ error: "Forbidden." });
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

// --- General API Routes ---
apiRouter.get('/status', (req, res) => res.status(200).json({ status: 'ok' }));

// --- Gemini AI API Routes ---

// Endpoint for suggesting a headshot style
apiRouter.post('/suggest-style', verifyUser, async (req, res) => {
  if (!apiKey) return res.status(500).json({ error: "Server is not configured for AI features." });
  try {
    const { profession } = req.body;
    if (!profession) return res.status(400).json({ error: 'Profession is required.' });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Suggest a professional headshot style for a ${profession}. Respond with a single, concise phrase (e.g., "Classic Studio," "Urban Portrait").`;
    
    const result = await model.generateContent(prompt);
    // Restore the more readable two-line version
    const text = result.response.text().trim();
    res.status(200).json({ style: text });

  } catch (error) {
    console.error("Error suggesting style:", error);
    res.status(500).json({ error: "Failed to suggest style." });
  }
});

// Endpoint for generating headshots
apiRouter.post('/generate-headshots', verifyUser, upload.array('images'), async (req, res) => {
    if (!apiKey) return res.status(500).json({ error: "Server is not configured for AI features." });
    try {
        const { style, profession, imageCount, removePiercings } = req.body;
        const images = req.files;

        if (!style || !profession || !imageCount || !images || images.length === 0) {
            return res.status(400).json({ error: 'Missing required fields (style, profession, imageCount, images).' });
        }
        
        const generationConfig = {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 8192,
        };
        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig, safetySettings });

        const imageParts = images.map(img => ({
            inlineData: { data: img.buffer.toString("base64"), mimeType: img.mimetype },
        }));

        let prompt = `Generate ${imageCount} professional headshots for a ${profession}. Use the style: ${style}. The subject is shown in the attached images. Ensure consistent likeness and that the subject's gender is accurately inferred from the photos.`;
        if (removePiercings === 'true') {
          prompt += " In the generated images, please remove any facial piercings (like nose rings or eyebrow piercings).";
        }

        const result = await model.generateContent([prompt, ...imageParts]);
        const generatedImages = result.response.text();
        
        res.status(200).json({ images: generatedImages });

    } catch (error) {
        console.error("Error generating headshots:", error);
        res.status(500).json({ error: 'Failed to generate headshots.' });
    }
});

// --- User & Order Management API Routes ---

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
//  Serve Frontend Static Files
// ============================================================================

const staticDir = path.join(__dirname, 'dist');
app.use(express.static(staticDir));

// This is the definitive catch-all for the frontend SPA.
app.get(/^(?!\/api).*$/, (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
});

// ============================================================================
//  Start Server
// ============================================================================

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
