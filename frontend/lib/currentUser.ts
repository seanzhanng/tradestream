// lib/currentUser.ts

/**
 * Temporary dev-only current user.
 * Later you can swap this to read from a real auth token.
 *
 * Make sure you have this in your frontend .env.local:
 * NEXT_PUBLIC_DEV_USER_ID=42224e9c-3672-4773-8220-9f85572a92c0
 */
export function getCurrentUserId(): string {
  const id = process.env.NEXT_PUBLIC_DEV_USER_ID;

  if (!id) {
    throw new Error(
      "NEXT_PUBLIC_DEV_USER_ID is not set. Add it to .env.local to enable per-user watchlists."
    );
  }

  return id;
}
