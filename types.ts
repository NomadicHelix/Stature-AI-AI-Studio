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

export type View = 'LANDING' | 'GENERATOR' | 'LOGIN' | 'ADMIN' | 'ACCOUNT' | 'PRIVACY' | 'TERMS';

export type Package = 'STARTER' | 'PRO';

export interface User {
  credits: number;
  name: string;
  email: string;
}

export interface Order {
    id: string;
    date: string;
    description: string;
    amount: string;
}