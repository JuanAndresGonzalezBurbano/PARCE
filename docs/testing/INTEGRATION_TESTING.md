# P.A.R.C.E — Tests de integración (`tests/Integration/`)

> Documento generado a partir del código real: `phpunit.integration.xml`, `tests/Integration/bootstrap.php`, `tests/Integration/IntegrationTestCase.php`, `tests/Integration/MechanicApplicationFlowTest.php`, `tests/Integration/scripts/concurrent_approve_probe.php`, `composer.json`, `phpunit.xml` y `.github/workflows/ci.yml`. No describe nada que no esté respaldado por estos archivos.

---

## 1. Qué es esta suite y por qué existe

`MechanicApplicationService` (el flujo de solicitud + aprobación del rol `mechanic`) tiene lógica de negocio real que no puede probarse honestamente con mocks: transacciones, `SELECT ... FOR UPDATE`, condiciones de carrera, e `INSERT`/`UPDATE` efectivos sobre `admin_access_requests` y `user_roles`. En vez de fabricar cobertura falsa con una base de datos simulada, esta suite ejercita las clases reales (`MechanicApplicationService`, `AuthService`, `RBACMiddleware`) contra una base de datos MySQL real y aislada.

Es una suite **separada y opt-in** de la suite unitaria normal (`tests/Unit/`, ejecutada por `composer test`) — ver §5 y §6.

---

## 2. Requisitos para ejecutar la suite

- PHP 8.2+ con extensión `pdo_mysql` (mismos requisitos que el resto del proyecto).
- Un servidor MySQL accesible en `127.0.0.1:3306` con el usuario `root` sin contraseña — las credenciales por defecto de una instalación local de XAMPP (`tests/Integration/bootstrap.php`, líneas 27-34).
- Una base de datos **`parce_test`** ya creada y con las 17 migraciones de `database/migrations/` aplicadas (ver §3 para el caso particular de la migración `2026_07_10_000015`, §11).
- Dependencias de Composer instaladas (`vendor/autoload.php`, mismo autoload que el resto del proyecto — `tests/Integration/bootstrap.php` línea 21).

No existe en el repositorio ningún script que cree o migre `parce_test` automáticamente — debe crearse y migrarse manualmente antes de ejecutar la suite (por ejemplo, creando la base de datos y apuntando la configuración de migración a `parce_test` en vez de a `parce`, o ejecutando el mecanismo de migraciones del proyecto contra esa base de datos).

---

## 3. Base de datos aislada `parce_test`

`tests/Integration/bootstrap.php` fija la configuración de conexión de forma **hardcodeada**, nunca leída desde `.env`:

```php
const INTEGRATION_TEST_DATABASE = 'parce_test';

Database::setConfig([
    'driver'   => 'mysql',
    'host'     => '127.0.0.1',
    'port'     => 3306,
    'database' => INTEGRATION_TEST_DATABASE,
    'username' => 'root',
    'password' => '',
    'charset'  => 'utf8mb4',
]);
```

Esto es deliberado: al no depender de `.env`, no existe ninguna combinación de variables de entorno mal configuradas que pueda hacer que la suite termine apuntando, por accidente, a la base de datos real de desarrollo (`parce`).

## 4. Salvaguarda contra apuntar a `parce`

Inmediatamente después de fijar la configuración, `bootstrap.php` verifica la propia constante que acaba de usar:

```php
if (INTEGRATION_TEST_DATABASE === 'parce') {
    fwrite(STDERR, "REFUSING TO RUN: la suite de integración no puede apuntar a la base de datos 'parce'.\n");
    exit(1);
}
```

Si alguna vez se editara `INTEGRATION_TEST_DATABASE` a `'parce'` por error, el bootstrap aborta con `exit(1)` antes de que cualquier test llegue a ejecutar una sola consulta. Es una guarda de "cinturón y tirantes": la única forma de que la suite corra contra `parce` sería cambiar simultáneamente el valor de esta constante en dos lugares del mismo archivo de forma contradictoria, lo cual el propio código impide.

