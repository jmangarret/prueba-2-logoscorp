# Prueba técnica — Zoho CRM

Plan y documentación inicial para la prueba descrita en [`Proyecto.txt`](Proyecto.txt).

## Estado

Fase 3: la aplicación obtiene usuarios de JSONPlaceholder a través del servidor local, valida la respuesta, normaliza teléfono y website, y clasifica empresas antes de presentar un resumen. La integración Zoho se incorporará en su fase aprobada.

## Diseño acordado

- Frontend con React, Vite y TypeScript en modo estricto.
- Ejecución local. El navegador llamará rutas `/api/...` del mismo origen; Vite reenviará al servidor Node local, que llamará a Zoho desde el servidor. No se usarán extensiones para CORS ni llamadas de navegador directas a Zoho.
- La UI, los casos de uso, los servicios, el dominio y los adaptadores Zoho tendrán responsabilidades separadas. La sincronización individual y masiva secuencial reutilizará un único caso de uso central.
- Los usuarios inválidos no podrán seleccionarse. La sincronización reportará resultados por registro y continuará aunque falle un elemento.
- El access token se generará manualmente con OAuth; la aplicación no automatizará su renovación en esta prueba.

## Requisitos y ejecución local

- Node.js `20.19+` o `22.12+`; se recomienda Node 22 (ver `.nvmrc`). Vite actual requiere una de esas versiones.
- Ejecuta `npm install` y después `npm run dev`.
- Vite sirve la UI en `http://127.0.0.1:5173`; la API local escucha solo en `127.0.0.1:8787`. Las peticiones `/api` se reenvían a la API local mediante el proxy de Vite.
- `GET /api/health` comprueba la disponibilidad de la API. `GET /api/users` obtiene, valida y transforma datos de JSONPlaceholder. `POST /api/contacts/sync` devuelve `501` hasta la fase que implementa la sincronización.
- Para futuras integraciones, copia `.env.example` a `.env.local` y configura secretos solo después de aprobar esa fase. El servidor local carga `.env.local`; ninguna variable se expone con prefijo `VITE_`.
- `npm run typecheck` revisa los proyectos TypeScript y `npm run build` genera el build de frontend.

## Configuración segura prevista

Los nombres previstos para la configuración local son:

```text
ZOHO_ACCOUNTS_URL
ZOHO_API_BASE_URL
ZOHO_CLIENT_ID
ZOHO_CLIENT_SECRET
ZOHO_REFRESH_TOKEN
ZOHO_ACCESS_TOKEN
```

`.env.example` contiene los nombres y las URLs públicas; los campos secretos están vacíos a propósito. No pongas valores reales en este README, `.env.example`, Git ni el bundle del navegador. Cuando se apruebe la fase que configure la aplicación, copia la plantilla a un archivo local ignorado por Git y configura ahí los valores; el servidor leerá las credenciales. Las URLs confirmadas son `https://accounts.zoho.com` y `https://www.zohoapis.com`.

## Criterios de aceptación

Los criterios, fases, aprobaciones, decisiones y pendientes están en [`plan de implementacion.md`](plan%20de%20implementacion.md). Las instrucciones para agentes están en [`AGENTS.md`](AGENTS.md).

## Próximo paso

Consulta el plan para ver las puertas de aprobación por fase, decisiones y pendientes. La rama de trabajo de esta fase es `fase-2-esqueleto-seguro`.
