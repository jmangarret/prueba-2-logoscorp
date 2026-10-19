import type { UsersApiResponse } from "../../shared/contracts/users";
import type { ContactRecord } from "../../shared/domain/contact";

export class UsersApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UsersApiError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isContactRecord(value: unknown): value is ContactRecord {
  if (!isRecord(value)) return false;
  const record = value;
  return (
    typeof record.sourceUserId === "number" &&
    typeof record.username === "string" &&
    typeof record.name === "string" &&
    typeof record.email === "string" &&
    typeof record.phone === "string" &&
    typeof record.website === "string" &&
    typeof record.companyName === "string" &&
    typeof record.normalizedPhone === "string" &&
    typeof record.normalizedWebsite === "string" &&
    (record.eligibility === "valid" || record.eligibility === "invalid")
  );
}

function isUsersApiResponse(value: unknown): value is UsersApiResponse {
  if (!isRecord(value)) return false;
  const response = value;
  if (response.ok === true) {
    return Array.isArray(response.data) && response.data.every(isContactRecord);
  }

  if (response.ok !== false || !isRecord(response.error)) {
    return false;
  }

  const { code, message } = response.error;
  return (
    (code === "UPSTREAM_UNAVAILABLE" ||
      code === "UPSTREAM_INVALID_RESPONSE" ||
      code === "INTERNAL_ERROR") &&
    typeof message === "string"
  );
}

export async function fetchUsers(signal?: AbortSignal): Promise<ContactRecord[]> {
  let response: Response;
  try {
    response = await fetch("/api/users", signal ? { signal } : {});
  } catch {
    throw new UsersApiError("No fue posible conectar con la API local.");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new UsersApiError("La API local devolvió una respuesta ilegible.");
  }

  if (!isUsersApiResponse(payload)) {
    throw new UsersApiError("La API local devolvió una respuesta con formato inesperado.");
  }

  if (!response.ok || !payload.ok) {
    throw new UsersApiError(payload.ok ? "No fue posible cargar los usuarios." : payload.error.message);
  }

  return payload.data;
}
