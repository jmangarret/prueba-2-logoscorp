# Prueba técnica — Zoho CRM

Plan y documentación inicial para la prueba descrita en [`Proyecto.txt`](Proyecto.txt).

## Estado

Este commit inicial contiene los requisitos y el plan de implementación. La aplicación todavía no está creada, por lo que aún no hay comandos de instalación o ejecución. La generación de código queda sujeta a la aprobación de la fase de implementación correspondiente, de acuerdo con [`AGENTS.md`](AGENTS.md) y [`plan de implementacion.md`](plan%20de%20implementacion.md).

## Diseño acordado

- Frontend con React, Vite y TypeScript en modo estricto.
- Ejecución local. El navegador llamará rutas `/api/...` del mismo origen; Vite reenviará al servidor Node local, que llamará a Zoho desde el servidor. No se usarán extensiones para CORS ni llamadas de navegador directas a Zoho.
- La UI, los casos de uso, los servicios, el dominio y los adaptadores Zoho tendrán responsabilidades separadas. La sincronización individual y masiva secuencial reutilizará un único caso de uso central.
- Los usuarios inválidos no podrán seleccionarse. La sincronización reportará resultados por registro y continuará aunque falle un elemento.
- El access token se generará manualmente con OAuth; la aplicación no automatizará su renovación en esta prueba.

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

No pongas valores reales en este README, `.env.example`, Git ni el bundle del navegador. Cuando se apruebe la fase que configure la aplicación, los secretos se guardarán únicamente en un archivo local ignorado por Git y se leerán desde el servidor. Las URLs propuestas son `https://accounts.zoho.com` y `https://www.zohoapis.com`.

## Criterios de aceptación

Los criterios, fases, aprobaciones, decisiones y pendientes están en [`plan de implementacion.md`](plan%20de%20implementacion.md). Las instrucciones para agentes están en [`AGENTS.md`](AGENTS.md).

## Próximo paso

Aprobar la salida de la Fase 1 y el alcance de la Fase 2 antes de crear la aplicación. El repositorio remoto está configurado, pero vacío; este commit inicial establecerá `main` localmente. El envío al remoto se hará solo con autorización explícita.
