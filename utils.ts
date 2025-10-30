/**
 * Intelligently extracts a user-friendly error message from any error object.
 * @param error The error object, which can be of any type.
 * @returns A string representing the error message.
 */
export const getErrorMessage = (error: any): string => {
  // If the error is a string, return it directly.
  if (typeof error === "string") {
    return error;
  }
  // If the error has a 'message' property (e.g., standard Error object), use that.
  if (error && typeof error.message === "string") {
    // Handle specific Firebase error codes for a better user experience.
    switch (error.code) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-not-found":
      case "auth/invalid-credential":
        return "Invalid credentials. Please check your email and password.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/email-already-in-use":
        return "An account already exists with this email address.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      // Add other specific codes as needed.
      default:
        return error.message;
    }
  }
  // If the error is an object, try to stringify it.
  if (typeof error === "object" && error !== null) {
    try {
      const str = JSON.stringify(error);
      // Avoid returning an empty object string.
      if (str !== "{}") return str;
    } catch {
      // Fallback if stringification fails.
    }
  }
  // Default fallback message.
  return "An unexpected error occurred. Please try again.";
};
