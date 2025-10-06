import type { HeadshotStyle } from './types';

export const STYLES: HeadshotStyle[] = [
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Clean, professional, and confident. Perfect for LinkedIn and company websites.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    prompt: 'Generate a range of professional corporate headshots. The subject should be in various modern corporate environments, like a sleek boardroom, a bright corner office with a cityscape, or a professional building lobby with striking architectural details. Attire should be varied but professional, including sharp blazers, classic business suits, and stylish blouses. Each image should have distinct, flattering lighting that conveys confidence and power. High-resolution, photorealistic.'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Expressive and artistic. Ideal for artists, designers, and innovators.',
    imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    prompt: 'Generate an array of creative and artistic headshots. The subject should be featured in different inspiring environments, such as a gallery with abstract art, a studio filled with natural light and interesting textures, or an urban setting with unique architecture. Attire should be expressive and stylish. Each composition should be thoughtful and engaging, hinting at the subject\'s craft without being distracting. High-resolution, photorealistic.'
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Friendly and approachable. Great for social media and personal branding.',
    imageUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=800&auto=format&fit=crop',
    prompt: 'Generate a collection of friendly and approachable casual headshots. The subject should be in a variety of warm and inviting settings, such as a bright, modern coffee shop with soft morning light, an artistic loft with exposed brick, or a scenic, relaxed outdoor setting with natural foliage. Clothing should be stylish and smart-casual, like high-quality sweaters, crisp shirts, or simple, elegant t-shirts. Each shot must feel authentic, with a genuine, warm expression. High-resolution, photorealistic.'
  },
   {
    id: 'dramatic',
    name: 'Dramatic',
    description: 'Bold and impactful. For actors, public speakers, and thought leaders.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    prompt: 'Generate several dramatic and impactful headshots. Each image should utilize a different striking, minimalist background—perhaps with bold architectural lines, deep, rich textures, or stark gradients. The lighting must be cinematic and high-contrast, sculpting the face differently in each shot to create powerful and memorable images. The expression should be intense and captivating. Explore both black and white and desaturated color palettes. High-resolution, photorealistic.'
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