import { createHash, randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";

const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error("Add GOOGLE_DRIVE_CLIENT_ID and GOOGLE_DRIVE_CLIENT_SECRET to .env.local first.");
  process.exit(1);
}

const port = 8787;
const redirectUri = `http://127.0.0.1:${port}/oauth2callback`;
const state = randomBytes(24).toString("base64url");
const verifier = randomBytes(48).toString("base64url");
const challenge = createHash("sha256").update(verifier).digest("base64url");
const authorize = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authorize.search = new URLSearchParams({
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: "code",
  scope: "https://www.googleapis.com/auth/drive.file",
  access_type: "offline",
  prompt: "consent",
  state,
  code_challenge: challenge,
  code_challenge_method: "S256",
}).toString();

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", redirectUri);
  if (url.pathname !== "/oauth2callback") { response.writeHead(404).end("Not found"); return; }
  if (url.searchParams.get("state") !== state) { response.writeHead(400).end("Invalid state"); return; }
  const code = url.searchParams.get("code");
  if (!code) {
    response.writeHead(400).end("Google authorization was not completed.");
    server.close();
    return;
  }
  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId, client_secret: clientSecret, code,
        redirect_uri: redirectUri, grant_type: "authorization_code", code_verifier: verifier,
      }),
    });
    const token = await tokenResponse.json();
    if (!tokenResponse.ok || !token.refresh_token) throw new Error("No refresh token returned. Check OAuth consent settings and try again.");
    const envPath = `${process.cwd()}/.env.local`;
    const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
    const tokenLine = `GOOGLE_DRIVE_REFRESH_TOKEN=${token.refresh_token}`;
    const existingIndex = lines.findIndex((line) => /^GOOGLE_DRIVE_REFRESH_TOKEN=/.test(line));
    if (existingIndex >= 0) lines[existingIndex] = tokenLine;
    else lines.push(tokenLine);
    writeFileSync(envPath, `${lines.join("\n").trimEnd()}\n`, { mode: 0o600 });
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end("<h1>Google Drive connected</h1><p>The refresh token was saved to .env.local. You can close this tab.</p>");
    console.log("Google Drive refresh token saved to .env.local. Restart the app before testing.");
  } catch (error) {
    response.writeHead(500).end("Could not complete Google Drive authorization. Check the terminal.");
    console.error(error instanceof Error ? error.message : "OAuth failed");
  } finally {
    server.close();
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log("Opening Google authorization in your browser. Complete the consent screen there.");
  const browser = spawn("xdg-open", [authorize.toString()], { stdio: "ignore", detached: true });
  browser.on("error", () => console.error("Could not open a browser automatically. Run this script from a desktop terminal."));
  browser.unref();
});
