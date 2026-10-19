import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { UsersApiResponse } from "../shared/contracts/users";
import type { SyncContactResponse } from "../shared/contracts/sync-contact";
import { syncContactUseCase } from "./application/sync-contact";
import { JsonBodyError, readJsonBody } from "./http/read-json-body";
import { UsersServiceError, getUsers } from "./services/jsonplaceholder-users";

const host = "127.0.0.1";
const port = 8787;
type SyncFailureCode = Extract<SyncContactResponse, { ok: false }>["error"]["code"];

function sendJson(
  response: ServerResponse<IncomingMessage>,
  statusCode: number,
  body: unknown,
): void {
  response.writeHead(statusCode, {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
    "x-content-type-options": "nosniff",
  });
  response.end(JSON.stringify(body));
}

function syncStatusCode(code: SyncFailureCode): number {
  switch (code) {
    case "VALIDATION_ERROR":
      return 400;
    case "SIMULATED_FAILURE":
    case "ZOHO_REJECTED":
      return 422;
    case "AUTH_CONFIGURATION_ERROR":
    case "ZOHO_UNAVAILABLE":
      return 503;
    case "INTERNAL_ERROR":
      return 500;
  }
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
): Promise<void> {
  const requestUrl = new URL(request.url ?? "/", `http://${host}:${port}`);

  if (request.method === "GET" && requestUrl.pathname === "/api/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/users") {
    void getUsers()
      .then((users) => {
        const body: UsersApiResponse = { ok: true, data: users };
        sendJson(response, 200, body);
      })
      .catch((error: unknown) => {
        const body: UsersApiResponse = {
          ok: false,
          error:
            error instanceof UsersServiceError
              ? { code: error.code, message: error.message }
              : {
                  code: "INTERNAL_ERROR",
                  message: "Ocurrió un error al cargar los usuarios.",
                },
        };
        sendJson(response, error instanceof UsersServiceError ? 502 : 500, body);
      });
    return;
  }

  if (
    request.method === "POST" &&
    requestUrl.pathname === "/api/contacts/sync"
  ) {
    let payload: unknown;
    try {
      payload = await readJsonBody(request);
    } catch (error: unknown) {
      const statusCode = error instanceof JsonBodyError ? error.statusCode : 400;
      const message = error instanceof JsonBodyError
        ? error.message
        : "No fue posible leer la solicitud.";
      const result: SyncContactResponse = {
        ok: false,
        error: { sourceUserId: null, code: "VALIDATION_ERROR", message },
      };
      sendJson(response, statusCode, result);
      return;
    }

    const result = await syncContactUseCase(payload);
    sendJson(response, result.ok ? 201 : syncStatusCode(result.error.code), result);
    return;
  }

  sendJson(response, 404, {
    ok: false,
    code: "NOT_FOUND",
    message: "Ruta local no encontrada.",
  });
}

const server = createServer((request, response) => {
  void handleRequest(request, response).catch(() => {
    sendJson(response, 500, {
      ok: false,
      error: {
        sourceUserId: null,
        code: "INTERNAL_ERROR",
        message: "Ocurrió un error al procesar la solicitud.",
      },
    });
  });
});

server.listen(port, host, () => {
  process.stdout.write(`API local disponible en http://${host}:${port}\n`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  process.stderr.write(`No se pudo iniciar la API local (${error.code ?? "error"}).\n`);
  process.exitCode = 1;
});
