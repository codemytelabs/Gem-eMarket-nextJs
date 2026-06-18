export interface IUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  phoneVerified: boolean;
  role: "ADMIN" | "SELLER" | "BUYER";
  isVerified: boolean;
  verifiedAt?: Date;
  avatarUrl?: string;
  shopSlug?: string;
  shopBio?: string;
  shopBannerUrl?: string;
  whatsappNumber?: string;
  locationCity?: string;
  specialties: string[];
  shopMetaTitle?: string;
  shopMetaDescription?: string;
  planName: string;
  createdAt: Date;
  updatedAt: Date;
}
