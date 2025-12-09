export function getCurrentUserId(): string {
  const id = process.env.NEXT_PUBLIC_DEV_USER_ID;

  if (!id) {
    throw new Error(
      "NEXT_PUBLIC_DEV_USER_ID is not set. Add it to .env.local to enable per-user watchlists."
    );
  }

  return id;
}
