import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import path from "node:path";

loadEnv();

type ServerConfig = {
  port: number;
  spreadsheetId: string;
  googleCredentialsFile?: string;
  googleCredentialsJson?: string;
  frontendDistPath: string;
};

function readPort(value: string | undefined): number {
  const parsed = Number(value ?? "3000");
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("PORT must be a positive integer.");
  }

  return parsed;
}

export function readConfig(): ServerConfig {
  const frontendDistPath = path.resolve(
    process.cwd(),
    process.env.FRONTEND_DIST_PATH ?? "../frontend/dist",
  );

  if (!existsSync(frontendDistPath)) {
    console.warn(`Frontend dist path not found yet: ${frontendDistPath}`);
  }

  return {
    port: readPort(process.env.PORT),
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID ?? "",
    googleCredentialsFile: process.env.GOOGLE_SERVICE_ACCOUNT_FILE,
    googleCredentialsJson: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    frontendDistPath,
  };
}

export function validateConfig(config: ServerConfig): void {
  if (config.spreadsheetId && !config.googleCredentialsFile && !config.googleCredentialsJson) {
    console.warn(
      "GOOGLE_SPREADSHEET_ID is set but credentials are missing. Falling back to in-memory persistence.",
    );
  }

  if (!config.spreadsheetId && (config.googleCredentialsFile || config.googleCredentialsJson)) {
    console.warn(
      "Google credentials are set but GOOGLE_SPREADSHEET_ID is missing. Falling back to in-memory persistence.",
    );
  }
}

export function isGoogleSheetsConfigured(config: ServerConfig): boolean {
  return Boolean(
    config.spreadsheetId && (config.googleCredentialsFile || config.googleCredentialsJson),
  );
}

export type { ServerConfig };
