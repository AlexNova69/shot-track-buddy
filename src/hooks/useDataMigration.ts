import { useEffect } from "react";

const CURRENT_VERSION = "1.1.0";
const VERSION_KEY = "app_data_version";

export function useDataMigration() {
  useEffect(() => {
    const savedVersion = localStorage.getItem(VERSION_KEY);
    
    // First time user or migration needed
    if (!savedVersion) {
      // Initialize new fields with empty arrays if they don't exist
      if (!localStorage.getItem("measurements")) {
        localStorage.setItem("measurements", JSON.stringify([]));
      }
      
      // Set current version
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      console.log("Data migration completed to version", CURRENT_VERSION);
    } else if (savedVersion !== CURRENT_VERSION) {
      // Future migrations can go here
      console.log("Migrating from version", savedVersion, "to", CURRENT_VERSION);
      
      // Ensure new fields exist
      if (!localStorage.getItem("measurements")) {
        localStorage.setItem("measurements", JSON.stringify([]));
      }
      
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    }
  }, []);
}
