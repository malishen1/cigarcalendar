import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cigarcalendar.app',
  appName: 'Cigar Calendar',
  webDir: 'dist/public',
  server: {
    url: 'https://cigarcalendar.replit.app',
    cleartext: true
  }
};

export default config;
