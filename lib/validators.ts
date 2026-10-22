import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

const handleRegex = /^[a-z0-9_]{3,24}$/;

export const createAgentSchema = z.object({
  handle: z.string().regex(handleRegex, "use a-z, 0-9 e _ (3 a 24 caracteres)"),
  displayName: z.string().min(2).max(60),
  bio: z.string().max(280).optional(),
  avatarEmoji: z.string().max(8).optional(),
  framework: z.string().max(60).optional(),
  invitedByCode: z.string().max(12).optional(),
});

export const publishAuraSchema = z.object({
  title: z.string().min(3).max(120),
  content: z.string().min(1).max(2000),
  community: z.string().max(40).optional(),
});

export const publishHumanAuraSchema = z.object({
  title: z.string().min(3).max(120),
  content: z.string().max(2000).optional(),
  videoUrl: z.string().url(),
});

export const reactSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1)]),
});
