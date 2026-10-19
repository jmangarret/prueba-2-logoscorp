export interface SyncContactRequest {
  sourceUserId: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  website: string;
}

export type SyncContactErrorCode =
  | "SIMULATED_FAILURE"
  | "VALIDATION_ERROR"
  | "ZOHO_REJECTED"
  | "ZOHO_UNAVAILABLE"
  | "AUTH_CONFIGURATION_ERROR"
  | "INTERNAL_ERROR";

export type SyncContactResponse =
  | { ok: true; data: { sourceUserId: number; zohoContactId: string } }
  | {
      ok: false;
      error: {
        sourceUserId: number | null;
        code: SyncContactErrorCode;
        message: string;
      };
    };
