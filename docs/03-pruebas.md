# 4. Validación del Servicio (Pruebas de Software)

Las pruebas se ejecutan de dos formas complementarias:

1. **Automatizadas** con JUnit 5 + MockMvc sobre la aplicación completa (seguridad, BD H2 y migraciones Flyway reales): `cd backend && mvn test`. Archivos: `SeguridadIntegrationTest.java` (26 casos), `MejorasIntegrationTest.java` (6 casos), `RateLimitIntegrationTest.java` (1 caso), `PasswordPolicyTest.java` (14 casos) y la prueba unitaria con Mockito `AdminServiceMockitoTest.java` (3 casos, sin BD): 50 en total.
2. **Manuales/de API** con Postman: `postman/MatematicaSinEstres-APF2.postman_collection.json` (42 peticiones con aserciones). Se ejecuta con el *Collection Runner* contra el entorno local o el de producción.

> Columna **Resultado obtenido**: completar con la ejecución real (captura de `mvn test` y del Runner de Postman) para adjuntarla como evidencia.

## 4.1 Matriz de pruebas funcionales

| ID | Requerimiento | Caso de prueba | Datos de entrada | Resultado esperado | Automatizada en | Resultado obtenido |
|----|---------------|----------------|------------------|--------------------|-----------------|--------------------|
| BD-01 | Datos iniciales | Existe el administrador Bryan Díaz | Seed V2 | Rol ADMIN, hash `$2a$12$` de 60 caracteres | JUnit | |
| BD-02 | Catálogo desde BD | Listar niveles y horarios | `GET /api/public/niveles`, `/horarios` | 200, 3 niveles con 4 características, 3 horarios | JUnit · Postman 01 | |
| AUT-01 | Iniciar sesión | Credenciales correctas | usuario + contraseña válidos | 200, `tipo=Bearer`, JWT de 3 partes, sin hash | JUnit · Postman 02 | |
| AUT-02 | Iniciar sesión | Contraseña incorrecta | contraseña errónea | 401 "Usuario o contraseña incorrectos." | JUnit · Postman 02 | |
| AUT-03 | Iniciar sesión | Usuario inexistente | `no.existe` | 401 con el mismo mensaje | JUnit · Postman 02 | |
| AUT-04 | Bloqueo | 5 intentos fallidos | 5 contraseñas erróneas y luego la correcta | 401 ×4, luego 423 y 423 | JUnit | |
| AUT-05 | Validación | Login sin datos | `{}` | 400 con detalle de campos | JUnit · Postman 02 | |
| CRED-01 | Registro | Contraseña débil | `123456` | 400 con ≥ 4 reglas incumplidas | JUnit · Postman 02 | |
| CRED-02 | Registro | Contraseña con datos personales | `Lrojas#9kQ!mZ` para usuario `lrojas` | 400 "No puede contener tu nombre, usuario o correo." | JUnit · Postman 02 | |
| CRED-03 | Registro | Registro válido | contraseña robusta | 201, rol ALUMNO; en BD solo hash BCrypt que valida con `matches` | JUnit · Postman 02 | |
| CRED-04 | Registro | Usuario duplicado | `bryandiaz` | 409 | JUnit · Postman 02 | |
| MAT-01 | Matrícula | Alumno solicita matrícula | nivel + horario | 201 con estado PENDIENTE | Manual (Aula Virtual) | |
| MAT-02 | Matrícula | Admin activa matrícula | `PATCH /api/admin/matriculas/{id}` `ACTIVA` | 200, fechas de vigencia asignadas | Manual (Panel admin) | |
| CLA-01 | Clases | Alumno lista clases de su nivel | token alumno Secundaria | 200, todas `SECUNDARIA` | JUnit · Postman 04 | |
| CLA-02 | Clases | CRUD de clase por admin | crear, editar, eliminar | 201, 200, 204 y luego 404 | Postman 05 | |
| SOL-01 | Diagnóstico | Solicitud pública válida | nombre + celular 9XXXXXXXX | 201 | JUnit · Postman 01 | |
| VEN-01 | Vencimiento | Matrícula ACTIVA con fecha de fin pasada | token del alumno | Sin clases (lista vacía) y 403 al abrir una | JUnit | |
| VEN-02 | Vencimiento | Tarea diaria de vencimiento | matrícula expirada y otra vigente | Expirada → VENCIDA; vigente sigue ACTIVA | JUnit | |
| VEN-03 | Vencimiento | Renovar matrícula vencida | `PATCH estado=ACTIVA` | Vigencia de un mes desde hoy | JUnit | |
| PWD-01 | Contraseñas | Restablecimiento por el admin | `PATCH /restablecer-password` | Temporal válida; 403 hasta cambiarla; luego 200 | JUnit | |
| PWD-02 | Contraseñas | Restablecer sin permiso / a sí mismo | token alumno / admin propio | 403 / 400 | JUnit | |
| EST-01 | Catálogo | Estadísticas públicas | `GET /api/public/estadisticas` | 200 con cifras de la BD | JUnit · Postman 01 | |

