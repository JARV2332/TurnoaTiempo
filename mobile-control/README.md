# Turno a Tiempo — App de control (Android)

APK de uso personal para **login + panel de control en vivo** (sin Play Store).

Carga la web de producción: `https://turnoatiempo.com` con `?app=control`.

## Requisitos

- [Node.js](https://nodejs.org/) 20+
- [Android Studio](https://developer.android.com/studio) con Android SDK
- Variable de entorno `ANDROID_HOME` (Android Studio suele configurarla)

## Instalar dependencias

```bash
cd TurnoaTiempo-Control-Android
npm install
npx cap add android
npx cap sync android
```

(Si `android/` ya existe, solo `npm install` y `npx cap sync android`.)

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
3. **Iniciar procesión** → **Siguiente turno** o activa **Modo automático (GPS)**.
4. Manual / corrección sigue disponible si hace falta.

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
