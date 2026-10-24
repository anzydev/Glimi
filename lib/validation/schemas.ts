import { z } from "zod";
import {
  CONTACT_PREFERENCES,
  INTENTS,
  TASK_TYPES,
  TIME_COMMITMENTS,
} from "@/lib/types";
import { isGitHubRepoUrl } from "@/lib/utils/github";

const trimmedText = (max: number) => z.string().trim().max(max);

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null));

const httpUrl = z
  .string()
  .trim()
  .max(300)
  .nullable()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : null))
  .refine(
    (value) => value === null || /^https?:\/\/[^\s]+$/i.test(value),
    "Website must start with http:// or https://."
  );

export const discoverRequestSchema = z.object({
  query: trimmedText(600).min(3, "Describe what you need in at least 3 characters."),
  intentFilter: z.enum(INTENTS).optional(),
});

export const aiExtractionSchema = z.object({
  skills: z.array(trimmedText(40).min(1)).max(12),
  intent: z.enum(INTENTS).nullable().optional(),
  time_commitment: z.enum(TIME_COMMITMENTS).nullable().optional(),
  timezone_hint: trimmedText(60).nullable().optional(),
});

export const profileUpdateSchema = z
  .object({
    name: trimmedText(120).min(1).nullable().optional(),
    bio: nullableText(800),
    location: nullableText(120),
    company: nullableText(120),
    website: httpUrl,
    intents: z
      .array(z.enum(INTENTS))
      .max(4)
      .refine(
        (values) => new Set(values).size === values.length,
        "Intents must be unique."
      )
      .optional(),
    timeCommitment: z.enum(TIME_COMMITMENTS).optional(),
    timezones: z
      .array(trimmedText(60).min(1))
      .max(8)
      .optional(),
    contactPreference: z.enum(CONTACT_PREFERENCES).optional(),
    contactHandle: nullableText(200),
    isDiscoverable: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one profile field to update.",
  });

export const connectionCreateSchema = z.object({
  receiverId: z.string().uuid(),
  intent: z.enum(INTENTS),
  projectName: trimmedText(120).min(1, "Project name is required."),
  contextMessage: trimmedText(2000).min(
    20,
    "Add at least 20 characters of collaboration context."
  ),
});

export const connectionActionSchema = z.object({
  action: z.enum(["accept", "decline", "cancel"]),
});

export const messageCreateSchema = z.object({
  content: trimmedText(4000).min(1, "Message cannot be empty."),
});

export const rescueCreateSchema = z.object({
  repoUrl: trimmedText(300)
    .min(1, "Repository URL is required.")
    .refine(isGitHubRepoUrl, "Use a public GitHub repository URL."),
  issueOrTask: trimmedText(160).min(5, "Add a short summary."),
  description: trimmedText(4000).min(
    20,
    "Describe the blocker in at least 20 characters."
  ),
  taskType: z.enum(TASK_TYPES),
  techStack: z.array(trimmedText(40).min(1)).max(12).default([]),
});

export const rescueActionSchema = z.object({
  action: z.enum(["claim", "complete", "abandon"]),
});

export const accountDeleteSchema = z.object({
  confirmation: z.literal("DELETE"),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ConnectionCreateInput = z.infer<typeof connectionCreateSchema>;
export type RescueCreateInput = z.infer<typeof rescueCreateSchema>;
