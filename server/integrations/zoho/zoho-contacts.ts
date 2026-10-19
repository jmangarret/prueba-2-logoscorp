import type { SyncContactRequest } from "../../../shared/contracts/sync-contact";
import { normalizePhone, normalizeWebsite } from "../../../shared/domain/contact";
import type { ZohoRuntimeConfig } from "../../config/env";

const REQUEST_TIMEOUT_MS = 15_000;

interface ZohoContactRecord {
  Last_Name: string;
  Email?: string;
  Phone?: string;
  Website?: string;
}

interface ZohoCreateContactResult {
  ok: true;
  zohoContactId: string;
}

export type ZohoCreateContactErrorCode =
  | "AUTH_CONFIGURATION_ERROR"
  | "ZOHO_REJECTED"
  | "ZOHO_UNAVAILABLE";

export interface ZohoCreateContactError {
  ok: false;
  code: ZohoCreateContactErrorCode;
  message: string;
}

export type ZohoCreateContactResponse =
  | ZohoCreateContactResult
  | ZohoCreateContactError;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toZohoContact(request: SyncContactRequest): ZohoContactRecord {
  const contact: ZohoContactRecord = { Last_Name: request.name.trim() };
  const email = request.email.trim();
  const phone = normalizePhone(request.phone);
  const website = normalizeWebsite(request.website);

  if (email) contact.Email = email;
  if (phone) contact.Phone = phone;
  if (website) contact.Website = website;
  return contact;
}

function getCreatedContactId(payload: unknown): string | null {
  if (!isRecord(payload) || !Array.isArray(payload.data) || payload.data.length !== 1) {
    return null;
  }

  const [result] = payload.data;
  if (
    !isRecord(result) ||
    result.code !== "SUCCESS" ||
    result.status !== "success" ||
    !isRecord(result.details) ||
    typeof result.details.id !== "string" ||
    result.details.id.length === 0
  ) {
    return null;
  }

  return result.details.id;
}

function failure(
  code: ZohoCreateContactErrorCode,
  message: string,
): ZohoCreateContactError {
  return { ok: false, code, message };
}

export async function createZohoContact(
  request: SyncContactRequest,
  config: ZohoRuntimeConfig,
  fetcher: typeof fetch = fetch,
): Promise<ZohoCreateContactResponse> {
  const baseUrl = config.apiBaseUrl.toString().replace(/\/+$/, "");
  const endpoint = new URL(`${baseUrl}/Contacts`);
  let response: Response;

  try {
    response = await fetcher(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Zoho-oauthtoken ${config.accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ data: [toZohoContact(request)] }),
      redirect: "error",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    return failure(
      "ZOHO_UNAVAILABLE",
      "No fue posible conectar con Zoho CRM. Intenta de nuevo.",
    );
  }

  if (response.status === 401 || response.status === 403) {
    return failure(
      "AUTH_CONFIGURATION_ERROR",
      "Zoho CRM rechazó la autenticación o los permisos del token.",
    );
  }

  if (response.status === 429 || response.status >= 500) {
    return failure(
      "ZOHO_UNAVAILABLE",
      "Zoho CRM no está disponible temporalmente. Intenta de nuevo.",
    );
  }

  if (!response.ok) {
    return failure(
      "ZOHO_REJECTED",
      "Zoho CRM rechazó los datos del contacto. Revisa los campos e inténtalo de nuevo.",
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return failure(
      "ZOHO_UNAVAILABLE",
      "Zoho CRM devolvió una respuesta ilegible. Intenta de nuevo.",
    );
  }

  const zohoContactId = getCreatedContactId(payload);
  if (!zohoContactId) {
    return failure(
      "ZOHO_REJECTED",
      "Zoho CRM no confirmó la creación del contacto.",
    );
  }

  return { ok: true, zohoContactId };
}
