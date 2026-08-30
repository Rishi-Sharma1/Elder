import { Platform } from "react-native";

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Web environment detection
  if (Platform.OS === "web" && typeof window !== "undefined" && window.location) {
    const { hostname, port, origin } = window.location;
    // Local development mode on Metro dev server (e.g. port 8081 or 19006)
    if (port && port !== "5000" && (hostname === "localhost" || hostname === "127.0.0.1")) {
      return `http://${hostname}:5000`;
    }
    // Production deployment (e.g. https://elder-connect-kkme.onrender.com)
    return origin;
  }

  // Mobile / Native fallback
  return "http://localhost:5000";
};

export const BASE_URL = getBaseUrl();
export const PORT = "5000";
export const HOST_IP = BASE_URL;



