# Plan de implementación

## Propósito y alcance

Definir y ejecutar, por fases aprobadas, la prueba técnica descrita en [`Proyecto.txt`](Proyecto.txt). La solución deberá importar usuarios de JSONPlaceholder, normalizar y clasificar los datos, permitir edición y sincronización individual o masiva con Zoho CRM, y presentar resultados de forma resiliente.

Este documento es el plan de trabajo y la fuente de seguimiento. No autoriza por sí solo a comenzar una fase: se requiere aprobación explícita antes de cada fase y de cualquier tarea que cambie el alcance, use credenciales, publique datos o altere un sistema externo. Hasta cumplir las condiciones previas de la Fase 0 y aprobar la Fase 1, no se genera código de producto.

## Criterios rectores

- **Seguridad primero:** secretos OAuth y tokens se guardan en variables de entorno del servidor, nunca en el bundle, el repositorio, capturas, logs o documentación pública. Toda comunicación con Zoho pasa por un backend/proxy controlado por la aplicación; no se usan extensiones CORS.
- **Responsabilidades separadas:** UI presenta estado y recoge acciones; casos de uso coordinan flujos; servicios encapsulan JSONPlaceholder y Zoho; adaptadores mapean contratos externos a modelos internos; validación/normalización y reglas de negocio viven en funciones puras compartidas donde corresponda.
- **Abstracción útil:** un único servicio/caso de uso centralizado de sincronización Zoho es llamado por el flujo individual y el masivo. El lote procesa resultados independientes y no aborta ante un fallo individual.
- **Tipado estricto:** activar y mantener las opciones estrictas del lenguaje/compilador elegido (por ejemplo, TypeScript `strict` si el proyecto aprobado usa React/Vite con TypeScript); evitar `any`, conversiones inseguras y duplicación de contratos. Validar en tiempo de ejecución respuestas de servicios externos en sus límites.
- **Calidad y claridad:** componentes acotados, nombres explícitos, errores tipados/controlados, estados de carga/vacío/error, accesibilidad básica, configuración documentada y README de ejecución, CORS y ubicación de lógica reutilizable.
- **Trazabilidad:** cada fase cierra con entregables revisables, criterios verificables, pendientes y una solicitud de aprobación para avanzar.

## Flujo de aprobación y ramas

1. Antes de empezar una fase se presenta su alcance, tareas, archivos previstos, dependencias y criterios de aceptación. Esperar aprobación explícita del usuario; silencio no cuenta como aprobación.
2. Una fase aprobada autoriza únicamente sus tareas listadas. Si aparece una decisión que cambie tecnología, alcance, seguridad, datos externos o entregables, detener esa tarea, documentar la decisión y pedir aprobación.
3. Antes de cualquier cambio de código, comprobar que el repositorio Git está configurado y limpio, la rama base acordada está actualizada y no hay trabajo ajeno sin guardar. El remoto `origin` (`https://github.com/jmangarret/prueba-2-logoscorp.git`) tiene `main` inicializada y publicada; confirmar sincronización antes de abrir cada rama. No crear ni publicar otro repositorio ni hacer push sin autorización.
4. Para cada fase de implementación aprobada, trabajar en una rama dedicada basada en `main`, con nombre `fase-<n>-<tema>` (por ejemplo `fase-2-integracion-api`). No trabajar directamente en `main`. Si el usuario/repo ya define otra convención, proponerla antes de usarla.
5. Mantener cambios acotados a la fase. Revisar el diff, comprobar los criterios acordados y documentar las verificaciones realizadas. No añadir pruebas ni ejecutar comandos de verificación fuera de lo solicitado por el usuario o requerido por la configuración del proyecto.
6. Al completar una fase, presentar resumen y evidencia, riesgos y pendientes; preparar la rama para revisión. La integración a `main` se realiza mediante Pull Request y requiere aprobación explícita antes de abrirlo si no fue autorizada para esa fase. Merge, push, creación/publicación del repositorio y compartirlo con `jchonglogoscorp` y `Duboox` son acciones separadas que requieren autorización explícita cuando aún no se haya dado.
7. No iniciar la fase siguiente hasta que el usuario apruebe el resultado de la fase actual. No borrar ramas ni descartar cambios sin autorización.

