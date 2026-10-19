import { toContactRecord, type ContactRecord } from "../../shared/domain/contact";

const USERS_URL = "https://jsonplaceholder.typicode.com/users";
const REQUEST_TIMEOUT_MS = 10_000;

interface SourceUser {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  companyName: string;
}

interface JsonPlaceholderUser {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  company: { name: string };
}

export type UsersServiceErrorCode =
  | "UPSTREAM_UNAVAILABLE"
  | "UPSTREAM_INVALID_RESPONSE";

export class UsersServiceError extends Error {
  constructor(
    readonly code: UsersServiceErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "UsersServiceError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isJsonPlaceholderUser(value: unknown): value is JsonPlaceholderUser {
  if (!isRecord(value) || !isRecord(value.company)) return false;

  return (
    typeof value.id === "number" &&
    Number.isInteger(value.id) &&
    typeof value.username === "string" &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    typeof value.phone === "string" &&
    typeof value.website === "string" &&
    typeof value.company.name === "string"
  );
}

function parseSourceUsers(value: unknown): SourceUser[] {
  if (!Array.isArray(value) || !value.every(isJsonPlaceholderUser)) {
    throw new UsersServiceError(
      "UPSTREAM_INVALID_RESPONSE",
      "El servicio de usuarios devolvió datos con un formato inesperado.",
    );
  }

  return value.map((user) => ({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    phone: user.phone,
    website: user.website,
    companyName: user.company.name,
  }));
}

export async function getUsers(
  fetcher: typeof fetch = fetch,
): Promise<ContactRecord[]> {
  let response: Response;
  try {
    response = await fetcher(USERS_URL, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new UsersServiceError(
      "UPSTREAM_UNAVAILABLE",
      "No fue posible conectar con el servicio público de usuarios. Intenta de nuevo.",
    );
  }

  if (!response.ok) {
    throw new UsersServiceError(
      "UPSTREAM_UNAVAILABLE",
      "El servicio público de usuarios no está disponible. Intenta de nuevo.",
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new UsersServiceError(
      "UPSTREAM_INVALID_RESPONSE",
      "El servicio público de usuarios devolvió una respuesta ilegible.",
    );
  }

  return parseSourceUsers(payload).map(toContactRecord);
}
