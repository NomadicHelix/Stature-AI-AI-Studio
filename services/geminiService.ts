
import { auth } from '../firebaseConfig';
import type { HeadshotStyle } from "../types";

const getToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated.");
  return await user.getIdToken();
}

// This function calls YOUR backend to get a style suggestion
const suggestStyle = async (profession: string): Promise<HeadshotStyle> => {
  const token = await getToken();

  const response = await fetch('/api/suggest-style', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ profession }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to suggest style from backend.');
  }

  const data = await response.json();
  // The backend now returns a HeadshotStyle object
  return data.style;
};

// This function calls YOUR backend to generate the images
const generateHeadshots = async (
  images: File[], 
  style: HeadshotStyle,
  profession: string,
  imageCount: number,
  removePiercings: boolean
): Promise<string[]> => {
  const token = await getToken();

  // We use FormData because we are sending files
  const formData = new FormData();
  formData.append('style', style.name); // Send the style name as a string
  formData.append('profession', profession);
  formData.append('imageCount', imageCount.toString());
  formData.append('removePiercings', String(removePiercings));
  
  images.forEach(image => {
    formData.append('images', image);
  });

  const response = await fetch('/api/generate-headshots', {
    method: 'POST',
    headers: {
      // 'Content-Type' is set to 'multipart/form-data' by the browser automatically
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate headshots from backend.');
  }

  const data = await response.json();
  // The backend now guarantees a clean array of base64 image strings
  return data.images;
};

export { suggestStyle, generateHeadshots };
