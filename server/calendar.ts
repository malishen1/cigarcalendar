import { google } from "googleapis";

let connectionSettings: any;

async function getAccessToken() {
  if (
    connectionSettings &&
    connectionSettings.settings.expires_at &&
    new Date(connectionSettings.settings.expires_at).getTime() > Date.now()
  ) {
    return connectionSettings.settings.access_token;
  }
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;
  if (!xReplitToken) throw new Error("X_REPLIT_TOKEN not found");
  connectionSettings = await fetch(
    "https://" +
      hostname +
      "/api/v2/connection?include_secrets=true&connector_names=google-calendar",
    { headers: { Accept: "application/json", X_REPLIT_TOKEN: xReplitToken } },
  )
    .then((res) => res.json())
    .then((data) => data.items?.[0]);
  const accessToken =
    connectionSettings?.settings?.access_token ||
    connectionSettings.settings?.oauth?.credentials?.access_token;
  if (!connectionSettings || !accessToken)
    throw new Error("Google Calendar not connected");
  return accessToken;
}

async function getGoogleCalendarClient() {
  const accessToken = await getAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth: oauth2Client });
}

export async function createCalendarEvent(
  cigarName: string,
  brand: string | null,
  date: Date,
  duration?: number | null,
): Promise<string | null> {
  try {
    const calendar = await getGoogleCalendarClient();
    const title = brand ? `${cigarName} by ${brand}` : cigarName;
    const startTime = new Date(date);
    const endTime = new Date(date);
    endTime.setMinutes(endTime.getMinutes() + (duration || 60));
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: `Cigar Session: ${title}`,
        description: `Enjoyed ${title}`,
        start: { dateTime: startTime.toISOString(), timeZone: "UTC" },
        end: { dateTime: endTime.toISOString(), timeZone: "UTC" },
      },
    });
    return response.data.id || null;
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return null;
  }
}

export async function updateCalendarEvent(
  eventId: string,
  cigarName: string,
  brand: string | null,
  date: Date,
  duration?: number | null,
): Promise<void> {
  try {
    const calendar = await getGoogleCalendarClient();
    const title = brand ? `${cigarName} by ${brand}` : cigarName;
    const startTime = new Date(date);
    const endTime = new Date(date);
    endTime.setMinutes(endTime.getMinutes() + (duration || 60));
    await calendar.events.update({
      calendarId: "primary",
      eventId,
      requestBody: {
        summary: `Cigar Session: ${title}`,
        description: `Enjoyed ${title}`,
        start: { dateTime: startTime.toISOString(), timeZone: "UTC" },
        end: { dateTime: endTime.toISOString(), timeZone: "UTC" },
      },
    });
  } catch (error) {
    console.error("Error updating calendar event:", error);
  }
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  try {
    const calendar = await getGoogleCalendarClient();
    await calendar.events.delete({ calendarId: "primary", eventId });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
  }
}
