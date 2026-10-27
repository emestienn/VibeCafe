import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name is too short").max(60),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const reviewSchema = z.object({
  cafeId: z.string(),
  rating: z.number().int().min(1).max(5),
  body: z.string().min(10, "Tell us a bit more (10+ characters)").max(2000),
  tags: z.array(z.string()).max(6),
  coffeeRating: z.number().int().min(1).max(5).optional(),
  wifiRating: z.number().int().min(1).max(5).optional(),
  quietnessRating: z.number().int().min(1).max(5).optional(),
  workRating: z.number().int().min(1).max(5).optional(),
  aestheticRating: z.number().int().min(1).max(5).optional(),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

export const profileSchema = z.object({
  profession: z.string().max(80).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(80).optional(),
  skills: z.array(z.string()).max(12).default([]),
  interests: z.array(z.string()).max(12).default([]),
  goals: z.string().max(300).optional(),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const networkingStatusSchema = z.object({
  isOpenToNetworking: z.boolean(),
  isVisibleForNetworking: z.boolean(),
  networkingMessage: z.string().max(200).optional(),
  currentCafeId: z.string().nullable().optional(),
});

export const workSessionSchema = z.object({
  cafeId: z.string(),
  title: z.string().min(4).max(100),
  category: z.string(),
  topics: z.array(z.string()).max(6).default([]),
  untilTime: z.string().datetime().optional(),
});

export const connectionRequestSchema = z.object({
  recipientId: z.string(),
  message: z.string().max(300).optional(),
});

export const eventJoinSchema = z.object({
  eventId: z.string(),
});

export const postSchema = z.object({
  type: z.enum(["CAFE_POST", "VIBE_POST"]).default("CAFE_POST"),
  cafeId: z.string().min(1, "Choose a café"),
  caption: z.string().min(1, "Write a few words about this moment").max(1000),
  images: z.array(z.string()).max(10).default([]),
  vibeTags: z.array(z.string()).max(6).default([]),
  coffeeRating: z.number().int().min(1).max(5).optional(),
  atmosphereRating: z.number().int().min(1).max(5).optional(),
  workRating: z.number().int().min(1).max(5).optional(),
  wifiRating: z.number().int().min(1).max(5).optional(),
  mood: z.string().optional(),
  energy: z.number().int().min(1).max(10).optional(),
  workingHours: z.number().min(0).max(24).optional(),
  music: z.string().optional(),
  drink: z.string().optional(),
});
export type PostInput = z.infer<typeof postSchema>;

export const commentSchema = z.object({
  postId: z.string(),
  body: z.string().min(1).max(500),
  parentId: z.string().optional(),
});
