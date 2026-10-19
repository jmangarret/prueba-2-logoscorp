export interface ZohoRuntimeConfig {
  accountsUrl: URL;
  apiBaseUrl: URL;
  accessToken: string;
}

function requireHttpsUrl(value: string | undefined, variableName: string): URL {
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
    accountsUrl: requireHttpsUrl(
      environment.ZOHO_ACCOUNTS_URL,
      "ZOHO_ACCOUNTS_URL",
    ),
    apiBaseUrl: requireHttpsUrl(
      environment.ZOHO_API_BASE_URL,
      "ZOHO_API_BASE_URL",
    ),
    accessToken,
  };
}
