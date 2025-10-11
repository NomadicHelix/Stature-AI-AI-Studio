import type { HeadshotStyle } from './types';

export const STYLES: HeadshotStyle[] = [
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Clean, professional, and confident. Perfect for LinkedIn and company websites.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    prompt: `
      A professional corporate headshot.
      - **Setting**: Modern corporate environments (e.g., sleek boardroom, bright corner office with cityscape, professional lobby).
      - **Attire**: Varied but professional (sharp blazers, classic business suits, stylish blouses).
      - **Lighting**: Flattering, conveying confidence and power.
      - **Quality**: High-resolution, photorealistic, sharp focus, taken with a high-end DSLR camera.
      - **Negative Prompt**: Avoid illustrations, cartoons, sketches, 3D renders, blurry backgrounds, unrealistic features, distorted anatomy, extra limbs, missing fingers.
    `
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Expressive and artistic. Ideal for artists, designers, and innovators.',
    imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    prompt: `
      A creative and artistic headshot.
      - **Setting**: Inspiring environments (e.g., gallery with abstract art, studio with natural light, urban setting with unique architecture).
      - **Attire**: Expressive and stylish.
      - **Composition**: Thoughtful and engaging, hinting at the subject's craft.
      - **Quality**: High-resolution, photorealistic, artistic lighting, taken with a prime lens.
      - **Negative Prompt**: Avoid corporate settings, bland backgrounds, generic poses, illustrations, 3D renders, unrealistic features.
    `
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Friendly and approachable. Great for social media and personal branding.',
    imageUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=800&auto=format&fit=crop',
    prompt: `
      A friendly and approachable casual headshot.
      - **Setting**: Warm and inviting settings (e.g., bright coffee shop, artistic loft, relaxed outdoor setting).
      - **Attire**: Stylish and smart-casual (high-quality sweaters, crisp shirts, elegant t-shirts).
      - **Expression**: Authentic, warm, and genuine.
      - **Quality**: High-resolution, photorealistic, soft lighting, natural look.
      - **Negative Prompt**: Avoid stiff poses, corporate attire, dramatic lighting, illustrations, 3D renders, unrealistic features.
    `
  },
   {
    id: 'dramatic',
    name: 'Dramatic',
    description: 'Bold and impactful. For actors, public speakers, and thought leaders.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    prompt: `
      A dramatic and impactful headshot.
      - **Setting**: Striking, minimalist backgrounds (e.g., bold architectural lines, deep textures, stark gradients).
      - **Lighting**: Cinematic, high-contrast, sculpting the face.
      - **Expression**: Intense and captivating.
      - **Palette**: Black and white or desaturated colors.
      - **Quality**: High-resolution, photorealistic, professional studio quality.
      - **Negative Prompt**: Avoid cluttered backgrounds, flat lighting, casual attire, illustrations, 3D renders, unrealistic features.
    `
  },
];

export const LANDING_GALLERY_IMAGES = [
  {
    id: 'corporate_gallery',
    name: 'Corporate',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'creative_gallery',
    name: 'Creative',
    imageUrl: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'casual_gallery',
    name: 'Casual',
    imageUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'dramatic_gallery',
    name: 'Dramatic',
    imageUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=800&auto=format&fit=crop'
  }
];