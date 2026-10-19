import { useState, type FormEvent } from "react";
import type { SyncContactResponse } from "../../shared/contracts/sync-contact";
import type { ContactDraft, ContactRecord } from "../../shared/domain/contact";
import { normalizeWebsite } from "../../shared/domain/contact";
import { syncContact } from "../services/contacts-api";

interface ContactEditFormProps {
  contact: ContactRecord;
  onClose: () => void;
  onSuccess: (draft: ContactDraft) => void;
}

function createDraft(contact: ContactRecord): ContactDraft {
  return {
    sourceUserId: contact.sourceUserId,
    username: contact.username,
    name: contact.name,
    email: contact.email,
    phone: contact.normalizedPhone,
    website: contact.normalizedWebsite,
    companyName: contact.companyName,
  };
}

export function ContactEditForm({ contact, onClose, onSuccess }: ContactEditFormProps) {
  const [draft, setDraft] = useState(() => createDraft(contact));
  const [result, setResult] = useState<SyncContactResponse | null>(null);
  const [validationMessage, setValidationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof Omit<ContactDraft, "sourceUserId" | "username">, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setResult(null);
    setValidationMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    setValidationMessage("");

    if (!draft.name.trim()) {
      setValidationMessage("Name es obligatorio.");
      return;
    }

    const normalizedWebsite = normalizeWebsite(draft.website);
    if (draft.website.trim() && !normalizedWebsite) {
      setValidationMessage("Ingresa una dirección web válida con protocolo HTTP o HTTPS.");
      return;
    }

    const submission = { ...draft, website: normalizedWebsite };
    setIsSubmitting(true);
    try {
      const response = await syncContact(submission);
      setResult(response);
      if (response.ok) onSuccess(submission);
    } catch (error: unknown) {
      setValidationMessage(
        error instanceof Error ? error.message : "No fue posible enviar el contacto.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="edit-panel" aria-labelledby="edit-title">
      <div className="edit-panel__heading">
        <div>
          <p className="eyebrow">Edición individual</p>
          <h2 id="edit-title">Editar contacto</h2>
        </div>
        <button className="button button--secondary" type="button" onClick={onClose}>
          Cerrar
        </button>
      </div>
      <p className="form-context">Usuario de origen: {draft.username}</p>
      <form className="contact-form" onSubmit={(event) => void handleSubmit(event)}>
        <label>
          Name
          <input
            autoFocus
            name="name"
            required
            value={draft.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            value={draft.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
        </label>
        <label>
          Phone
          <input
            name="phone"
            type="tel"
            value={draft.phone}
            onChange={(event) => updateField("phone", event.target.value)}
          />
        </label>
        <label>
          Company Name
          <input
            name="companyName"
            value={draft.companyName}
            onChange={(event) => updateField("companyName", event.target.value)}
          />
        </label>
        <label className="contact-form__wide">
          Website
          <input
            name="website"
            inputMode="url"
            aria-describedby="website-hint"
            value={draft.website}
            onChange={(event) => updateField("website", event.target.value)}
          />
          <span id="website-hint" className="field-hint">
            Puedes escribir el dominio sin protocolo; se usará HTTPS.
          </span>
        </label>
        {validationMessage && (
          <p className="form-message form-message--error" role="alert">
            {validationMessage}
          </p>
        )}
        {result && !result.ok && (
          <p className="form-message form-message--error" role="alert">
            {result.error.message} <span className="message-code">({result.error.code})</span>
          </p>
        )}
        {result?.ok && (
          <p className="form-message form-message--success" role="status" aria-live="polite">
            Contacto creado en Zoho. Identificador: {result.data.zohoContactId}
          </p>
        )}
        <div className="contact-form__actions">
          <button
            className="button button--primary"
            type="submit"
            disabled={isSubmitting || result?.ok === true}
          >
            {isSubmitting ? "Enviando…" : "Guardar y Enviar a CRM"}
          </button>
        </div>
      </form>
    </section>
  );
}
