import { readFile } from "node:fs/promises";
import { google, type sheets_v4 } from "googleapis";
import type { ServerConfig } from "../config.js";

const SHEETS_SCOPE = ["https://www.googleapis.com/auth/spreadsheets"];

type Credentials = {
  client_email: string;
  private_key: string;
};

function normalizePrivateKey(value: string): string {
  return value.includes("\\n") ? value.replace(/\\n/g, "\n") : value;
}

function parseCredentials(raw: string): Credentials {
  const parsed = JSON.parse(raw) as Partial<Credentials>;
  const clientEmail = parsed.client_email?.trim() ?? "";
  const privateKey = normalizePrivateKey(parsed.private_key ?? "");

  if (!clientEmail) {
    throw new Error("Google credentials are missing client_email.");
  }

  if (!privateKey) {
    throw new Error("Google credentials are missing private_key.");
  }

  return {
    client_email: clientEmail,
    private_key: privateKey,
  };
}

async function readCredentials(config: ServerConfig): Promise<Credentials> {
  if (config.googleCredentialsJson) {
    return parseCredentials(config.googleCredentialsJson);
  }

  if (config.googleCredentialsFile) {
    const raw = await readFile(config.googleCredentialsFile, "utf8");
    return parseCredentials(raw);
  }

  throw new Error("Google credentials are not configured.");
}

export async function createGoogleSheetsClient(
  config: ServerConfig,
): Promise<sheets_v4.Sheets> {
  const credentials = await readCredentials(config);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SHEETS_SCOPE,
  });

  return google.sheets({ version: "v4", auth });
}
