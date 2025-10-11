export interface UploadFile {
  file: File;
  preview: string;
  id: string;
}

export interface HeadshotStyle {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  prompt: string;
}

export interface GeneratedImage {
  id:string;
  src: string;
  isFavorite: boolean;
  styleName: string;
}

export enum AppStep {
  UPLOAD = 'UPLOAD',
  STYLE = 'STYLE',
  GENERATING = 'GENERATING',
  GALLERY = 'GALLERY',
}

export type View = 'LANDING' | 'GENERATOR' | 'LOGIN' | 'SIGNUP' | 'ADMIN' | 'ACCOUNT' | 'PRIVACY' | 'TERMS' | 'PAYMENT';

export type Package = 'STARTER' | 'PRO';

export interface User {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  role: 'user' | 'admin';
  credits: number;
  createdAt: Date | string;
  name?: string;
}

export interface Order {
    id: string;
    uid: string;
    package: Package;
    amount: number;
    status: 'in progress' | 'completed' | 'cancelled';
    createdAt: Date | string;
    paymentId: string;
}