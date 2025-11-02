import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4ce35e0782854248beabef292f053c4b',
  appName: 'A Lovable project',
  webDir: 'dist',
  server: {
    url: "https://4ce35e07-8285-4248-beab-ef292f053c4b.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;