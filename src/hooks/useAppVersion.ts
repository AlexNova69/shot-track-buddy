import { useLocalStorage } from "./useLocalStorage";

export function useAppVersion() {
  const [version, setVersion] = useLocalStorage("appVersion", "1.0.0");

  const incrementVersion = () => {
    const [major, minor, patch] = version.split(".").map(Number);
    const newVersion = `${major}.${minor}.${patch + 1}`;
    setVersion(newVersion);
    return newVersion;
  };

  return { version, incrementVersion };
}
