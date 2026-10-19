export interface SyncContactRequest {
  sourceUserId: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  website: string;
}

export type SyncContactResponse =
  | { ok: true; data: { sourceUserId: number; zohoContactId: string } }
  | { ok: false; error: { code: string; message: string } };
