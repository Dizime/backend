import mongoose from "mongoose";

export enum PremiumType {
  NONE = 0,
  BASIC = 1,
  PRO = 2,
}

export enum UserFlags {
  NONE = 0,
  STAFF = 1 << 0,
  PARTNER = 1 << 1,
  PREMIUM = 1 << 2,
  VERIFIED_DEVELOPER = 1 << 3,
}

export enum UserTypes {
  USER = 0,
  BOT = 1,
  SYSTEM = 2,
}

export enum VerificationLevel {
  NONE = 0,
  EMAIL = 1 << 0,
  PHONE = 1 << 2,
  TWO_FACTOR = 1 << 3,
  VERIFIED_BOT = 1 << 4,
}

export type User = {
  username: string;
  discriminator: string;
  id: string;
  avatar?: string;
  avatarUrl?: string;
  banner?: string;
  bannerUrl?: string;
  bio?: string;
  locale?: string;
  mfaEnabled:  boolean;
  premiumType: PremiumType;
  flags: number;
  email?: string;
  verified: number;
  createdAt: Date;
  type: UserTypes;
  token?: string;
  password?: string;
  receiveEmails?: boolean;
}

export const userSchema = new mongoose.Schema<User>({
  username: String,
  discriminator: String,
  id: String,
  avatar: String,
  avatarUrl: String,
  banner: String,
  bannerUrl: String,
  bio: String,
  locale: String,
  mfaEnabled: Boolean,
  premiumType: Number,
  flags: Number,
  email: String,
  verified: Number,
  createdAt: Date,
  type: Number,
  token: String,
  password: String,
  receiveEmails: Boolean,
});

export const userModel = mongoose.model<User>("User", userSchema);