import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isAuthRequestAllowedInDemo, isDemoReadOnly } from "./demo";

describe("isDemoReadOnly", () => {
  const env = (vars: Record<string, string>) => vars as unknown as NodeJS.ProcessEnv;

  it("is on by default on Vercel", () => {
    expect(isDemoReadOnly(env({ VERCEL: "1" }))).toBe(true);
  });
  it("is off by default elsewhere", () => {
    expect(isDemoReadOnly(env({}))).toBe(false);
  });
  it("follows an explicit DEMO_READ_ONLY", () => {
    expect(isDemoReadOnly(env({ VERCEL: "1", DEMO_READ_ONLY: "0" }))).toBe(false);
    expect(isDemoReadOnly(env({ DEMO_READ_ONLY: "1" }))).toBe(true);
  });
});

describe("isAuthRequestAllowedInDemo", () => {
  it("allows signing in, signing out and reading the session", () => {
    expect(isAuthRequestAllowedInDemo("POST", "/api/auth/sign-in/email")).toBe(true);
    expect(isAuthRequestAllowedInDemo("POST", "/api/auth/sign-out")).toBe(true);
    expect(isAuthRequestAllowedInDemo("GET", "/api/auth/get-session")).toBe(true);
  });
  it.each([
    "/api/auth/admin/create-user",
    "/api/auth/admin/ban-user",
    "/api/auth/admin/set-user-password",
    "/api/auth/admin/set-role",
    "/api/auth/admin/remove-user",
    "/api/auth/admin/impersonate-user",
    "/api/auth/change-password",
    "/api/auth/change-email",
    "/api/auth/update-user",
    "/api/auth/delete-user",
    "/api/auth/sign-up/email",
    "/api/auth/sign-in/email/",
  ])("refuses POST %s", (pathname) => {
    expect(isAuthRequestAllowedInDemo("POST", pathname)).toBe(false);
  });
  it("refuses other reads, such as listing users", () => {
    expect(isAuthRequestAllowedInDemo("GET", "/api/auth/admin/list-users")).toBe(false);
  });
});

describe("Server Actions that write", () => {
  const dir = path.resolve(__dirname, "../actions");
  // Only sets the visitor's language cookie
  const exempt = new Set(["locale.ts"]);
  const files = readdirSync(dir).filter((f) => f.endsWith(".ts") && !exempt.has(f));

  it("cover the expected files", () => {
    expect(files.sort()).toEqual(["customers.ts", "orders.ts", "payments.ts", "users.ts"]);
  });

  it.each(files)("%s: every exported action starts with the read-only check", (file) => {
    const source = readFileSync(path.join(dir, file), "utf8");
    const actions = [...source.matchAll(/export async function (\w+)[^{]*\{\n([^\n]*)\n([^\n]*)/g)];
    expect(actions.length).toBeGreaterThan(0);
    for (const [, name, first] of actions) {
      expect(first.trim(), name).toBe("const blocked = await demoWriteBlocked();");
    }
  });
});
