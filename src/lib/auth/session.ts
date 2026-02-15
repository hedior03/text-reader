import { getRequest } from "@tanstack/react-start/server";
import { auth } from "./auth";

/**
 * Get the current user session from the request headers.
 * Throws an error if the user is not authenticated.
 * Use this in server functions that require authentication.
 */
export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: getRequest().headers,
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session.user;
}