## Fases y tareas

### Fase 0 — Aclaraciones, entorno y preparación

**Objetivo:** resolver los bloqueos de información y acordar la base de trabajo antes de diseñar o implementar.

**Tareas**

- [x] Repositorio Git local configurado y publicado: remoto `origin` es `https://github.com/jmangarret/prueba-2-logoscorp.git`, rama `main`; convención aprobada `fase-<n>-<tema>`. El usuario autorizó iniciar y publicar `main` con los documentos.
- [x] Usuario confirma disponibilidad de credenciales OAuth de Zoho y solicita definir solo los nombres de variables de entorno, sin configurar ni copiar valores. Nunca solicitar o incluir secretos en chat, commits o archivos versionados. Variables propuestas: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_ACCESS_TOKEN`, `ZOHO_ACCOUNTS_URL`, `ZOHO_API_BASE_URL`. Los secretos solo se cargarán en un archivo local ignorado por Git cuando se apruebe la fase de implementación; `.env.example` contendrá nombres y valores de ejemplo no sensibles.
- [x] Usuario confirma región/datacenter y las URLs `accounts.zoho.com` y `www.zohoapis.com` propuestas en `Proyecto.txt`.
- [x] Aprobado React con Vite y TypeScript estricto, con capa servidor/proxy para Zoho. El mecanismo concreto se define en Fase 1; no inventar endpoints ni credenciales.
- [x] Usuario confirma ejecución solo local; no se contempla despliegue.
- [x] Un único desarrollador aprobará las fases/PR. Los criterios de aceptación se derivarán de `Proyecto.txt` y se detallarán por decisión técnica documentada en el plan; no se presuponen personas adicionales.

**Criterio de salida:** decisiones anteriores registradas; acceso al remoto verificado y `main` inicializada/publicada; nombres de variables definidos sin valores secretos. Aprobación explícita para iniciar Fase 1.

**Estado:** completada. `main` está inicializada y publicada; las variables están definidas sin valores secretos.

### Fase 1 — Diseño técnico y contratos

**Objetivo:** definir estructura y límites antes de escribir funcionalidad.

**Tareas**

- [x] Inspeccionar estructura y convenciones existentes. El repositorio solo tiene `Proyecto.txt`, `AGENTS.md` y este plan; no hay aplicación, dependencias ni convenciones de framework que preservar.
- [x] Proponer estructura por responsabilidades: presentación, casos de uso, servicios de API, adaptadores/mapeos, dominio/modelos, validación y funciones comunes; detalle propuesto a continuación.
- [x] Definir modelos internos tipados y contratos para registros de usuario, clasificación válida/inválida, solicitud de sincronización y resultado individual; detalle propuesto a continuación.
- [x] Especificar normalización: quitar primero extensión telefónica y luego todo carácter que no sea dígito; anteponer `https://` cuando al website le falte protocolo; validar y mapear en los límites externos.
- [x] Precisar regla de validez: `company.name` contiene `Group`, `Inc.` o `LLC`; aprobación recibida para comparar sin distinguir mayúsculas.
- [x] Diseñar el flujo OAuth manual y configuración segura, proxy local y respuesta ante errores según documentación oficial de Zoho; detalle y fuentes a continuación.
- [x] Definir interfaz de sincronización central compartida por edición y lote secuencial, con resultado por registro.
- [x] Definir estados de carga, vacío, validación, error recuperable, éxito parcial y feedback accesible.
- [x] Registrar estructura, contratos, decisiones, riesgos y criterios de salida en este plan.

#### Diseño técnico propuesto

**Stack y ejecución:** React + Vite + TypeScript con `strict`; solo desarrollo/ejecución local. El navegador invoca rutas relativas `/api/...` en el mismo origen del servidor Vite. Vite reenvía esas rutas a un servidor Node local; este servidor llama a Zoho servidor-a-servidor. Así las credenciales no entran al navegador y el navegador no necesita CORS para llamar directamente a Zoho. No se propone despliegue.

