import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  STORAGE_PROVIDER: z.enum(["local", "s3", "supabase"]).default("local"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  EMAIL_PROVIDER: z.enum(["console", "smtp"]).default("console"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER ?? "local",
  NODE_ENV: process.env.NODE_ENV ?? "development",
  S3_BUCKET: process.env.S3_BUCKET,
  S3_REGION: process.env.S3_REGION,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
   EMAIL_PROVIDER: (process.env.EMAIL_PROVIDER as "console" | "smtp") ?? "console",
   SMTP_HOST: process.env.SMTP_HOST,
   SMTP_PORT: process.env.SMTP_PORT,
   SMTP_USER: process.env.SMTP_USER,
   SMTP_PASSWORD: process.env.SMTP_PASSWORD,
   SMTP_FROM: process.env.SMTP_FROM,
});

export function getEnv(key: keyof Env): Env[keyof Env] {
  return env[key];
}
