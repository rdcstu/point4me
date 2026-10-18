// Server-only PointsYeah client for PERSONAL use with the owner's own membership.
// Approach adapted from pulsemcp/mcp-servers "pointsyeah" (MIT License, © 2025 PulseMCP):
//   1. Swap your PointsYeah refresh token for short-lived tokens (AWS Cognito).
//   2. Open PointsYeah's own search page in a hidden Chrome signed in as you, and
//      capture the search task it creates (their site encrypts the request).
//   3. Poll PointsYeah for that task's results.
// This depends on PointsYeah's website and may stop working if they change it.
import { buildPointsYeahUrl, type LiveSearchParams } from "@/lib/pointsyeah-url";

const COGNITO_CLIENT_ID = "3im8jrentts1pguuouv5s57gfu";
const COGNITO_ENDPOINT = "https://cognito-idp.us-east-1.amazonaws.com/";
const API2_BASE = "https://api2.pointsyeah.com";

export type FlightSegment = { duration: number; flight_number: string; dt: string; da: string; at: string; aa: string; cabin: string };
export type TransferOption = { bank: string; actual_points: number; points: number };
export type FlightPayment = { currency: string; tax: number; miles: number; cabin: string; unit: string; seats: number; cash_price: number };
export type FlightRoute = { payment: FlightPayment | null; segments: FlightSegment[] | null; transfer: TransferOption[] | null };
export type FlightResult = { program: string; code: string; date: string; departure: string; arrival: string; routes: FlightRoute[] | null };

type Tokens = { accessToken: string; idToken: string; expiresAt: number };
let cached: Tokens | null = null;

function refreshToken() {
  const t = process.env.POINTSYEAH_REFRESH_TOKEN?.trim();
  if (!t) throw new PointsYeahError("POINTSYEAH_REFRESH_TOKEN is not set in .env.local", "setup");
  return t;
}

export class PointsYeahError extends Error {
  constructor(message: string, public kind: "setup" | "auth" | "browser" | "upstream") {
    super(message);
  }
}

function jwtPayload(token: string): Record<string, unknown> {
  return JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8"));
}

async function getTokens(force = false): Promise<Tokens> {
  if (!force && cached && cached.expiresAt - Date.now() / 1000 > 300) return cached;
  const res = await fetch(COGNITO_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
    },
    body: JSON.stringify({
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: COGNITO_CLIENT_ID,
      AuthParameters: { REFRESH_TOKEN: refreshToken() },
    }),
    signal: AbortSignal.timeout(30_000),
  });
  const body = await res.text();
  if (!res.ok) {
    throw new PointsYeahError(
      body.includes("NotAuthorizedException")
        ? "Your PointsYeah login token has expired. Log in to PointsYeah again and update POINTSYEAH_REFRESH_TOKEN."
        : `PointsYeah sign-in failed (${res.status})`,
      "auth"
    );
  }
  const r = JSON.parse(body).AuthenticationResult as { AccessToken: string; IdToken: string; ExpiresIn: number };
  const exp = (jwtPayload(r.AccessToken).exp as number) || Math.floor(Date.now() / 1000) + r.ExpiresIn;
  cached = { accessToken: r.AccessToken, idToken: r.IdToken, expiresAt: exp };
  return cached;
}

/** Starts a search on PointsYeah and returns its task id. Takes ~10–40s. */
export async function createSearchTask(params: LiveSearchParams): Promise<string> {
  const tokens = await getTokens();
  const userId = jwtPayload(tokens.idToken).sub as string;
  const prefix = `CognitoIdentityServiceProvider.${COGNITO_CLIENT_ID}.${userId}`;
  const cookie = (name: string, value: string) => ({ name, value, domain: ".pointsyeah.com", path: "/" });
  const cookies = [
    cookie(`${prefix}.accessToken`, tokens.accessToken),
    cookie(`${prefix}.idToken`, tokens.idToken),
    cookie(`${prefix}.refreshToken`, refreshToken()),
    cookie(`${prefix}.clockDrift`, "0"),
    cookie(`${prefix}.signInDetails`, JSON.stringify({ loginId: "", authFlowType: "USER_SRP_AUTH" })),
    cookie(`CognitoIdentityServiceProvider.${COGNITO_CLIENT_ID}.LastAuthUser`, userId),
  ];

  // Loaded at runtime so the rest of the site works even if Playwright isn't installed
  // Minimal Playwright types, so the project still type-checks without it installed
  type Resp = { url(): string; json(): Promise<unknown> };
  type Page = {
    waitForResponse(pred: (r: Resp) => boolean, o: { timeout: number }): Promise<Resp>;
    goto(url: string, o: { waitUntil: string; timeout: number }): Promise<unknown>;
  };
  type Browser = {
    newContext(): Promise<{ addCookies(c: typeof cookies): Promise<void>; newPage(): Promise<Page> }>;
    close(): Promise<void>;
  };
  let chromium: { launch(o: { headless: boolean }): Promise<Browser> };
  try {
    const pkg = "playwright"; // variable name keeps the bundler from trying to bundle it
    ({ chromium } = await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ pkg));
  } catch {
    throw new PointsYeahError("Playwright isn't installed. Run: npm install playwright && npx playwright install chromium", "setup");
  }

  let browser: Browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (e) {
    throw new PointsYeahError(
      `Couldn't start the hidden browser. Run: npx playwright install chromium (${e instanceof Error ? e.message.split("\n")[0] : e})`,
      "setup"
    );
  }
  try {
    const context = await browser.newContext();
    await context.addCookies(cookies);
    const page = await context.newPage();
    const created = page.waitForResponse((r) => r.url().includes("api2.pointsyeah.com/flight/search/create_task"), { timeout: 60_000 });
    await page.goto(buildPointsYeahUrl(params), { waitUntil: "domcontentloaded", timeout: 60_000 });
    let data: { success: boolean; code: number; data?: { task_id: string } };
    try {
      data = (await (await created).json()) as typeof data;
    } catch {
      throw new PointsYeahError("PointsYeah's page didn't start a search. Their site may have changed.", "browser");
    }
    if (!data.success || !data.data?.task_id) throw new PointsYeahError(`PointsYeah refused the search (code ${data.code})`, "upstream");
    return data.data.task_id;
  } finally {
    await browser.close();
  }
}

/** One poll of a running search. status is "processing" until "done". */
export async function fetchResults(taskId: string): Promise<{ status: string; results: FlightResult[] }> {
  const call = async (idToken: string) =>
    fetch(`${API2_BASE}/flight/search/fetch_result`, {
      method: "POST",
      headers: {
        Authorization: idToken, // raw token, no "Bearer"
        "Content-Type": "application/json",
        Origin: "https://www.pointsyeah.com",
        Referer: "https://www.pointsyeah.com/",
      },
      body: JSON.stringify({ task_id: taskId }),
      signal: AbortSignal.timeout(30_000),
    });

  let res = await call((await getTokens()).idToken);
  if (res.status === 401) res = await call((await getTokens(true)).idToken);
  if (!res.ok) throw new PointsYeahError(`PointsYeah results failed (${res.status})`, "upstream");
  const json = (await res.json()) as { success: boolean; code: number; data: { status: string; result: FlightResult[] | null } | null };
  if (!json.success) throw new PointsYeahError(`PointsYeah results failed (code ${json.code})`, "upstream");
  return { status: json.data?.status ?? "processing", results: json.data?.result ?? [] };
}
