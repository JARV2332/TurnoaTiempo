import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.turnoatiempo.control',
  appName: 'Turno a Tiempo Control',
  webDir: 'www',
  server: {
    url: 'https://turnoatiempo.com/auth/login?app=control',
    cleartext: false,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    Geolocation: {
      permissions: ['location', 'coarseLocation'],
    },
  },
}

export default config
