export type UserType = "creator" | "brand" | "agency";

export interface User {
  id: string;
  email: string;
  phone?: string;
  type: UserType;
  kycStatus: "pending" | "verified" | "rejected" | "none";
  createdAt: string;
}

export interface CreatorProfile {
  userId: string;
  username: string;
  niche: string;
  bio: string;
  avatar?: string;
  cover?: string;
  socialLinks: {
    tiktok?: string;
    youtube?: string;
    instagram?: string;
    spotify?: string;
  };
}

export interface BrandProfile {
  userId: string;
  companyName: string;
  industry: string;
  website?: string;
  logo?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: "ad_revenue" | "tip" | "sponsorship" | "product_sale" | "withdrawal";
  amountAOA: number;
  amountUSD: number;
  source: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

export interface Wallet {
  balanceAOA: number;
  balanceUSD: number;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  brandId: string;
  title: string;
  description: string;
  budget: number;
  niche: string[];
  requirements: string;
  deadline: string;
  status: "active" | "closed" | "draft";
  brandName?: string;
  brandLogo?: string;
}
