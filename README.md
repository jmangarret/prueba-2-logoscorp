# Prueba técnica — Zoho CRM

Aplicación local para cargar usuarios de JSONPlaceholder, normalizar sus datos y sincronizar contactos con Zoho CRM de forma individual o por lote.

## Estado

Las fases 0–6 están completadas y aceptadas. La Fase 7 prepara documentación, revisión y entrega; la integración final a `main` se realizará mediante un Pull Request aprobado.

## Requisitos

- Node.js `20.19+` o `22.12+`. Se recomienda Node 22; `.nvmrc` indica la versión principal.
- npm y Git.
- Credenciales OAuth de Zoho CRM disponibles localmente para crear contactos.

## Ejecución local

```sh
nvm install
nvm use
npm ci
cp -n .env.example .env.local
```

Completa `.env.local` con la configuración de Zoho descrita en [docs/zoho-auth.md](docs/zoho-auth.md), luego inicia los dos procesos locales:

```sh
npm run dev
```

Abre `http://127.0.0.1:5173`. Vite sirve la interfaz y escucha solo en loopback; el servidor Node de la API usa `http://127.0.0.1:8787`. Si cambias `.env.local`, reinicia `npm run dev` para que Node vuelva a cargarla.

Comprobaciones disponibles:

```sh
npm run typecheck
npm run build
```

## Arquitectura y CORS

El navegador solicita únicamente rutas del mismo origen bajo `/api`. El proxy de Vite las reenvía al servidor Node local; solo ese servidor se comunica con Zoho. Así, el navegador no llama al dominio Zoho, no necesita una extensión CORS y nunca recibe el token OAuth. Las credenciales se cargan en el proceso servidor desde `.env.local` y no usan variables `VITE_*`.

| Área | Responsabilidad |
|---|---|
| `src/App.tsx` | Orquesta carga, edición, selección y resumen de la interfaz. |
| `src/components/ContactTable.tsx` | Tabla accesible; ofrece selección masiva solo para empresas válidas. |
| `src/components/ContactEditForm.tsx` | Edición y envío individual mediante el servicio compartido. |
| `src/services/users-api.ts` | Cliente tipado de la ruta local de usuarios. |
| `src/services/contacts-api.ts` | Cliente central de `POST /api/contacts/sync`, compartido por el formulario y el lote. |
| `src/services/contact-sync-batch.ts` | Procesa secuencialmente cada contacto válido, captura cada resultado y continúa ante fallos. |
| `shared/domain/contact.ts` | Tipos, clasificación y funciones puras para normalizar y mapear contactos. |
| `shared/contracts/` | Contratos compartidos para solicitudes y respuestas de API. |
| `server/index.ts` | Rutas HTTP locales, lectura del cuerpo y estados de respuesta. |
| `server/application/sync-contact.ts` | Validación server-side, elegibilidad y caso de uso central de sincronización. |
| `server/services/jsonplaceholder-users.ts` | Obtiene, valida y transforma la respuesta de JSONPlaceholder. |
| `server/integrations/zoho/zoho-contacts.ts` | Adaptador Zoho; mapea a `Contacts`, aplica timeout y valida el resultado externo. |

## Reglas de datos y sincronización

- Teléfono: se eliminan extensiones (`ext`, `x` o `#`) y se conservan solo dígitos.
- Website: se normaliza a una URL HTTP/HTTPS; si falta el protocolo se usa HTTPS.
- Una empresa es válida si contiene `Group`, `Inc.` o `LLC`, sin distinguir mayúsculas. Las filas inválidas se ven atenuadas y no se pueden seleccionar para el lote.
- La sincronización individual y la masiva usan `POST /api/contacts/sync`; el lote envía una solicitud a la vez y muestra un resultado por contacto.
- Si el username comienza por `C` (sin distinguir mayúsculas), el servidor informa el fallo simulado antes de llamar a Zoho. Un fallo de un elemento no interrumpe los siguientes.
- El contacto se crea en Zoho solo cuando la API confirma el éxito. El nombre completo se envía como `Last_Name`; email, teléfono y website se envían si tienen valor. No se crea ni busca una cuenta con `companyName`.

## Zoho OAuth y seguridad

La aplicación usa un access token generado manualmente desde el refresh token; no lo renueva automáticamente. La [guía y colección Postman](docs/zoho-auth.md) explican cómo generar el token con placeholders. Las URLs de la cuenta confirmada son `https://accounts.zoho.com` y `https://www.zohoapis.com/crm/v8`.

Variables locales previstas:

```text
ZOHO_ACCOUNTS_URL
ZOHO_API_BASE_URL
ZOHO_CLIENT_ID
ZOHO_CLIENT_SECRET
ZOHO_REFRESH_TOKEN
ZOHO_ACCESS_TOKEN
```

`.env.local` está excluido por Git. Mantén valores y respuestas OAuth fuera del repositorio, del navegador, de capturas, de logs y de mensajes. `.env.example` contiene únicamente URLs públicas y nombres de variables.

## Documentación del proyecto

- [Plan, criterios, decisiones, fases y aprobaciones](plan%20de%20implementacion.md)
- [Guía de autenticación y colección Postman](docs/zoho-auth.md)
- [Instrucciones para agentes](AGENTS.md)
- [Especificación original](Proyecto.txt)
