import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tuapp.id',
  appName: 'FleaMarket',
  webDir: 'www',
  plugins: {
    Keyboard: {
      resize: 'body' as any
    }
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;