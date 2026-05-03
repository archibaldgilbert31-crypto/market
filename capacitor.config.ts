import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.marketplace.app",
  appName: "Marketplace",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