**Advertencia explícita:** esta suite trunca tablas completas entre cada test (ver §8). **Nunca debe ejecutarse contra la base de datos real `parce`.** La salvaguarda de `bootstrap.php` cubre el caso de que la constante se edite por error, pero no protege contra apuntar deliberadamente esta configuración a otra base de datos con ese mismo nombre — quien ejecute esta suite es responsable de que `parce_test` sea siempre una base de datos de pruebas desechable, nunca un alias ni una copia de la real.

---

## 5. Comando exacto de ejecución

```bash
vendor/bin/phpunit -c phpunit.integration.xml --no-coverage
```

`phpunit.integration.xml` define explícitamente:
- `bootstrap="tests/Integration/bootstrap.php"` (en vez del `vendor/autoload.php` plano que usa `phpunit.xml`).
- `cacheDirectory=".phpunit.cache/integration"` (caché separada de la suite unitaria).
- `testsuite name="Integration"` sobre el directorio `tests/Integration`, **excluyendo explícitamente** `tests/Integration/scripts` (`<exclude>tests/Integration/scripts</exclude>`) — por eso `concurrent_approve_probe.php` no se ejecuta como un test de PHPUnit (ver §10).

## 6. Diferencia frente a `composer test`

`composer.json` define:

```json
"scripts": { "test": "phpunit" }
```

Sin argumentos, `phpunit` usa la configuración por defecto del proyecto, `phpunit.xml`, que:
- Usa `bootstrap="vendor/autoload.php"` (sin la conexión a `parce_test` de `tests/Integration/bootstrap.php`).
- Define únicamente la suite `testsuite name="Unit"` sobre `tests/Unit`.

Es decir, **`composer test` nunca ejecuta `tests/Integration/`** — son dos configuraciones y dos bootstraps completamente separados. Ejecutar la suite de integración requiere siempre invocar `vendor/bin/phpunit` apuntando explícitamente a `phpunit.integration.xml`, como en §5.

## 7. Por qué es opt-in y no está conectada a CI

`.github/workflows/ci.yml` tiene dos jobs, `backend` y `frontend`. El job `backend` instala dependencias con Composer y ejecuta únicamente `composer test` — no hay ningún paso que instale o levante MySQL, ni ninguna referencia a `phpunit.integration.xml` o a `tests/Integration` en todo el archivo.

Esto es una decisión deliberada, no un olvido: la suite de integración requiere una base de datos MySQL real, aislada y ya migrada (`parce_test`), algo que el pipeline de CI actual no aprovisiona. Conectarla a CI sin antes añadir un servicio de MySQL al workflow haría fallar el pipeline en cada ejecución. Hasta que eso se decida y se implemente, la suite permanece como una herramienta de verificación manual para quien la ejecute localmente con una instancia de MySQL disponible (p. ej. XAMPP).

### 7.1 Qué se necesitaría para agregarla a CI (análisis de viabilidad, no implementado)

Revisado el `.github/workflows/ci.yml` actual (2026-08-19): sigue siendo exactamente lo que era al inicio de esta serie de sesiones — el job `backend` solo corre `composer install` + `composer test`, el job `frontend` solo `npm ci` + `npm run build`. No se agregó `npm run lint` ni ninguna otra verificación en ningún punto de este trabajo.

Técnicamente es viable agregar los 32 tests de integración a CI, pero requiere varias piezas nuevas, ninguna trivial:

