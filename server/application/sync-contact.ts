import type {
  SyncContactErrorCode,
  SyncContactRequest,
  SyncContactResponse,
} from "../../shared/contracts/sync-contact";
import {
  classifyCompany,
  normalizePhone,
  normalizeWebsite,
} from "../../shared/domain/contact";
import { readZohoRuntimeConfig } from "../config/env";
import { createZohoContact } from "../integrations/zoho/zoho-contacts";

type ValidatedContact = SyncContactRequest;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isContactRequest(value: unknown): value is SyncContactRequest {
  return (
    isRecord(value) &&
    typeof value.sourceUserId === "number" &&
    Number.isSafeInteger(value.sourceUserId) &&
    value.sourceUserId > 0 &&
    typeof value.username === "string" &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    typeof value.phone === "string" &&
    typeof value.companyName === "string" &&
    typeof value.website === "string"
  );
}

function makeFailure(
  sourceUserId: number | null,
  code: SyncContactErrorCode,
  message: string,
): SyncContactResponse {
  return { ok: false, error: { sourceUserId, code, message } };
}

function validateContact(request: SyncContactRequest):
  | { ok: true; value: ValidatedContact }
  | { ok: false; message: string } {
  const name = request.name.trim();
  const email = request.email.trim();
  const companyName = request.companyName.trim();
  const phone = normalizePhone(request.phone);
  const website = normalizeWebsite(request.website);

  if (!name || name.length > 255) {
    return { ok: false, message: "Name es obligatorio y debe tener 255 caracteres o menos." };
  }
  if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255)) {
    return { ok: false, message: "Email no tiene un formato válido." };
  }
  if (phone.length > 30) {
    return { ok: false, message: "Phone supera el máximo admitido por el campo de Zoho." };
  }
  if (request.website.trim() && !website) {
    return { ok: false, message: "Website debe ser una URL HTTP o HTTPS válida." };
  }
  if (typeof request.username !== "string" || !request.username.trim()) {
    return { ok: false, message: "Username es obligatorio para identificar el registro." };
  }

  return {
    ok: true,
    value: {
      ...request,
      username: request.username.trim(),
      name,
      email,
      phone,
      website,
      companyName,
    },
  };
}

export async function syncContactUseCase(input: unknown): Promise<SyncContactResponse> {
  const sourceUserId = isRecord(input) &&
    typeof input.sourceUserId === "number" &&
    Number.isSafeInteger(input.sourceUserId) &&
    input.sourceUserId > 0
    ? input.sourceUserId
    : null;

  if (!isContactRequest(input)) {
    return makeFailure(
      sourceUserId,
      "VALIDATION_ERROR",
      "La solicitud del contacto no tiene el formato esperado.",
    );
  }

  const validated = validateContact(input);
  if (!validated.ok) {
    return makeFailure(input.sourceUserId, "VALIDATION_ERROR", validated.message);
  }

  if (validated.value.username.toLowerCase().startsWith("c")) {
    return makeFailure(
      validated.value.sourceUserId,
      "SIMULATED_FAILURE",
      "Fallo simulado: username comienza por C; no se envió a Zoho CRM.",
    );
  }

  if (classifyCompany(validated.value.companyName) !== "valid") {
    return makeFailure(
      validated.value.sourceUserId,
      "VALIDATION_ERROR",
      "La empresa no cumple la regla de elegibilidad; no se envió a Zoho CRM.",
    );
  }

  let config;
  try {
    config = readZohoRuntimeConfig();
  } catch {
    return makeFailure(
      validated.value.sourceUserId,
      "AUTH_CONFIGURATION_ERROR",
      "La configuración Zoho del servidor está incompleta o es inválida.",
    );
  }

  const result = await createZohoContact(validated.value, config);
  if (!result.ok) {
    return makeFailure(
      validated.value.sourceUserId,
      result.code,
      result.message,
    );
  }

  return {
    ok: true,
    data: {
      sourceUserId: validated.value.sourceUserId,
      zohoContactId: result.zohoContactId,
    },
  };
}
