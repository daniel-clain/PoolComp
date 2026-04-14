import { config as loadEnv } from "dotenv";
import path from "node:path";

loadEnv();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const serverConfig = {
  port: Number(process.env.PORT ?? "3000"),
  mongoUri: requireEnv("MONGODB_URI"),
  mongoDbName: process.env.MONGO_DB_NAME ?? "PoolComp",
  frontendDistPath: path.resolve(
    process.cwd(),
    process.env.FRONTEND_DIST_PATH ?? "../frontend/dist",
  ),
};
