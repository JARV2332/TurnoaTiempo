# Turno a Tiempo — App de control (Android)

APK de uso personal para **login + panel de control en vivo** (sin Play Store).

Carga la web de producción: `https://turnoatiempo.com` con `?app=control`.

## Requisitos

- [Node.js](https://nodejs.org/) 20+
- [Android Studio](https://developer.android.com/studio) con Android SDK
- Variable de entorno `ANDROID_HOME` (Android Studio suele configurarla)

## Instalar dependencias

Si `npm install` falla con **certificado** o **403** (red corporativa), usa el registro espejo:

```bash
cd mobile-control
npm install --registry https://registry.npmmirror.com --strict-ssl=false
npx cap add android
npx cap sync android
```

O ejecuta solo: `powershell -ExecutionPolicy Bypass -File build-apk.ps1` (el script hace esto solo).

## Icono de la app (logo Turno a Tiempo)

El icono del launcher se genera desde `public/turnoatiempo.jpg` del proyecto web:

```bash
npm run icons
```

Luego vuelve a compilar el APK (`build-apk.ps1` ya incluye `icons` antes del build).  
Fondo del icono adaptativo: morado `#1e1b4b` (marca del sitio).

## Generar APK de prueba (debug)

```bash
npm run android:apk
```

El APK queda en:

`android/app/build/outputs/apk/debug/app-debug.apk`

## Instalar en el teléfono

1. Copia `app-debug.apk` al móvil (USB, WhatsApp, etc.).
2. En Android: **Ajustes → Seguridad → Instalar apps desconocidas** (permite el origen que uses).
3. Abre el APK e instala.
4. Concede **ubicación** cuando la app lo pida (modo automático por GPS).

## Uso

1. Abre la app → inicia sesión (mismas credenciales que en la web de gestores).
2. Elige la procesión → **Panel de control**.
3. **Iniciar procesión** → el modo automático (GPS) se activa solo.
4. Mete el teléfono en el bolsillo o en la procesión: el GPS sigue activo en segundo plano y el turno avanza solo al llegar a cada punto (~25 m de distancia).
5. Manual / corrección sigue disponible si hace falta.

## GPS en segundo plano

La app usa el plugin nativo `@capacitor-community/background-geolocation` que levanta un **Foreground Service** de Android. Verás una notificación persistente "GPS activo — Turno a Tiempo" mientras la procesión esté en curso. Al llegar a cada punto de la ruta, el turno cambia automáticamente y el mapa público se actualiza en tiempo real.

Permisos necesarios en Android: **Ubicación → Permitir siempre** (para segundo plano).

## Importante

Las funciones nuevas (automático, vista reducida) deben estar **desplegadas en turnoatiempo.com** (deploy del repo web). La app no embebe el código: es un WebView a producción.

## Cambiar URL (pruebas locales)

Edita `capacitor.config.ts` → `server.url` (por ejemplo `http://10.0.2.2:3000/auth/login?app=control` en emulador) y ejecuta `npx cap sync android`.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run cap:sync` | Sincroniza proyecto Android |
| `npm run cap:open` | Abre Android Studio |
| `npm run android:apk` | Sync + APK debug |
