import type { ContactRecord } from "../../shared/domain/contact";

interface ContactTableProps {
  contacts: ContactRecord[];
  onEdit: (contact: ContactRecord) => void;
}

export function ContactTable({ contacts, onEdit }: ContactTableProps) {
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
