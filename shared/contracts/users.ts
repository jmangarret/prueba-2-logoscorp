import type { ContactRecord } from "../domain/contact";

export type UsersApiErrorCode =
  | "UPSTREAM_UNAVAILABLE"
  | "UPSTREAM_INVALID_RESPONSE"
  | "INTERNAL_ERROR";

export type UsersApiResponse =
  | { ok: true; data: ContactRecord[] }
  | {
      ok: false;
      error: { code: UsersApiErrorCode; message: string };
    };
