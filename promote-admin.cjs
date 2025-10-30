// This is a one-time use script to promote the first user to an admin role.
// How to use:
// 1. Get the User ID (UID) of the user you want to promote from the Firebase Authentication console.
// 2. Paste the UID into the `USER_ID_TO_PROMOTE` constant below.
// 3. Run the script from your terminal using: `node promote-admin.js`

const admin = require("firebase-admin");

// ============================================================================
//  CONFIGURATION
// ============================================================================
const USER_ID_TO_PROMOTE = "qar6OdRR0wY4aaFpclRDJIjzJ1Z2";

// You must initialize the admin SDK with your service account for this script to work.
// Go to your Firebase Project Settings -> Service accounts and generate a new private key.
// Download the JSON file and place it in this directory.
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ============================================================================
//  MAIN LOGIC
// ============================================================================
async function promoteUserToAdmin() {
  if (USER_ID_TO_PROMOTE === "poop" || !USER_ID_TO_PROMOTE) {
    console.error(
      "ERROR: Please paste the User ID of the user you want to promote into the 'USER_ID_TO_PROMOTE' variable in this script.",
    );
    return;
  }

  try {
    console.log(`Attempting to promote user: ${USER_ID_TO_PROMOTE}`);

    // Set custom authentication claims
    await admin
      .auth()
      .setCustomUserClaims(USER_ID_TO_PROMOTE, { admin: true, role: "admin" });

    // Also update the user's document in Firestore to reflect the change
    await admin.firestore().collection("users").doc(USER_ID_TO_PROMOTE).update({
      role: "admin",
    });

    console.log("✅ Success! The user has been promoted to an admin.");
    console.log(
      "You may need to log out and log back in for the changes to take effect.",
    );
  } catch (error) {
    console.error("❌ Error promoting user:", error.message);
    if (error.code === "auth/user-not-found") {
      console.error(
        "This user does not exist in Firebase Authentication. Please check the UID.",
      );
    }
  }
}

promoteUserToAdmin();
