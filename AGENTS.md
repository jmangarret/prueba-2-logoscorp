# Instrucciones para agentes

Este archivo complementa [`plan de implementacion.md`](plan%20de%20implementacion.md) y [`Proyecto.txt`](Proyecto.txt). Lee ambos antes de actuar. El plan define alcance, fases, tareas, criterios de salida, pendientes y aprobaciones; este archivo define cómo trabajar dentro de ese marco.

## Límite actual

- Implementa únicamente tareas de la fase aprobada y respeta las puertas del plan para avanzar. La Fase 3 está completada y aceptada; la Fase 4 (tabla/edición) requiere aprobación explícita antes de iniciar. No implementes sincronización real con Zoho hasta aprobar sus fases. No uses credenciales ni contactes Zoho en fases que no lo requieran. No publiques, compartas ni integres cambios sin autorización específica. El repositorio ya está configurado; no lo reinicialices.
- Antes de cada fase solicita y espera aprobación explícita. La aprobación de una fase no aprueba las fases siguientes ni acciones externas separadas.
- Si hay decisiones abiertas que bloquean la fase, documenta el bloqueo y continúa solo con tareas independientes ya aprobadas. No inventes contratos, endpoints, reglas de negocio, secretos o decisiones de infraestructura.
- Conserva el registro de pendientes, decisiones y aprobaciones en `plan de implementacion.md`.

## Forma de trabajo

- Mantén cambios acotados a la tarea y fase aprobadas. Inspecciona el estado del repositorio antes de editar código. No sobrescribas ni descartes cambios ajenos.
- Para cambios de código, usa una rama dedicada `fase-<n>-<tema>` basada en `main`; no trabajes en `main`. Antes comprueba el acceso a `origin`, que `main` esté actualizado y que no haya cambios ajenos. `main` está inicializada y publicada en `origin`; sigue el procedimiento de revisión y PR de `plan de implementacion.md`. El usuario aprobó React con Vite y TypeScript estricto, ejecución solo local, y confirmó que las credenciales Zoho están disponibles; nunca expongas sus valores.
- Las variables de entorno aprobadas para documentar son `ZOHO_ACCOUNTS_URL`, `ZOHO_API_BASE_URL`, `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN` y `ZOHO_ACCESS_TOKEN`. Solo documenta nombres/marcadores no secretos hasta una fase de implementación aprobada; nunca configures ni escribas secretos antes. La regla de empresa y la simulación de username inicial “C” comparan sin distinguir mayúsculas; el lote es secuencial.
- Separa UI, casos de uso, servicios/adaptadores y dominio. Pon las transformaciones y funciones comunes en módulos reutilizables con responsabilidad clara; no concentres lógica de negocio en componentes ni dupliques integración API.
- Mantén tipado estricto y contratos explícitos. Las respuestas de servicios externos son datos no confiables: valida y transforma en el límite. Evita `any`, secretos cliente y errores que filtren tokens o datos sensibles.
- El acceso a Zoho debe pasar por servidor/proxy autorizado. El flujo individual y masivo deben reutilizar el mismo servicio/caso de uso. El envío masivo debe preservar resultados independientes y continuar tras fallos; la simulación por username iniciado en “C” debe fallar sin guardar.
- Trata como requisitos de aceptación los campos, reglas de normalización, elegibilidad, estados, resumen real, documentación y entregables descritos en `Proyecto.txt` y en el plan.
- Informa claramente qué cambió, qué se verificó, qué no se pudo confirmar, riesgos y siguiente aprobación requerida. No afirmes que una operación externa tuvo éxito sin evidencia del servicio.

## Skills por rol

Usa las skills disponibles cuando la fase corresponda; no copies su contenido ni las apliques a tareas ajenas:

- **Gestión del plan, fases, dependencias, riesgos, decisiones y estado:** `$project-manager` (`/Users/jmangarret/.codex/skills/project-manager/SKILL.md`). Mantén compromisos y fechas sin inventarlos; identifica claramente supuestos y responsables desconocidos.
- **Pantallas, formularios y flujos que consuman o envíen datos por API:** `$frontend-api-integration` (`/Users/jmangarret/.codex/skills/frontend-api-integration/SKILL.md`). Inspecciona primero convenciones y flujo de extremo a extremo; reutiliza clientes y patrones existentes; protege límites servidor/cliente y estados de error.
- **Skill adicional:** no se requiere una skill nueva para la planificación actual. Si una fase futura descubre un trabajo especializado que no cubren las skills disponibles, explica la brecha y propone crear una skill con `$skill-creator` (`/Users/jmangarret/.codex/skills/.system/skill-creator/SKILL.md`). No crees skills automáticamente ni expandas el alcance sin aprobación.

## Puerta para iniciar implementación

No escribas código de producto hasta que: (1) la Fase 0 haya resuelto los bloqueos pertinentes; (2) el usuario apruebe explícitamente la Fase 1 y los contratos/diseño estén definidos; (3) haya una fase de implementación concreta aprobada; y (4) exista una rama de trabajo autorizada y segura. Si alguna condición deja de cumplirse, detén solo el trabajo dependiente y registra el pendiente.
