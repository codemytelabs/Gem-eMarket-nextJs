export interface RegisterSellerInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  locationCity?: string;
}

export interface RegisterBuyerInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    planName: string;
    shopSlug?: string;
  };
}
