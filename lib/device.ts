export function parseUserAgent(ua: string | null | undefined): {
  deviceName: string;
  deviceType: "desktop" | "mobile" | "tablet";
} {
  if (!ua) return { deviceName: "Unknown Device", deviceType: "desktop" };

  let browser = "Unknown Browser";
  let os = "Unknown OS";
  let deviceType: "desktop" | "mobile" | "tablet" = "desktop";

  if (ua.includes("OPR") || ua.includes("Opera")) browser = "Opera";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome") && !ua.includes("Chromium"))
    browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Firefox")) browser = "Firefox";

  if (ua.includes("iPad")) {
    os = "iPad";
    deviceType = "tablet";
  } else if (ua.includes("iPhone")) {
    os = "iPhone";
    deviceType = "mobile";
  } else if (ua.includes("Android")) {
    os = "Android";
    deviceType = ua.includes("Mobile") ? "mobile" : "tablet";
  } else if (ua.includes("Windows NT")) {
    os = "Windows";
  } else if (ua.includes("Mac OS X")) {
    os = "macOS";
  } else if (ua.includes("Linux")) {
    os = "Linux";
  }

  return { deviceName: `${browser} on ${os}`, deviceType };
}