1. **Un servicio de MySQL en el job `backend`** — bloque `services:` de GitHub Actions (p. ej. `mysql:8.0` o `mariadb`), con `MYSQL_ROOT_PASSWORD`/`MYSQL_DATABASE` en su `env:`, mapeo de puerto `3306:3306`, y una condición de salud (`--health-cmd`) para que el job espere a que MySQL esté realmente listo antes de continuar — GitHub Actions no lo garantiza solo por declarar el servicio.
2. **Migrar `parce_test` desde cero en cada corrida** — un paso nuevo que ejecute las 17 migraciones contra el servicio de MySQL recién levantado. Esto choca directamente con ADR-14 (`docs/architecture/DECISIONS.md`): una BD verdaderamente fresca colisiona en la migración `2026_07_10_000015`, así que este paso de CI necesitaría replicar el mismo workaround (insertar el marcador en la tabla `migrations` antes de correr `migrate`), no solo invocar `migrate` a secas.
3. **Credenciales coherentes con `tests/Integration/bootstrap.php`** — ese archivo tiene la configuración de conexión *hardcodeada* (`root`, sin contraseña, `127.0.0.1:3306`) a propósito, para no depender de `.env` (ver §3). Para que funcione en CI sin tocar ese archivo, el servicio de MySQL tendría que configurarse con esas mismas credenciales exactas (`MYSQL_ROOT_PASSWORD` vacío/sin usar) — o, alternativamente, `bootstrap.php` tendría que generalizarse para leer la config de variables de entorno de CI, lo cual sería un cambio de código, no solo de configuración de workflow.
4. **Un paso nuevo que corra `vendor/bin/phpunit -c phpunit.integration.xml --no-coverage`**, después de que la BD esté migrada — separado del `composer test` existente (que usa `phpunit.xml`, sin la suite de integración).
5. **Fuera de alcance de "agregar la suite a CI" pero relacionado:** la prueba real de concurrencia (`tests/Integration/scripts/concurrent_approve_probe.php`, §10) no es parte de la suite de PHPUnit — está explícitamente excluida (`<exclude>tests/Integration/scripts</exclude>`) y hoy se invoca manualmente dos veces en paralelo. Automatizarla en CI necesitaría un script de orquestación nuevo (lanzar los dos procesos, comparar sus salidas) que no existe en el repositorio hoy.

Ninguno de estos puntos se implementó en esta sesión — es un análisis de qué se necesitaría, no una implementación ni una estimación de tiempo. **Decisión consciente, no omisión silenciosa:** dado el alcance de esta entrega (antes de la sustentación), se prioriza mantener la suite de integración como herramienta de verificación manual local — ya documentada y reproducible (§2-§5) — sobre invertir el esfuerzo de las 4 piezas nuevas de infraestructura de CI listadas arriba. Si en el futuro se decide conectarla, esta sección es el punto de partida técnico.

---

## 8. Fixtures y limpieza entre tests

`tests/Integration/IntegrationTestCase.php` es la clase base de la que hereda `MechanicApplicationFlowTest`.

**Antes de toda la clase** (`setUpBeforeClass()`): resuelve y cachea los IDs reales de los roles `mechanic`, `administrator` y `customer` desde la tabla `roles` de `parce_test`.

**Antes de cada test** (`setUp()`): trunca por completo las tablas `admin_access_requests`, `user_roles`, `sessions`, `password_reset_tokens` y `users` (con `SET FOREIGN_KEY_CHECKS=0` alrededor, para poder truncar en cualquier orden sin violar las FKs, y `SET FOREIGN_KEY_CHECKS=1` al terminar). La tabla `roles` **nunca se trunca** — es un catálogo sembrado una sola vez por la migración inicial, no un dato mutable del test. Esto garantiza que cada test parte de un estado limpio y es independiente de los demás.

**Helpers de fixtures reales** (no mocks — cada uno hace un `INSERT`/`UPDATE` real contra `parce_test`):
- `createUser(array $overrides = [])` — inserta un usuario con email aleatorio (`user_<hex>@test.local`), password hasheado con Argon2id, `account_status='active'` por defecto.
- `assignRole(int $userId, string $roleSlug)` — inserta directamente en `user_roles` (bypass deliberado del flujo bajo prueba, usado solo para dejar el estado inicial listo, p. ej. crear un administrador de fixture).
- `setLicense(int $userId, ?string $expirationOffset = '+1 year', bool $complete = true)` — fija o borra los campos de licencia de conducción del usuario (`driver_license_number`, `_expiration_date`, `_document_url`).
- `createPendingApplication(int $userId, string $justification = ...)` — inserta directamente una fila `pending` en `admin_access_requests`, saltándose `MechanicApplicationService::create()` cuando el test solo necesita una solicitud ya existente como punto de partida.
- `hasRole()` / `countRoleAssignments()` — consultas de verificación sobre `user_roles`.

