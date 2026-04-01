export type UserType = "creator" | "brand" | "agency" | "admin";

export interface User {
  uid: string;
  email: string;
  type: UserType;
  kycStatus: "none" | "pending" | "verified";
  createdAt: string;
}

export interface CreatorProfile {
  uid: string;
  name: string;
  plan: "free" | "premium" | "agency";
  niche?: string;
  location?: string;
  bio?: string;
  platform?: string;
  platforms?: {
    id: string;
    name: string;
    status: "connected" | "pending" | "error";
    stats?: {
      subs: string;
      views: string;
      revenue: number;
    };
    lastSync: string;
  }[];
  stats?: {
    followers: number;
    views: number;
    likes: number;
  };
  balance?: {
    aoa: number;
    usd: number;
  };
  updatedAt: string;
}

export interface BrandProfile {
  uid: string;
  companyName: string;
  industry?: string;
  location?: string;
  website?: string;
  balance?: {
    aoa: number;
    usd: number;
  };
  updatedAt: string;
}

export interface Campaign {
  id: string;
  brandId: string;
  title: string;
  description: string;
  budget: number;
  status: "draft" | "active" | "completed" | "cancelled";
  createdAt: string;
}

export interface CampaignApplication {
  id: string;
  campaignId: string;
  creatorId: string;
  brandId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  date: any; // Firestore Timestamp
  description: string;
  type: 'withdrawal' | 'ad_revenue' | 'tip' | 'sponsorship' | 'product_sale' | 'campaign_payment';
  amount: number;
  currency: 'AOA' | 'USD';
  status: 'pending' | 'completed' | 'failed';
  method?: string;
}
