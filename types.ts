export enum UserRole {
  PRODUCER = 'PRODUCER',
  AFFILIATE = 'AFFILIATE',
  ADMIN = 'ADMIN'
}

export enum ProductType {
  COURSE = 'COURSE',
  EBOOK = 'EBOOK',
  MUSIC = 'MUSIC',
  SERVICE = 'SERVICE',
  SUBSCRIPTION = 'SUBSCRIPTION'
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW'
}

export enum AccessType {
  IMMEDIATE = 'IMMEDIATE',
  MANUAL = 'MANUAL',
  SUBSCRIPTION = 'SUBSCRIPTION'
}

export enum AffiliateApprovalType {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL'
}

export enum PixKeyType {
  CPF = 'CPF',
  CNPJ = 'CNPJ',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  RANDOM = 'RANDOM'
}

export interface AffiliateConfig {
  enabled: boolean;
  commissionRate: number;
  approvalType: AffiliateApprovalType;
  limit?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  role: UserRole;
  balance: number;
  isVerified: boolean; // For 15-17 year olds
  isDarkPlus: boolean; // Subscription status
  darkPlusExpiresAt?: number; // Timestamp for subscription expiry
  avatarUrl?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  commissionRate: number; // Percentage for affiliates
  type: ProductType;
  status?: ProductStatus;
  imageUrl: string;
  salesCount: number;
  ownerId: string;
  // Extended fields
  category?: string;
  slug?: string;
  ctaText?: string;
  contentUrl?: string;
  customSalesPageUrl?: string; // New field for manual product link
  accessType?: AccessType;
  affiliateConfig?: AffiliateConfig;
  // Payment Config
  pixKey?: string;
  pixKeyType?: PixKeyType;
  paymentLink?: string; // External payment link
}

export interface Affiliation {
  id: string;
  productId: string;
  product: Product;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  joinedAt: string;
  clicks: number;
  sales: number;
  earnings: number;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  date: string; // Formatted date string DD/MM/YYYY
  timestamp?: number; // Raw timestamp for sorting
  type: 'sale' | 'commission';
  sellerId: string; // ID of the user who receives the money
}

export interface ChartData {
  name: string;
  value: number;
}

export interface Lesson {
  id: string;
  title: string;
  videoUrl: string; // URL for iframe or video
  description: string;
  duration: string;
  category: string;
  color: string;
}