**Helper de aserciones:** `assertDomainException(int $expectedStatusCode, callable $fn)` — ejecuta `$fn` esperando una `DomainException` y compara contra `$e->getStatusCode()` (el código HTTP real que usa el resto de la aplicación), no contra `Exception::getCode()` de PHPUnit (`expectExceptionCode()`), que en este proyecto siempre vale `0` porque ningún `throw` pasa el tercer argumento del constructor de `DomainException`.

---

## 9. Cobertura de `MechanicApplicationFlowTest`

32 tests, organizados en 6 bloques (comentarios `// N. ...` en el propio archivo):

1. **Registro** — `testRegisterAssignsOnlyCustomerRoleAndNeverMechanic`: `AuthService::register()` real (sin parámetro de rol) siempre asigna `customer`, nunca `mechanic`.
2. **Creación de solicitud** (8 tests) — éxito con licencia completa y vigente; fallo con licencia incompleta (400) o vencida (400); fallo si la cuenta no está activa (403); fallo si el usuario ya tiene `mechanic` (409); fallo si el usuario es `administrator` (403) o `super_admin` (403) — verificando además que no se creó ninguna fila en `admin_access_requests` ni se tocó `user_roles`; fallo si ya existe una solicitud propia `pending` (409); `requested_role_id` siempre corresponde al rol `mechanic` real.
3. **Ownership / IDOR** (3 tests) — un usuario no puede ver ni cancelar la solicitud de otro (404, no 403); el mensaje/código de error para un ID inexistente es idéntico al de un ID ajeno (anti-enumeración).
4. **Cancelación** (4 tests) — transición `pending→cancelled`; falla (409) si la solicitud ya está `approved`, `rejected` o `cancelled`.
5. **Aprobación** (8 tests) — administrator y super_admin pueden aprobar (asigna `mechanic`); un `customer` o un `mechanic` no pueden acceder a la ruta de aprobación vía `RBACMiddleware` (403, probado instanciando el middleware directamente); un solicitante no puede aprobar su propia solicitud (403, anti-autoaprobación); la aprobación falla (400) si el usuario se suspendió o su licencia venció **después** de aplicar pero **antes** de la revisión; una aprobación exitosa crea exactamente una fila en `user_roles` con `assigned_by`/`reviewed_by`/`approved_by` iguales al admin autenticado y `reviewed_at`/`approved_at` no nulos.
6. **Rechazo** (4 tests) — administrator y super_admin pueden rechazar; el motivo se persiste literalmente; `reviewed_by` se fija pero `approved_by`/`approved_at` permanecen `NULL`; el usuario no obtiene el rol `mechanic`.
7. **Integridad final** (3 tests) — no existe el rol `mechanic` mientras la solicitud sigue `pending`, tras un rechazo, ni tras una cancelación.

Todos los tests ejercitan `MechanicApplicationService` directamente (no el stack HTTP/Router completo) más `RBACMiddleware` de forma aislada para las dos comprobaciones de autorización — el enrutamiento y la asignación de middleware por ruta se verifican por separado, por inspección de `config/routes.php`, no en esta suite.

---

## 10. Prueba real de concurrencia

`tests/Integration/scripts/concurrent_approve_probe.php` **no es un test de PHPUnit** — `phpunit.integration.xml` lo excluye explícitamente de la suite (`<exclude>tests/Integration/scripts</exclude>`), así que nunca se ejecuta como parte de `vendor/bin/phpunit -c phpunit.integration.xml`.

Es un script standalone, pensado para lanzarse como **proceso del sistema operativo independiente** (no un hilo, no una simulación dentro del mismo proceso PHPUnit) contra `parce_test`:

```
php tests/Integration/scripts/concurrent_approve_probe.php <applicationId> <adminUserId>
```

Internamente llama a `MechanicApplicationService::approve($applicationId, $adminUserId)` una sola vez y escribe en stdout exactamente una línea: `APPROVED`, `REJECTED:<statusCode>:<mensaje>`, o `ERROR:<clase>:<mensaje>` si ocurre una excepción no esperada.

