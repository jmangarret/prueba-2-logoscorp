import { useEffect, useState } from "react";

type ApiHealth = { status: "ok" };
type HealthState = "loading" | "available" | "unavailable";

function isApiHealth(value: unknown): value is ApiHealth {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    value.status === "ok"
  );
}

export default function App() {
  const [health, setHealth] = useState<HealthState>("loading");

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/health", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("El servidor local no respondió correctamente.");
        }

        const payload: unknown = await response.json();
        if (!isApiHealth(payload)) {
          throw new Error("La respuesta del servidor no es válida.");
        }

        setHealth("available");
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setHealth("unavailable");
        }
      });

    return () => controller.abort();
  }, []);

  const statusLabel = {
    loading: "Comprobando servidor local…",
    available: "Servidor local disponible",
    unavailable: "Servidor local no disponible",
  }[health];

  return (
    <main className="shell">
      <section className="panel" aria-labelledby="page-title">
        <p className="eyebrow">Prueba técnica · LogosCorp</p>
        <h1 id="page-title">Sincronización con Zoho CRM</h1>
        <p className="intro">
          La estructura local está preparada. La carga y sincronización de
          contactos se incorporarán en las siguientes fases aprobadas.
        </p>
        <p
          className={`status status--${health}`}
          role="status"
          aria-live="polite"
        >
          <span className="status__dot" aria-hidden="true" />
          {statusLabel}
        </p>
      </section>
    </main>
  );
}
