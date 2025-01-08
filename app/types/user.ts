export interface IUser {
    _id: string;
    fullName: string | null;
    email: string;
    password: string | null;
    phone: string | null;
    isActive: boolean;
    country: string | null;
    profilePhoto: string | null;
    isVerified: boolean;
  }
  