**Estructura lógica propuesta** (los nombres concretos se ajustan al iniciar Fase 2, sin cambiar estas responsabilidades):

```text
src/
  domain/                 modelos internos, clasificación y normalización puros
  application/            cargar contactos y sincronizar uno/lote
  services/               cliente JSONPlaceholder y cliente HTTP de la API local
  components/             tabla, formulario, selección y feedback
  app/                    composición de la pantalla y estados de interfaz
server/
  routes/                 rutas locales, validación DTO y códigos HTTP
  application/            caso de uso central syncContact
  integrations/zoho/      cliente Zoho, DTO y mapeo de campos
  config/                 lectura de entorno solo servidor
shared/contracts/         DTOs compartidos estrictos entre navegador y servidor
```

Los componentes no conocen campos Zoho. El mapeo vive en `integrations/zoho`; la clasificación y la limpieza se implementan como funciones puras del dominio. Las respuestas externas se validan antes de convertirse a modelos internos.

**Modelo interno:** `SourceUser` conserva `id`, `username`, `name`, `email`, `phone`, `website` y `companyName` tras validar la respuesta de JSONPlaceholder. `Contact` contiene esos campos editables, `normalizedPhone`, `normalizedWebsite` y `eligibility: "valid" | "invalid"`. La regla compara sin distinguir mayúsculas y marca válido si el nombre de empresa contiene `Group`, `Inc.` o `LLC`. El estado de validez no se recalcula a partir de texto confiado en la UI al sincronizar: el servidor/caso de uso valida los datos de entrada y la elegibilidad se controla antes de ofrecer selección.

**Normalización:** quitar desde el primer marcador de extensión (`ext`, `x` o `#`, sin distinguir mayúsculas) hasta el final; luego conservar únicamente dígitos en el teléfono. Para website, recortar espacios y anteponer `https://` si no tiene esquema; validar URL http(s) antes de usarla o enviarla. No convertir valores vacíos en cadenas ficticias.

**Contrato local de sincronización:** `POST /api/contacts/sync` recibe `{ sourceUserId, username, name, email, phone, companyName, website }`. Los valores se validan en servidor (tipos, longitudes razonables, formato de email y URL, campos requeridos) y se normalizan/mappean en el límite de integración. Respuesta discriminada por `ok`: éxito incluye `{ sourceUserId, zohoContactId }`; fallo incluye `{ sourceUserId, code, message }`, con códigos saneados (`SIMULATED_FAILURE`, `VALIDATION_ERROR`, `ZOHO_REJECTED`, `ZOHO_UNAVAILABLE`, `AUTH_CONFIGURATION_ERROR`). Nunca incluir cuerpo sensible, token ni detalles internos en `message`.

El caso de uso servidor `syncContact` es el único punto que ejecuta la regla simulada y llama al adaptador Zoho. La función de servicio de la aplicación cliente `syncContact` invoca la ruta local. La edición individual la usa una vez; el caso de uso `syncSelectedContacts` la invoca secuencialmente por cada registro seleccionado, captura cada resultado y continúa aunque uno falle. No se crea una segunda implementación de envío ni un endpoint masivo que duplique la lógica.

**Mapping acordado para Zoho CRM Contacts:**

| Dato interno | Campo API Zoho | Regla |
|---|---|---|
| `name` | `Last_Name` | Enviar el nombre completo sin dividirlo para evitar pérdida o interpretación incorrecta de apellidos; es el campo obligatorio para crear un Contact. |
| `email` | `Email` | Enviar valor validado si no está vacío. |
| `normalizedPhone` | `Phone` | Enviar solo dígitos si no está vacío. |
| `normalizedWebsite` | `Website` | Enviar website normalizado si no está vacío y si el campo está disponible en la configuración de Contacts. |
| `companyName` | — | Se muestra, edita y utiliza para elegibilidad; no se envía como texto a `Account_Name`, porque es un lookup a Accounts y Zoho espera referencia de registro. No crear ni buscar Accounts como efecto lateral; requeriría alcance y permisos adicionales. |
| `username` / `sourceUserId` | — | Solo control de simulación/trazabilidad; no enviar a CRM. |

