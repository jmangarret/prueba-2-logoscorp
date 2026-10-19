import type { SyncContactErrorCode } from "../../shared/contracts/sync-contact";
import { toContactDraft, type ContactRecord } from "../../shared/domain/contact";
import { ContactSyncError, syncContact } from "./contacts-api";

export type ContactSyncBatchResult =
  | {
      sourceUserId: number;
      name: string;
      status: "success";
      zohoContactId: string;
    }
  | {
      sourceUserId: number;
      name: string;
      status: "failure";
      code: SyncContactErrorCode;
      message: string;
    };

export type ContactSyncBatchProgress = (result: ContactSyncBatchResult) => void;

function toFailure(
  contact: ContactRecord,
  code: SyncContactErrorCode,
  message: string,
): ContactSyncBatchResult {
  return {
    sourceUserId: contact.sourceUserId,
    name: contact.name,
    status: "failure",
    code,
    message,
  };
}

/** Reuses the individual sync service and isolates each result in a sequential batch. */
export async function syncSelectedContacts(
  contacts: readonly ContactRecord[],
  onProgress?: ContactSyncBatchProgress,
): Promise<ContactSyncBatchResult[]> {
  const results: ContactSyncBatchResult[] = [];

  for (const contact of contacts) {
    if (contact.eligibility !== "valid") continue;

    let result: ContactSyncBatchResult;
    try {
      const response = await syncContact(toContactDraft(contact));
      result = response.ok
        ? {
            sourceUserId: contact.sourceUserId,
            name: contact.name,
            status: "success",
            zohoContactId: response.data.zohoContactId,
          }
        : toFailure(contact, response.error.code, response.error.message);
    } catch (error: unknown) {
      result = toFailure(
        contact,
        "INTERNAL_ERROR",
        error instanceof ContactSyncError
          ? error.message
          : "No fue posible procesar este contacto; el lote continuará.",
      );
    }

    results.push(result);
    onProgress?.(result);
  }

  return results;
}
