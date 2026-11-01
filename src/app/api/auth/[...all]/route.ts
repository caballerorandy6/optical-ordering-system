import { auth } from "@/lib/auth";
import { isAuthRequestAllowedInDemo, isDemoReadOnly } from "@/lib/demo";
import { toNextJsHandler } from "better-auth/next-js";

const handlers = toNextJsHandler(auth);

// Better Auth also exposes user admin and password endpoints, and they do not
// go through the Server Actions, so the read-only demo closes them here.
function guarded(handler: (request: Request) => Promise<Response>) {
  return async (request: Request) => {
    const { pathname } = new URL(request.url);
    if (isDemoReadOnly() && !isAuthRequestAllowedInDemo(request.method, pathname)) {
      return Response.json({ message: "This demo is read-only" }, { status: 403 });
    }
    return handler(request);
  };
}

export const GET = guarded(handlers.GET);
export const POST = guarded(handlers.POST);