Esta decisión evita una relación de CRM inválida y no amplía la prueba a creación/búsqueda de Accounts. Si se exige asociar la empresa en Zoho, se necesitará otro alcance aprobado (resolver/crear Account y sus permisos, duplicados y comportamiento de edición).

**Zoho OAuth y API:** usar access token generado manualmente mediante el refresh token, según `Proyecto.txt`; no implementar renovación automática. Solo el servidor local lee `ZOHO_ACCESS_TOKEN` y usa `Authorization: Zoho-oauthtoken <token>`. Variables a documentar sin valores sensibles: `ZOHO_ACCOUNTS_URL`, `ZOHO_API_BASE_URL`, `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_ACCESS_TOKEN`. La generación manual usa las tres variables OAuth; la aplicación solo necesita base URLs y access token. `.env.example` tendrá nombres y marcadores no secretos; los valores reales se quedan fuera de Git en configuración local ignorada. Preferir ámbito mínimo `ZohoCRM.modules.contacts.CREATE` si el token existente lo permite; `ZohoCRM.modules.ALL` también está contemplado por la especificación, pero concede permisos más amplios.

Zoho API: `POST {ZOHO_API_BASE_URL}/crm/v8/Contacts`, body `{ "data": [{ ...campos mapeados... }] }`; considerar éxito únicamente cuando el HTTP y el resultado individual (`data[0].status`/`code`) confirman creación. Cada solicitud incluye un registro; el cliente de lote será secuencial. Responder con estado de éxito real, incluidos errores de autenticación, validación, duplicado, cuota y red de forma segura. La regla de username iniciado por `C` (sin distinguir mayúsculas) produce `SIMULATED_FAILURE` antes de invocar Zoho.

**Estados de UI:** carga inicial, lista vacía, error al cargar con opción de reintento, inválido claramente marcado además del color y no seleccionable, formulario precargado con validación y datos preservados tras fallo, envío individual, lote secuencial con resultado por fila, y resumen real de éxitos/fallos. Controles con etiqueta accesible, teclado y mensajes de estado anunciables. No usar optimistic success.

