import dotenv from "dotenv";
import path from "path";
import { z } from "zod"; // schema validation

// Determine which environment file to load (default: local)
const envType = process.env.TEST_ENV || "local";
const envFile = path.resolve(process.cwd(), `.env.${envType}`);

console.log(`🌍 Loading environment from: ${envFile}`);
dotenv.config({ path: envFile, override: true });

// --- Define the schema of required environment variables
const EnvSchema = z.object({
  USERNAME: z.string().email("USERNAME must be a valid email"),
  PASSWORD: z.string().min(8, "PASSWORD must be at least 8 characters"),
  WRONG_PASSWORD: z.string(),
  BASE_URL: z
    .string()
    .url("BASE_URL must be a valid URL")
    .default("https://lbltc-2.azurewebsites.net"),
});

// --- Parse and validate
const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  console.error(parsed.error.format());
  process.exit(1); // Stop immediately
}

// --- Export strongly typed env values
export const env = parsed.data;
