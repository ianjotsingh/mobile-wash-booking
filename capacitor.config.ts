
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.59c03063729646debd6fe689871dc273',
  appName: 'WashCart',
  webDir: 'dist',
  server: {
    url: 'https://59c03063-7296-46de-bd6f-e689871dc273.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: '#4A90E2',
      showSpinner: true,
      spinnerColor: '#ffffff'
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#4A90E2'
    }
  }
};

export default config;
