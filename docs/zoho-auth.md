# Configuración local de Zoho

La aplicación usa Zoho CRM únicamente desde el proceso Node local. No configures secretos con prefijo `VITE_`, no los incluyas en solicitudes del navegador y no guardes valores reales en Git.

## Generar el access token en Postman

1. Importa [`zoho-token.postman_collection.json`](zoho-token.postman_collection.json).
2. Crea un entorno local de Postman con `ZOHO_ACCOUNTS_URL`, `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET` y `ZOHO_REFRESH_TOKEN`. Usa valores locales y no compartas ni exportes el entorno con secretos.
3. Ejecuta **Generar access token**. La respuesta contiene un access token sensible; no la guardes en una colección o entorno compartido.
4. Copia localmente el valor de `access_token` a `ZOHO_ACCESS_TOKEN` en `.env.local`, ignorado por Git. Define también `ZOHO_API_BASE_URL=https://www.zohoapis.com/crm/v8` y `ZOHO_ACCOUNTS_URL=https://accounts.zoho.com`.
5. Reinicia `npm run dev` para que el servidor lea `.env.local`. La aplicación no renueva automáticamente el token: genera otro manualmente cuando expire.

La colección usa la operación oficial de Zoho Accounts `POST /oauth/v2/token` con `grant_type=refresh_token`. El servidor autentica las solicitudes CRM mediante el header `Authorization: Zoho-oauthtoken <token>`.

## Flujo de creación individual

El navegador envía el borrador a `POST /api/contacts/sync`. El servidor valida y normaliza los campos, aplica la simulación del username que inicia con `C`, carga la configuración solo desde su entorno y llama a `POST {ZOHO_API_BASE_URL}/Contacts`. Solo responde éxito cuando Zoho devuelve estado y código de registro exitosos junto con un ID. Los mensajes de error son saneados; el cuerpo externo y el token no se devuelven ni se registran.

El mapping es el aprobado en el plan: nombre completo a `Last_Name`, email a `Email`, teléfono normalizado a `Phone` y website normalizado a `Website` si el campo está disponible. `companyName` no se mapea a `Account_Name`, que es un lookup.

Documentación oficial: [Zoho CRM v8 Insert Records](https://www.zoho.com/crm/developer/docs/api/v8/insert-records.html), [Zoho Accounts Refreshing Access Tokens](https://www.zoho.com/connect/api/oauth-authentication-refreshing-access-tokens.html) y [Zoho Accounts Using Access Token](https://www.zoho.com/accounts/protocol/oauth/use-access-token.html).