**Cómo se usa para demostrar exclusión mutua real:** lanzando el mismo comando dos veces en paralelo (dos procesos de PHP distintos) con el **mismo** `applicationId`, contra una solicitud que existe y está `pending` en `parce_test`. El `SELECT ... FOR UPDATE` real de MySQL dentro de `approve()` serializa ambos procesos a nivel de fila: uno de los dos debe imprimir `APPROVED` y el otro debe imprimir `REJECTED:409:...` (la solicitud ya no está `pending` cuando el segundo proceso obtiene el lock). Esto prueba mutua exclusión real de MySQL, no un mock ni una aserción sobre el orden de ejecución dentro de un único proceso.

No hay en el repositorio ningún script que orqueste automáticamente el lanzamiento de los dos procesos y compare sus salidas — la comparación (`APPROVED` en uno, `REJECTED:409` en el otro) se hace observando la salida de ambas invocaciones manuales.

---

## 11. Migración `2026_07_10_000015` sobre una base de datos fresca

`database/migrations/2026_07_10_000015_restore_document_fields_to_vehicles.php` fue creada para **restaurar** en la base de datos real de desarrollo (`parce`) las columnas `soat_*`/`tecnomecanica_*` de `vehicles`, que en algún momento no documentado desaparecieron de esa base viva aunque el código seguía leyéndolas/escribiéndolas (ver el comentario del propio archivo de migración). Esas mismas columnas ya las crea la migración `2026_01_01_000005_add_document_fields_to_vehicles`.

Al migrar **`parce_test`** desde cero (las 17 migraciones en orden, sobre una base de datos que nunca tuvo esas columnas eliminadas), la migración `000005` ya las crea con normalidad. Cuando a continuación se ejecuta la migración `000015`, su `ALTER TABLE ... ADD COLUMN soat_number ...` intenta crear columnas que ya existen, y falla con `SQLSTATE[42S21]: Column already exists` para `soat_number`.

**Workaround aplicado, exclusivamente sobre `parce_test`:** en vez de modificar el archivo de la migración (lo cual la haría divergir de su comportamiento real y documentado contra `parce`), se marcó la migración `2026_07_10_000015_restore_document_fields_to_vehicles` como ya aplicada directamente en la tabla de seguimiento `migrations` de `parce_test` (la misma tabla `migrations(id, migration, batch, created_at)` que gestiona `App\Core\MigrationRunner`, con `UNIQUE KEY` sobre `migration`), sin ejecutar su `up()`. Su efecto (las 8 columnas SOAT/Tecnomecánica) ya estaba satisfecho por la migración `000005`, así que el estado final del esquema de `parce_test` es idéntico al que tendría si la migración `000015` se hubiera podido ejecutar sin colisión.

**Esto es deuda técnica preexistente**, no introducida ni resuelta por el flujo de solicitud de mecánico — está documentada también en `docs/roadmap/PARCE_ROADMAP_AS_BUILT.md` (sección de deuda técnica) y en `docs/architecture/PARCE_AS_BUILT_ARCHITECTURE.md` (§1.16.2). No se modificó el archivo de la migración para "hacer pasar" los tests — la colisión es real y reproducible sobre cualquier base de datos verdaderamente fresca, y su causa raíz (qué migración es la fuente de verdad real: `000005` o `000015`) queda pendiente de una decisión arquitectónica fuera del alcance de esta suite.

---

## 12. Resumen de comandos

| Acción | Comando |
|---|---|
| Suite unitaria normal (la que corre CI) | `composer test` |
| Suite de integración (manual, requiere MySQL local con `parce_test` migrada) | `vendor/bin/phpunit -c phpunit.integration.xml --no-coverage` |
| Prueba de concurrencia (manual, dos procesos en paralelo) | `php tests/Integration/scripts/concurrent_approve_probe.php <applicationId> <adminUserId>` (ejecutado dos veces, en paralelo, con el mismo `applicationId`) |

**Nunca** ejecutar los dos últimos contra la base de datos real `parce` — ver §4.
