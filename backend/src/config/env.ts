import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PREFIX: z.string().default("/api/v1"),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  INSTITUTION_DOMAIN: z.string().default("yenepoya.edu.in"),
  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 characters"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  COOKIE_SECRET: z.string().min(16, "COOKIE_SECRET must be at least 16 characters"),
  NVIDIA_NIM_API_KEY: z.string().optional().default(""),
  NVIDIA_NIM_BASE_URL: z.string().default("https://integrate.api.nvidia.com/v1"),
  NVIDIA_NIM_MODEL: z.string().default("nvidia/llama-3.1-nemotron-70b-instruct"),
  STORAGE_LOCAL_DIR: z.string().default("./uploads"),
  MAX_FILE_SIZE_MB: z.coerce.number().default(25),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