## 4.2 Matriz de pruebas no funcionales (seguridad y calidad)

| ID | Atributo | Caso de prueba | Resultado esperado | Automatizada en | Resultado obtenido |
|----|----------|----------------|--------------------|-----------------|--------------------|
| JWT-01 | Autenticación | Recurso protegido sin token | 401 | JUnit · Postman 03 | |
| JWT-02 | Integridad del token | Firma alterada | 401 "Token inválido, alterado o expirado." | JUnit · Postman 03 | |
| JWT-03 | Integridad del token | Token sin firma `alg: none` con rol ADMIN falsificado | 401 | JUnit · Postman 03 | |
| JWT-04 | Autenticación | Token válido | 200 en `/api/auth/me` | JUnit · Postman 02 | |
| BAC-01 | Control de acceso | ALUMNO llama a `/api/admin/**` | 403 | JUnit · Postman 04 | |
| BAC-02 | Control de acceso | ADMIN llama a `/api/admin/usuarios` | 200, sin `passwordHash` | JUnit · Postman 04 | |
| BAC-03 | Control de acceso (IDOR) | Alumno de Secundaria abre clase de Primaria | 403 | JUnit · Postman 04 | |
| HTTP-01 | Manejo de errores | Clase inexistente / ID no numérico | 404 / 400 | JUnit · Postman 04 | |
| HTTP-02 | Manejo de errores | Método no soportado | 405 | Postman 01 | |
| SQLI-01 | Inyección SQL | `' OR '1'='1' --` en login | 401, sin token | JUnit · Postman 02 | |
| SQLI-02 | Inyección SQL | `' OR 1=1 --` en búsqueda | 200 con lista vacía; tabla intacta | JUnit · Postman 04 | |
| XSS-01 | XSS | `<script>` en formulario público | 400 | JUnit · Postman 01 | |
| XSS-02 | XSS | URL `javascript:` en clase | 400 | JUnit · Postman 05 | |
| SEG-01 | Exposición de datos | Clases recientes públicas | Sin `urlVideo` | JUnit · Postman 01 | |
| RL-01 | Disponibilidad / fuerza bruta | 4.º login en un minuto con límite 3 | 429 + Retry-After | JUnit | |
| SEG-02 | Configuración segura | Cabeceras HTTP | `X-Frame-Options: DENY`, `nosniff`, CSP | JUnit | |
| USA-01 | Usabilidad | Indicador de fortaleza en registro | Lista de reglas en tiempo real; botón deshabilitado hasta cumplirlas | Manual | |
| POR-01 | Portabilidad | Migraciones en PostgreSQL 16 y H2 | Esquema y seed creados sin errores | Verificado en PostgreSQL 16 · JUnit (H2) | |
| DIS-01 | Disponibilidad | Health check | `GET /api/public/health` → 200 `{"estado":"UP"}` | Postman 01 · Render | |

## 4.3 Códigos de estado HTTP cubiertos

| Código | Significado en la API | Ejemplo |
|--------|-----------------------|---------|
| 200 | Operación correcta | Login, listados, actualización |
| 201 | Recurso creado | Registro, matrícula, clase, solicitud |
| 204 | Eliminado sin contenido | `DELETE /api/admin/clases/{id}` |
| 400 | Datos inválidos | Contraseña débil, XSS, ID no numérico |
| 401 | No autenticado | Sin token, token alterado, credenciales erróneas |
| 403 | Sin permiso | Alumno en panel admin, clase de otro nivel, cuenta desactivada |
| 404 | No existe | Clase o matrícula inexistente |
| 405 | Método no permitido | `PATCH /api/public/niveles` |
| 409 | Conflicto | Usuario duplicado, matrícula repetida |
| 429 | Demasiadas peticiones | Más de 10 intentos de login por minuto desde la misma IP |
| 423 | Cuenta bloqueada | 5 intentos fallidos |

## 4.4 Cómo obtener las evidencias

1. `cd backend && mvn test` → captura del resumen `Tests run: 50, Failures: 0`.
2. Postman → *Import* la colección y el entorno → en el entorno completar `adminPassword` y `alumnoPassword` → *Run collection* → captura del resumen del Runner.
3. Capturas individuales sugeridas: login 200 con token, alumno en `/api/admin/usuarios` 403, token alterado 401, clase de otro nivel 403, inyección SQL 401, `<script>` 400.
