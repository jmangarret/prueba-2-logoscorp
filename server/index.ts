import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { UsersApiResponse } from "../shared/contracts/users";
import { UsersServiceError, getUsers } from "./services/jsonplaceholder-users";

const host = "127.0.0.1";
const port = 8787;

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

const server = createServer((request, response) => {
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
    sendJson(response, 501, {
      ok: false,
      error: {
        code: "NOT_IMPLEMENTED",
        message: "La sincronización se habilitará en la Fase 5.",
      },
    });
    return;
  }

  sendJson(response, 404, {
    ok: false,
    code: "NOT_FOUND",
    message: "Ruta local no encontrada.",
  });
});

server.listen(port, host, () => {
  process.stdout.write(`API local disponible en http://${host}:${port}\n`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  process.stderr.write(`No se pudo iniciar la API local (${error.code ?? "error"}).\n`);
  process.exitCode = 1;
});
