# Dependencias de terceros — P.A.R.C.E

> Generado a partir de `composer.lock` y de los campos `license` reales de los paquetes instalados en `node_modules/` (no de memoria ni de suposición). No se reproduce el texto legal completo de ninguna licencia — solo su identificador SPDX y el paquete al que corresponde. Para el texto completo de cada licencia, consultar el paquete correspondiente en su repositorio oficial.

## Backend (PHP / Composer)

**Dependencias de producción: ninguna.** `composer.json` no declara ningún paquete `require` de producción — el backend es PHP puro sin librerías externas en tiempo de ejecución.

**Dependencias de desarrollo** (`require-dev`, no se despliegan a producción):

| Paquete | Versión | Licencia |
|---|---|---|
| phpunit/phpunit | 10.5.64 | BSD-3-Clause |
| phpunit/php-code-coverage | 10.1.16 | BSD-3-Clause |
| phpunit/php-file-iterator | 4.1.0 | BSD-3-Clause |
| phpunit/php-invoker | 4.0.0 | BSD-3-Clause |
| phpunit/php-text-template | 3.0.1 | BSD-3-Clause |
| phpunit/php-timer | 6.0.0 | BSD-3-Clause |
| myclabs/deep-copy | 1.13.4 | MIT |
| nikic/php-parser | 5.8.0 | BSD-3-Clause |
| phar-io/manifest | 2.0.4 | BSD-3-Clause |
| phar-io/version | 3.2.1 | BSD-3-Clause |
| theseer/tokenizer | 1.3.1 | BSD-3-Clause |
| sebastian/* (14 paquetes de utilidades internas de PHPUnit) | varias | BSD-3-Clause |

## Frontend (npm)

| Paquete | Versión instalada | Licencia | Uso |
|---|---|---|---|
| react | 18.3.1 | MIT | Producción |
| react-dom | 18.3.1 | MIT | Producción |
| react-router-dom | 6.30.4 | MIT | Producción |
| vite | 5.4.21 | MIT | Build (dev) |
| typescript | 5.9.3 | Apache-2.0 | Build (dev) |
| tailwindcss | 3.4.19 | MIT | Build (dev) |
| eslint | 8.57.1 | MIT | Lint (dev) |
| postcss | 8.5.15 | MIT | Build (dev) |
| autoprefixer | 10.5.0 | MIT | Build (dev) |

`package.json` no declara ninguna otra dependencia de producción más allá de `react`, `react-dom` y `react-router-dom`. El resto de `devDependencies` (`@types/*`, `@typescript-eslint/*`, `@vitejs/plugin-react`, `eslint-plugin-*`) son herramientas de desarrollo estándar del ecosistema React/Vite, todas bajo licencias permisivas (MIT) del mismo tipo que las listadas arriba — no se listan una por una por ser transitivas de tooling, no de producto.

## Servicios externos (no son dependencias de código, son servicios de terceros)

| Servicio | Uso en P.A.R.C.E | Notas |
|---|---|---|
| [Resend](https://resend.com) | Envío de emails transaccionales (recuperación de contraseña) vía su API HTTP, sin SDK — ver `app/Infrastructure/Mail/MailerService.php` | Sujeto a los términos de servicio y política de privacidad propios de Resend; los correos electrónicos de usuarios se transmiten a ese servicio para el envío |

## Licencia del propio proyecto P.A.R.C.E

**No declarada.** `composer.json` no incluye el campo `license` (`composer validate` lo señala como advertencia) y no existe un archivo `LICENSE` en la raíz del repositorio. Esta es una decisión de producto pendiente, no una omisión técnica — ver `docs/roadmap/PARCE_ROADMAP_AS_BUILT.md`.
