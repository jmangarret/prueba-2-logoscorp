import { useCallback, useEffect, useState } from "react";
import {
  toContactRecord,
  type ContactDraft,
  type ContactRecord,
} from "../shared/domain/contact";
import { ContactEditForm } from "./components/ContactEditForm";
import { ContactTable } from "./components/ContactTable";
import { fetchUsers } from "./services/users-api";

type ApiHealth = { status: "ok" };
type HealthState = "loading" | "available" | "unavailable";
type UsersState =
  | { status: "loading" }
  | { status: "loaded"; users: ContactRecord[] }
  | { status: "error"; message: string };

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
  const [usersState, setUsersState] = useState<UsersState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [editingContact, setEditingContact] = useState<ContactRecord | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const loadUsers = useCallback(async (signal: AbortSignal) => {
    setUsersState({ status: "loading" });
    try {
      const users = await fetchUsers(signal);
      if (!signal.aborted) setUsersState({ status: "loaded", users });
    } catch (error: unknown) {
      if (!signal.aborted) {
        setUsersState({
          status: "error",
          message: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
        });
      }
    }
  }, []);

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

  useEffect(() => {
    const controller = new AbortController();
    void loadUsers(controller.signal);
    return () => controller.abort();
  }, [loadUsers, reloadKey]);

  const statusLabel = {
    loading: "Comprobando servidor local…",
    available: "Servidor local disponible",
    unavailable: "Servidor local no disponible",
  }[health];
  const users = usersState.status === "loaded" ? usersState.users : [];
  const validCount = users.filter((user) => user.eligibility === "valid").length;
  const invalidCount = users.length - validCount;

  function handleContactSaved(draft: ContactDraft) {
    setUsersState((current) => {
      if (current.status !== "loaded") return current;
      return {
        status: "loaded",
        users: current.users.map((contact) =>
          contact.sourceUserId === draft.sourceUserId
            ? toContactRecord({ ...draft, id: draft.sourceUserId })
            : contact,
        ),
      };
    });
    setAnnouncement(`Contacto ${draft.name} guardado en Zoho CRM.`);
  }

  return (
    <main className="shell">
      <section className="panel" aria-labelledby="page-title">
        <p className="eyebrow">Prueba técnica · LogosCorp</p>
        <h1 id="page-title">Sincronización con Zoho CRM</h1>
        <p className="intro">
          Los datos se cargan desde JSONPlaceholder y se normalizan en el servidor
          antes de llegar a esta aplicación.
        </p>
        <p
          className={`status status--${health}`}
          role="status"
          aria-live="polite"
        >
          <span className="status__dot" aria-hidden="true" />
          {statusLabel}
        </p>
        <section className="users" aria-labelledby="users-title">
          <h2 id="users-title">Carga de usuarios</h2>
          {usersState.status === "loading" && (
            <p role="status" aria-live="polite">Cargando usuarios…</p>
          )}
          {usersState.status === "error" && (
            <div className="notice notice--error" role="alert">
              <p>{usersState.message}</p>
              <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
                Reintentar
              </button>
            </div>
          )}
          {usersState.status === "loaded" && users.length === 0 && (
            <p role="status">No se encontraron usuarios.</p>
          )}
          {usersState.status === "loaded" && users.length > 0 && (
            <>
              <dl className="summary" aria-live="polite">
                <div><dt>Total cargados</dt><dd>{users.length}</dd></div>
                <div><dt>Empresas válidas</dt><dd>{validCount}</dd></div>
                <div><dt>Empresas inválidas</dt><dd>{invalidCount}</dd></div>
              </dl>
              <ContactTable
                contacts={users}
                onEdit={(contact) => {
                  setAnnouncement("");
                  setEditingContact(contact);
                }}
              />
            </>
          )}
          {announcement && (
            <p className="sr-only" role="status" aria-live="polite">
              {announcement}
            </p>
          )}
          {editingContact && (
            <ContactEditForm
              key={editingContact.sourceUserId}
              contact={editingContact}
              onClose={() => setEditingContact(null)}
              onSuccess={handleContactSaved}
            />
          )}
        </section>
      </section>
    </main>
  );
}
