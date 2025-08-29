export interface User {
  id: string;
  name?: string | null;
  dob?: string | null;
  email: string;
  isEmailVerified: boolean;
  hasGoogleAuth: boolean;
  createdAt: string;
}