**Fuentes oficiales consultadas:** [Zoho CRM v8 Insert Records](https://www.zoho.com/crm/developer/docs/api/v8/insert-records.html) (POST por módulo, API names, `Last_Name` requerido y lookup por ID); [Zoho CRM v8 Field Metadata](https://www.zoho.com/crm/developer/docs/api/v8/field-meta.html) (API names de campos); [Zoho Accounts OAuth: Refreshing Access Tokens](https://www.zoho.com/connect/api/oauth-authentication-refreshing-access-tokens.html) (endpoint y client credentials); [Zoho Accounts OAuth: Using Access Token](https://www.zoho.com/accounts/protocol/oauth/use-access-token.html) (header de autorización). Verificar contra configuración real de la organización en la Fase 5 antes de sincronizar.

**Criterio de salida:** estructura, modelos, contratos, regla de negocio y diseño de seguridad revisados; no quedan decisiones que obliguen a inventar contratos Zoho. Aprobación explícita para iniciar Fase 2.

**Estado:** diseño completado; pendiente de aprobación de salida de Fase 1 para comenzar Fase 2.

### Fase 2 — Esqueleto y configuración segura

**Objetivo:** preparar la aplicación y el punto servidor de integración, sin exponer credenciales.

**Tareas**

- [x] Crear/configurar proyecto React/Vite/TypeScript y herramientas acordadas en `fase-2-esqueleto-seguro`.
- [x] Habilitar opciones estrictas de tipado y configuración del entorno; definir `.env.example` sin valores sensibles y reglas de exclusión en Git.
- [x] Configurar Vite para reenviar `/api` al servidor Node local enlazado solo a `127.0.0.1`. El servidor expone health y una ruta de sincronización provisional `501`; la llamada Zoho real se implementará en Fase 5. El navegador usa mismo origen y no solicita CORS directo a Zoho.
- [x] Revisar capa HTTP compartida: se difiere hasta las fases que implementen clientes externos, pues en este esqueleto no hay dos solicitudes HTTP reutilizables ni comportamiento de transporte que abstraer.
- [x] Registrar instrucciones de arranque, requisito de Node y configuración segura en README, sin incluir secretos.

**Criterio de salida:** estructura compilable, secretos solo del lado servidor, configuración reproducible y flujo CORS arquitectónico explicado. Aprobación para Fase 3.

**Estado:** completada y aceptada por el usuario en la rama `fase-2-esqueleto-seguro`; typecheck/build y funcionamiento de endpoints confirmados. Commit local `e4f9119` (`feat: scaffold local app and API server`).

### Fase 3 — Ingesta, normalización y clasificación

**Objetivo:** convertir los datos de JSONPlaceholder en un modelo interno seguro y consistente.

**Tareas**

- [x] Implementar servicio servidor para `https://jsonplaceholder.typicode.com/users` con timeout y errores controlados; el navegador accede mediante `/api/users` del mismo origen.
- [x] Validar la forma de la respuesta externa en el límite del servicio y la respuesta local en el cliente.
- [x] Implementar funciones puras reutilizables de normalización de teléfono y website en `shared/domain/contact.ts`.
- [x] Implementar clasificación de empresa conforme a la regla acordada, conservando explícitamente `eligibility: valid | invalid`.
- [x] Exponer estados de carga, vacío, error recuperable con reintento y resumen de clasificación a la UI.

**Criterio de salida:** datos transformados de forma consistente antes de llegar a presentación; registros inválidos identificables y sin selección. Aprobación para Fase 4.

**Estado:** completada y aceptada por el usuario en `fase-3-ingesta-normalizacion`; typecheck y build pasan. Smoke check HTTP de `/api/users` quedó pendiente porque el puerto local `8787` estaba ocupado por un proceso existente inaccesible desde el sandbox. La Fase 4 requiere aprobación explícita.

### Fase 4 — Tabla y edición individual

**Objetivo:** mostrar y editar usuarios antes de sincronizar.

**Tareas**

- [x] Renderizar Name, Email, Phone y Company Name en tabla adaptable, desplazable y accesible.
- [x] Diferenciar visualmente registros inválidos con estilo atenuado y etiqueta textual, sin depender solo del color.
- [x] Incorporar acción Editar y formulario precargado con validación y preservación de datos ante errores.
- [x] Mostrar estado de envío y resultado del contacto; el endpoint provisional informa `NOT_IMPLEMENTED` sin afirmar éxito.
- [x] Asegurar que el flujo de edición usa el cliente del servicio centralizado de sincronización; la implementación servidor se habilita en Fase 5. En Fase 4 la ruta provisional devuelve `NOT_IMPLEMENTED`; mostrar el fallo real y conservar los cambios del formulario, sin simular éxito.

**Criterio de salida:** tabla y edición cumplen campos, estados y accesibilidad acordados; no se simula una sincronización exitosa antes de integrar Zoho. Aprobación para Fase 5.

**Estado:** completada y aprobada por el usuario en el navegador en `fase-4-tabla-edicion`; typecheck y build pasan. El envío individual recibe el fallo provisional `501 NOT_IMPLEMENTED` hasta Fase 5. La Fase 5 requiere aprobación explícita.

### Fase 5 — Sincronización individual con Zoho

**Objetivo:** crear un contacto en Zoho desde un registro editado usando exclusivamente el canal servidor.

**Tareas**

- [x] Aplicar el mapping de campos y contrato del endpoint Zoho aprobados en Fase 1.
- [x] Implementar adaptador/servicio Zoho en servidor con configuración segura, respuesta validada, timeout y errores saneados.
- [x] Implementar el caso de uso centralizado de sincronización invocado por el flujo individual, con validación server-side y respuesta tipada por registro.
- [x] Aplicar la simulación requerida: si `username` comienza con `C`, devolver fallo simulado y no llamar a Zoho/no guardar ese contacto.
- [x] Rechazar empresas no elegibles en servidor antes de llamar a Zoho; volver a validar en servidor aunque la UI ya clasifique el contacto.
- [x] Conectar “Guardar y Enviar a CRM” y mostrar únicamente resultados confirmados por servidor.
- [x] Documentar pasos manuales de obtención/configuración del token y preparar una colección Postman con placeholders, sin secretos ni tokens reales.

**Criterio de salida:** flujo individual crea en CRM únicamente ante respuesta exitosa de Zoho; el caso simulado falla sin persistir; fallos recuperables conservan la edición. Aprobación para Fase 6.

**Estado:** completada y aceptada por el usuario en `fase-5-sincronizacion-individual`; typecheck/build pasan y el usuario confirmó en el navegador la creación de un contacto en Zoho. Una prueba anterior recibió `ZOHO_REJECTED` porque el usuario ya había registrado previamente esos usuarios; tras actualizar los datos, la sincronización se completó correctamente. No se guarda el identificador del registro en este plan. La Fase 6 requiere aprobación explícita.

### Fase 6 — Sincronización masiva y resultados parciales

**Objetivo:** reutilizar el mismo caso de uso y permitir que el lote continúe ante fallos.

**Tareas**

- [x] Añadir selección solo a registros válidos y acción global “Sincronizar Seleccionados”.
- [x] Reutilizar el mismo servicio/caso de uso de Fase 5; no duplicar el envío en la UI ni crear un segundo camino Zoho.
- [x] Procesar registros con aislamiento de errores por contacto y recopilar resultados confirmados: guardados, fallidos y, cuando aplique, detalle por registro.
- [x] Mostrar resumen final coherente con resultados reales, por ejemplo “Proceso finalizado: 3 guardados, 1 fallido”.
- [x] Procesar el lote secuencialmente, según decisión del usuario: el conjunto es pequeño.
- [x] Asegurar que inválidos no son seleccionables y que el lote sigue tras fallo real o simulado.

**Criterio de salida:** resultados parciales no abortan el lote; contadores corresponden a respuestas del servidor; individual y masivo comparten servicio. Aprobación para Fase 7.

**Estado:** completada y aceptada por el usuario en `fase-6-sincronizacion-masiva`; `npm run typecheck` y `npm run build` pasan con Node 22.21.1. La interfaz local confirma que solo filas válidas tienen checkbox y que la selección habilita/deshabilita la acción. El usuario confirma que los datos ya están en Zoho. La Fase 7 requiere aprobación explícita.

### Fase 7 — Documentación, revisión y entrega

**Objetivo:** preparar el entregable solicitado y su integración revisable.

**Tareas**

- [ ] Completar README con instalación/ejecución, configuración segura, solución CORS y ubicación de la lógica reutilizable.
- [ ] Completar colección Postman o cURL para generar access token usando placeholders, sin secretos ni tokens reales.
- [ ] Revisar el diff y los criterios de aceptación de todas las fases; registrar verificaciones ejecutadas y limitaciones.
- [ ] Preparar Pull Request desde rama de trabajo hacia la rama principal acordada; confirmar repositorio público y compartirlo con `jchonglogoscorp` y `Duboox` solo con autorización específica.
- [ ] No hacer merge ni publicar sin aprobación explícita final.

**Criterio de salida:** entregables documentados, PR revisable y aceptación expresa; integración a principal y compartición completadas solo con autorización correspondiente.

**Estado:** pendiente de Fase 6.

## Registro de pendientes y decisiones

| ID | Pendiente/decisión | Impacto | Responsable | Estado |
|---|---|---|---|---|
| P-01 | Mantener `main` sincronizada con `origin` antes de crear ramas/PRs | Necesario para flujo de ramas/PR | Agente | Resuelto para la inicialización: `main` se publicó en `origin`; comprobar sincronización antes de cada fase |
| P-02 | Definir nombres de variables de entorno Zoho sin valores ni configuración de secretos | Necesario para documentar integración sin exponer credenciales | Agente | Resuelto: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_ACCESS_TOKEN`, `ZOHO_ACCOUNTS_URL`, `ZOHO_API_BASE_URL` |
| P-03 | Contrato de creación de contactos Zoho y mapping de campos | Evita suposiciones de integración | Usuario + agente | Aprobados; diseño documentado en Fase 1. Asociación de cuenta excluida salvo aprobación de alcance adicional |
| P-04 | Sensibilidad a mayúsculas de la regla de empresa | Afecta clasificación | Usuario | Resuelto: comparar sin distinguir mayúsculas |
| P-05 | Concurrencia del lote | Afecta cuotas y resiliencia | Usuario | Resuelto: secuencial; son pocos registros de la API pública |
| P-06 | Hacer disponibles las variables de Zoho al proceso del servidor local antes de usar el flujo real | Sin configuración server-side el endpoint debe responder de forma segura y no puede autenticarse | Usuario | Resuelto: el usuario configuró las variables localmente y confirmó una creación exitosa en Zoho. Los valores no se inspeccionan ni registran. |

## Registro de aprobaciones

| Fase | Alcance presentado | Aprobación | Fecha | Notas |
|---|---|---|---|---|
| Fase 0 | Preparación y aclaraciones | Completada | 2026-10-19 | Usuario confirmó repositorio configurado, convención de ramas, credenciales disponibles, datacenter/URLs, React/Vite/TypeScript estricto, uso local y aprobación por un desarrollador. `main` fue publicada con documentación y la plantilla de entorno sin secretos. |
| Fase 1 | Diseño técnico | Completada | 2026-10-19 | Diseño, DTO, mapping, seguridad, variables de entorno de ejemplo y estados documentados y publicados. No se generó código de producto. La Fase 2 requiere aprobación explícita. |
| Fase 2 | Esqueleto seguro | Aceptada por el usuario | 2026-10-19 | Rama `fase-2-esqueleto-seguro`; usuario confirma Node 22 con nvm y funcionamiento de endpoints. Typecheck/build completados. Commit local `e4f9119`; `POST /api/contacts/sync` sigue en 501 hasta Fase 5. |
| Fase 3 | Ingesta y transformación | Aceptada por el usuario | 2026-10-19 | Aprobación de inicio: “agrega commits para iniciar la fase 3”; aceptación: “Fase 3 aprobada y aceptada”. Rama `fase-3-ingesta-normalizacion`, basada en `origin/main` e incluye el commit local de Fase 2. Typecheck/build pasan; smoke HTTP de `/api/users` pendiente por ocupación del puerto 8787. Fase 4 aún requiere aprobación explícita. |
| Fase 4 | Tabla y edición | Aceptada por el usuario | 2026-10-19 | Inicio aprobado: “ya hice push inicia fase 4”; aceptación: “aprobada fase 4 en el navegador”. Rama `fase-4-tabla-edicion`, creada desde `origin/main` después de sincronizar el push de Fase 3. Typecheck/build pasan; el envío individual sigue en `501` hasta Fase 5. |
| Fase 5 | Sincronización individual | Aceptada por el usuario | 2026-10-19 | Inicio aprobado: “ya agregue las variables de entorno, puedes iniciar la fase 5”. Aceptación: usuario confirma creación correcta en Zoho desde el navegador después de actualizar contactos previamente existentes. Rama `fase-5-sincronizacion-individual`; typecheck/build pasan. Configuración sensible local, fuera de Git. |
| Fase 6 | Sincronización masiva y resultados parciales | Aceptada por el usuario | 2026-10-19 | Inicio aprobado: “ya hice commit y push, inicia la fase 6”. Aceptación explícita: “fase 6 aprobada, ya los datos estan en zoho”. Rama `fase-6-sincronizacion-masiva`, creada desde `origin/main` en `7ca1a70`. Typecheck/build pasan con Node 22.21.1; la UI se verificó sin envío durante las comprobaciones del agente. |
| Fase 7 | Entrega | Pendiente | — | — |
