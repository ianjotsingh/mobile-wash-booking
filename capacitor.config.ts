
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.59c03063729646debd6fe689871dc273',
  appName: 'mobile-wash-booking',
  webDir: 'dist',
  server: {
    url: 'https://59c03063-7296-46de-bd6f-e689871dc273.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false
    }
  }
};

export default config;
