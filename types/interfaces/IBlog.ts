export interface IBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImageUrl?: string;
  authorId: string;
  authorName: string;
  isSponsored: boolean;
  sponsorSellerId?: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
