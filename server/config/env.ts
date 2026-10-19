export interface ZohoRuntimeConfig {
  accountsUrl: URL;
  apiBaseUrl: URL;
  accessToken: string;
}

function requireZohoUrl(
  value: string | undefined,
  variableName: string,
  expectedHost: string,
  expectedPath?: string,
): URL {
  if (!value) {
    throw new Error(`Falta configurar ${variableName} en el entorno del servidor.`);
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error(`${variableName} debe ser una URL válida.`);
  }

  if (parsedUrl.protocol !== "https:") {
    throw new Error(`${variableName} debe usar HTTPS.`);
  }
  if (parsedUrl.hostname.toLowerCase() !== expectedHost) {
    throw new Error(`${variableName} no corresponde al datacenter Zoho confirmado.`);
  }
  if (
    expectedPath &&
    !["/", expectedPath, `${expectedPath}/`].includes(parsedUrl.pathname)
  ) {
    throw new Error(`${variableName} debe apuntar a ${expectedPath}.`);
  }
  if (
    parsedUrl.port ||
    parsedUrl.search ||
    parsedUrl.hash ||
    parsedUrl.username ||
    parsedUrl.password
  ) {
    throw new Error(`${variableName} no debe incluir credenciales, query ni fragmento.`);
  }

  if (expectedPath && parsedUrl.pathname === "/") {
    return new URL(expectedPath, parsedUrl.origin);
  }
  return parsedUrl;
}

/** Lee configuración exclusivamente desde el entorno del proceso servidor. */
export function readZohoRuntimeConfig(
  environment: NodeJS.ProcessEnv = process.env,
): ZohoRuntimeConfig {
  const accessToken = environment.ZOHO_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    throw new Error("Falta configurar ZOHO_ACCESS_TOKEN en el entorno del servidor.");
  }

  return {
    accountsUrl: requireZohoUrl(
      environment.ZOHO_ACCOUNTS_URL,
      "ZOHO_ACCOUNTS_URL",
      "accounts.zoho.com",
    ),
    apiBaseUrl: requireZohoUrl(
      environment.ZOHO_API_BASE_URL,
      "ZOHO_API_BASE_URL",
      "www.zohoapis.com",
      "/crm/v8",
    ),
    accessToken,
  };
}
