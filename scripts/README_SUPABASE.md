# Configuración de Supabase para el proyecto

## 1. Dónde se conecta la app

La app usa **Supabase** como backend. Se conecta con estas variables de entorno (en `.env.local`):

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto (ej: `https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima pública del proyecto |
| `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` | (Opcional) URL de redirección tras confirmar email |

Sin estas variables, la app no puede conectar con ninguna base de datos. Si no tienes proyecto en Supabase, la base de datos no existe hasta que la crees y ejecutes los scripts.

---

## 2. Crear proyecto y base de datos en Supabase

1. Entra en [supabase.com](https://supabase.com) e inicia sesión.
2. Crea un **nuevo proyecto** (nombre y contraseña de base de datos).
3. En el proyecto: **Settings → API**. Ahí verás:
   - **Project URL** → copia a `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** (clave pública) → copia a `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Crea en la raíz del proyecto el archivo `.env.local` (o copia desde `.env.example`) y pega esos valores.

---

## 3. Ejecutar los scripts SQL en orden

En el panel de Supabase: **SQL Editor → New query**. Ejecuta **cada script en este orden** (uno por uno):

1. **001_create_tables.sql** – Buckets de Storage, tablas (`hermandades`, `profiles`, `procesiones`, `marchas`, `puntos_ruta`) e índices.
2. **002_rls_policies.sql** – Políticas RLS (permisos por tabla).
3. **003_realtime_and_triggers.sql** – Realtime para `procesiones` y triggers de `updated_at`.
4. **004_handle_new_user.sql** – Trigger para crear un perfil en `profiles` cuando alguien se registra.

Si ya tenías la base creada antes de que se añadieran `estado` y `descripcion` a `procesiones`, ejecuta además:

5. **005_add_estado_descripcion.sql** – Añade las columnas `estado` y `descripcion` a la tabla `procesiones`.
6. **006_add_turno_to_marchas.sql** – Añade la columna `turno` en `marchas` y rellena datos existentes.

Si algún script da error (por ejemplo “relation already exists”), puedes ignorar ese paso si ya lo habías ejecutado antes.

---

## 4. Crear el primer SuperAdmin

Tras ejecutar los scripts, no hay usuarios. Opciones:

**A) Desde la app (recomendado si ya tienes Auth activo)**  
1. Regístrate en `/auth/registro`.  
2. En Supabase: **Table Editor → `profiles`**.  
3. Localiza tu usuario y cambia `role` a `superadmin`.  
Así podrás entrar en `/admin` y crear hermandades y más usuarios.

**B) Solo SQL**  
En SQL Editor puedes insertar un usuario en `auth.users` y su fila en `profiles` (más avanzado; normalmente se usa el registro desde la app y luego se cambia el rol como arriba).

---

## 5. Resumen de tablas que usa la app

| Tabla | Uso |
|-------|-----|
| `hermandades` | Hermandades (nombre, escudo). |
| `profiles` | Usuarios y roles (`superadmin` / `encargado`) y relación con hermandad. |
| `procesiones` | Procesiones (hermandad, nombre, fecha, turnos, ubicación, etc.). |
| `marchas` | Sones/alabados por procesión (nombre, autor, orden, turno). |
| `puntos_ruta` | Puntos de la ruta por procesión (dirección, lat/lng, tipo ida/regreso). |

Storage: buckets `escudos` y `avatares` para imágenes.

Cuando todo esté configurado, podrás probar login, formularios y flujos desde la app.

---

## 6. Resumen de formularios y campos

Para conectar y probar, aquí tienes qué usa cada formulario y a qué tabla/API se envía.

### Auth

| Formulario | Ruta | Campos | Destino |
|------------|------|--------|---------|
| **Login** | `/auth/login` | `email`, `password` | Supabase Auth `signInWithPassword`; luego redirige según `profiles.role` (superadmin → `/admin`, encargado → `/encargado`). |
| **Registro** | `/auth/registro` | `nombre` (nombre completo), `email`, `password`, `repeatPassword` | Supabase Auth `signUp`; metadata: `nombre_completo`, `rol: 'encargado'`. El trigger `004_handle_new_user.sql` crea la fila en `profiles` con ese rol. |

### Admin

| Formulario | Ruta | Campos | Tabla / recurso |
|------------|------|--------|------------------|
| **Hermandad (crear/editar)** | `/admin/hermandades/nueva`, `/admin/hermandades/[id]` | `nombre` (obligatorio), `escudo` (imagen, opcional) | Tabla `hermandades`; imagen en Storage bucket `escudos`. |
| **Usuario (crear)** | `/admin/usuarios/nuevo` | `email`, `password`, `role` (superadmin/encargado), `hermandad` (si role = encargado) | Auth `signUp` + fila en `profiles` con `role` y `hermandad_id`. |
| **Usuario (editar)** | `/admin/usuarios/[id]` | `role`, `hermandad` (si encargado) | Tabla `profiles` (update). |

### Encargado

| Formulario | Ruta | Campos | Tabla / recurso |
|------------|------|--------|------------------|
| **Procesión (crear/editar)** | `/encargado/procesiones/nueva`, `/encargado/procesiones/[id]` | `hermandad_id` (solo si superadmin), `nombre`, `fecha` | Tabla `procesiones` (`nombre`, `fecha`, `hermandad_id`, `total_turnos: 1`). |
| **Sones y alabados** | En página de detalle de procesión | Añadir uno o varios nombres (uno por línea), `autor` (opcional), `turno inicial`. | Tabla `marchas` (`procesion_id`, `nombre`, `autor`, `orden`, `turno`). |
| **Puntos de ruta** | En página de detalle de procesión | Añadir: `direccion`, `tipo` (ida/regreso), `lat`, `lng`. Opción “Usar mi ubicación”. | Tabla `puntos_ruta` (`procesion_id`, `direccion`, `tipo`, `lat`, `lng`, `orden`). |

### Cómo probar todo

1. **Variables de entorno**: Copia `.env.example` a `.env.local` y rellena `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` con los datos de tu proyecto en Supabase.
2. **Base de datos**: Ejecuta en el SQL Editor de Supabase, en orden: `001_create_tables.sql` → `002_rls_policies.sql` → `003_realtime_and_triggers.sql` → `004_handle_new_user.sql`.
3. **Primer usuario admin**: Regístrate en `/auth/registro`, luego en Supabase (Table Editor → `profiles`) cambia tu usuario a `role = superadmin`.
4. **Flujo**: Inicia sesión en `/auth/login` → entra en `/admin` → crea una hermandad → crea un usuario encargado (o asígnate hermandad si eres encargado) → en `/encargado` crea una procesión, añade marchas y puntos de ruta, y prueba el seguimiento en vivo si lo usas.
