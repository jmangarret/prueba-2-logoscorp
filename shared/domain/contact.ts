export type ContactEligibility = "valid" | "invalid";

export interface ContactRecord {
  sourceUserId: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  companyName: string;
  normalizedPhone: string;
  normalizedWebsite: string;
  eligibility: ContactEligibility;
}

export interface ContactDraft {
  sourceUserId: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  companyName: string;
}

export function normalizePhone(phone: string): string {
  const withoutExtension = phone.replace(/(?:ext\.?|x|#)\s*\d.*$/i, "");
  return withoutExtension.replace(/\D/g, "");
}

export function normalizeWebsite(website: string): string {
  const trimmed = website.trim();
  if (!trimmed) return "";

  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

export function classifyCompany(companyName: string): ContactEligibility {
  return /group|inc\.|llc/i.test(companyName) ? "valid" : "invalid";
}

export function toContactRecord(source: {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  companyName: string;
}): ContactRecord {
  return {
    sourceUserId: source.id,
    username: source.username,
    name: source.name,
    email: source.email,
    phone: source.phone,
    website: source.website,
    companyName: source.companyName,
    normalizedPhone: normalizePhone(source.phone),
    normalizedWebsite: normalizeWebsite(source.website),
    eligibility: classifyCompany(source.companyName),
  };
}
