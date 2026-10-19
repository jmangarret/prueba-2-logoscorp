import type { ContactRecord } from "../../shared/domain/contact";

interface ContactTableProps {
  contacts: ContactRecord[];
  onEdit: (contact: ContactRecord) => void;
  selectedContactIds: ReadonlySet<number>;
  onSelectionChange: (sourceUserId: number, selected: boolean) => void;
  isDisabled?: boolean;
}

export function ContactTable({
  contacts,
  onEdit,
  selectedContactIds,
  onSelectionChange,
  isDisabled = false,
}: ContactTableProps) {
  return (
    <div
      className="table-scroll"
      role="region"
      aria-label="Usuarios cargados"
      tabIndex={0}
    >
      <table className="contact-table">
        <caption>Usuarios importados desde JSONPlaceholder</caption>
        <thead>
          <tr>
            <th scope="col"><span className="visually-hidden">Seleccionar</span></th>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Phone</th>
            <th scope="col">Company Name</th>
            <th scope="col">
              <span className="visually-hidden">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr
              key={contact.sourceUserId}
              className={
                contact.eligibility === "invalid"
                  ? "contact-row contact-row--invalid"
                  : "contact-row"
              }
            >
              <td>
                {contact.eligibility === "valid" && (
                  <input
                    type="checkbox"
                    aria-label={`Seleccionar ${contact.name} para sincronización`}
                    checked={selectedContactIds.has(contact.sourceUserId)}
                    disabled={isDisabled}
                    onChange={(event) =>
                      onSelectionChange(contact.sourceUserId, event.target.checked)
                    }
                  />
                )}
              </td>
              <th scope="row">{contact.name}</th>
              <td>{contact.email || "—"}</td>
              <td>{contact.normalizedPhone || "—"}</td>
              <td>
                <span>{contact.companyName || "—"}</span>
                <span className={`eligibility eligibility--${contact.eligibility}`}>
                  {contact.eligibility === "valid" ? "Válida" : "Inválida"}
                </span>
              </td>
              <td>
                <button
                  className="button button--secondary"
                  type="button"
                  aria-label={`Editar ${contact.name}`}
                  disabled={isDisabled}
                  onClick={() => onEdit(contact)}
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
