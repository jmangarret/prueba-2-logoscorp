import type { IncomingMessage } from "node:http";

const MAX_BODY_BYTES = 16 * 1024;

export class JsonBodyError extends Error {
  constructor(
    readonly statusCode: 400 | 413 | 415,
    message: string,
  ) {
    super(message);
    this.name = "JsonBodyError";
  }
}

export async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const contentType = request.headers["content-type"]?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") {
    throw new JsonBodyError(415, "El cuerpo debe enviarse como application/json.");
  }

  const chunks: Buffer[] = [];
  let size = 0;
  let tooLarge = false;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.byteLength;
    if (size > MAX_BODY_BYTES) {
      tooLarge = true;
      continue;
    }
    chunks.push(buffer);
  }

  if (tooLarge) {
    throw new JsonBodyError(413, "El cuerpo de la solicitud excede el tamaño permitido.");
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    throw new JsonBodyError(400, "El cuerpo de la solicitud no contiene JSON válido.");
  }
}
