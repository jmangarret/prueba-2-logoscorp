import type {
  SyncContactRequest,
  SyncContactResponse,
} from "../../shared/contracts/sync-contact";
import type { ContactDraft } from "../../shared/domain/contact";

export class ContactSyncError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContactSyncError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSyncContactResponse(value: unknown): value is SyncContactResponse {
  if (!isRecord(value)) return false;
  if (value.ok === true) {
    return (
      isRecord(value.data) &&
      typeof value.data.sourceUserId === "number" &&
      typeof value.data.zohoContactId === "string"
    );
  }
  return (
    value.ok === false &&
    isRecord(value.error) &&
    (typeof value.error.sourceUserId === "number" || value.error.sourceUserId === null) &&
    (value.error.code === "SIMULATED_FAILURE" ||
      value.error.code === "VALIDATION_ERROR" ||
      value.error.code === "ZOHO_REJECTED" ||
      value.error.code === "ZOHO_UNAVAILABLE" ||
      value.error.code === "AUTH_CONFIGURATION_ERROR" ||
      value.error.code === "INTERNAL_ERROR") &&
    typeof value.error.code === "string" &&
    typeof value.error.message === "string"
  );
}

export async function syncContact(draft: ContactDraft): Promise<SyncContactResponse> {
  const requestBody: SyncContactRequest = {
    sourceUserId: draft.sourceUserId,
    username: draft.username,
    name: draft.name,
    email: draft.email,
    phone: draft.phone,
    companyName: draft.companyName,
    website: draft.website,
  };

  let response: Response;
  try {
    response = await fetch("/api/contacts/sync", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(requestBody),
    });
  } catch {
    throw new ContactSyncError("No fue posible conectar con la API local.");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ContactSyncError("La API local devolvió una respuesta ilegible.");
  }

  if (!isSyncContactResponse(payload)) {
    throw new ContactSyncError("La API local devolvió una respuesta con formato inesperado.");
  }

  if (!response.ok && payload.ok) {
    throw new ContactSyncError("La API local devolvió un estado de éxito inconsistente.");
  }
  return payload;
}
