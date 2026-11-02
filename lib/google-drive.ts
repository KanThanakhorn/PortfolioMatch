const DRIVE_API = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3/files";

type AccessToken = { value: string; expiresAt: number };
let cachedToken: AccessToken | null = null;

export function googleDriveConfigured() {
  return Boolean(
    process.env.GOOGLE_DRIVE_CLIENT_ID &&
    process.env.GOOGLE_DRIVE_CLIENT_SECRET &&
    process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
  );
}

async function accessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) throw new Error("Google Drive is not configured");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId, client_secret: clientSecret,
      refresh_token: refreshToken, grant_type: "refresh_token",
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Google OAuth token request failed (${response.status})`);
  const result = await response.json() as { access_token?: string; expires_in?: number };
  if (!result.access_token) throw new Error("Google OAuth did not return an access token");
  cachedToken = { value: result.access_token, expiresAt: Date.now() + (result.expires_in ?? 3600) * 1000 };
  return result.access_token;
}

export async function uploadPortfolioToDrive(file: File, applicationId: string) {
  const token = await accessToken();
  const metadata = {
    name: `PortfolioMatch-${applicationId}.pdf`,
    mimeType: "application/pdf",
    appProperties: { portfolioMatchApplicationId: applicationId },
  };
  const start = await fetch(`${DRIVE_UPLOAD_API}?uploadType=resumable&fields=id`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": "application/pdf",
      "X-Upload-Content-Length": String(file.size),
    },
    body: JSON.stringify(metadata),
    signal: AbortSignal.timeout(30_000),
  });
  if (!start.ok) throw new Error(`Google Drive upload could not start (${start.status})`);
  const location = start.headers.get("location");
  if (!location) throw new Error("Google Drive did not return an upload URL");
  const sessionUrl = new URL(location);
  if (sessionUrl.protocol !== "https:" || sessionUrl.hostname !== "www.googleapis.com") {
    throw new Error("Google Drive returned an unexpected upload URL");
  }

  const upload = await fetch(sessionUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/pdf", "Content-Length": String(file.size) },
    body: await file.arrayBuffer(),
    signal: AbortSignal.timeout(180_000),
  });
  if (!upload.ok) throw new Error(`Google Drive upload failed (${upload.status})`);
  const result = await upload.json() as { id?: string };
  if (!result.id || !/^[A-Za-z0-9_-]+$/.test(result.id)) throw new Error("Google Drive did not return a file ID");
  return result.id;
}

export async function deleteDriveFile(fileId: string) {
  const token = await accessToken();
  const response = await fetch(`${DRIVE_API}/${encodeURIComponent(fileId)}`, {
    method: "DELETE", headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok && response.status !== 404) throw new Error(`Google Drive cleanup failed (${response.status})`);
}

export async function downloadDriveFile(fileId: string) {
  const token = await accessToken();
  return fetch(`${DRIVE_API}/${encodeURIComponent(fileId)}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(180_000),
  });
}
