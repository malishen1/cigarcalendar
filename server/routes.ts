import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertCigarSchema,
  insertReleaseSchema,
  insertEventSchema,
  insertCommunityPostSchema,
} from "@shared/schema";
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "./calendar";
import { createEvents } from "ics";
import { getSession } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(getSession());

  app.post("/api/signup", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password)
        return res.status(400).json({ message: "All fields are required" });
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser)
        return res.status(400).json({ message: "Username already taken" });
      const user = await storage.createUser({ username, email, password });
      (req as any).session.userId = user.id;
      (req as any).session.username = user.username;
      res
        .status(201)
        .json({ id: user.id, username: user.username, email: user.email });
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post("/api/signin", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password)
        return res
          .status(400)
          .json({ message: "Username and password required" });
      const user = await storage.authenticateUser(username, password);
      if (!user)
        return res.status(401).json({ message: "Invalid credentials" });
      (req as any).session.userId = user.id;
      (req as any).session.username = user.username;
      res.json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ message: "Failed to sign in" });
    }
  });

  app.post("/api/logout", async (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) return res.status(500).json({ message: "Failed to logout" });
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/logout", async (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) return res.redirect("/");
      res.redirect("/");
    });
  });

  app.get("/api/auth/user", async (req: any, res) => {
    try {
      if (!req.session.userId)
        return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(req.session.userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/cigars", async (req, res) => {
    try {
      res.json(await storage.getAllCigars());
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cigars" });
    }
  });

  app.get("/api/cigars/:id", async (req, res) => {
    try {
      const cigar = await storage.getCigar(req.params.id);
      if (!cigar) return res.status(404).json({ error: "Cigar not found" });
      res.json(cigar);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cigar" });
    }
  });

  app.post("/api/cigars", async (req, res) => {
    try {
      const { addToCalendar, ...cigarData } = req.body;
      if (cigarData.date) cigarData.date = new Date(cigarData.date);
      const parsed = insertCigarSchema.parse(cigarData);
      const cigar = await storage.createCigar(parsed);
      if (addToCalendar) {
        const eventId = await createCalendarEvent(
          cigar.cigarName,
          cigar.brand,
          cigar.date,
          cigar.duration,
        );
        if (eventId)
          await storage.updateCigar(cigar.id, { calendarEventId: eventId });
      }
      const updatedCigar = await storage.getCigar(cigar.id);
      res.status(201).json(updatedCigar || cigar);
    } catch (error) {
      console.error("Error logging cigar:", error);
      res.status(400).json({ error: "Invalid cigar data" });
    }
  });

  app.patch("/api/cigars/:id", async (req, res) => {
    try {
      const { addToCalendar, ...cigarData } = req.body;
      if (cigarData.date) cigarData.date = new Date(cigarData.date);
      const currentCigar = await storage.getCigar(req.params.id);
      if (!currentCigar)
        return res.status(404).json({ error: "Cigar not found" });
      const updated = await storage.updateCigar(req.params.id, cigarData);
      if (!updated) return res.status(404).json({ error: "Cigar not found" });
      if (currentCigar.calendarEventId) {
        await updateCalendarEvent(
          currentCigar.calendarEventId,
          updated.cigarName,
          updated.brand,
          updated.date,
          updated.duration,
        );
      } else if (addToCalendar) {
        const eventId = await createCalendarEvent(
          updated.cigarName,
          updated.brand,
          updated.date,
          updated.duration,
        );
        if (eventId)
          await storage.updateCigar(req.params.id, {
            calendarEventId: eventId,
          });
      }
      const finalCigar = await storage.getCigar(req.params.id);
      res.json(finalCigar || updated);
    } catch (error) {
      console.error("Error updating cigar:", error);
      res.status(400).json({ error: "Failed to update cigar" });
    }
  });

  app.delete("/api/cigars/:id", async (req, res) => {
    try {
      const cigar = await storage.getCigar(req.params.id);
      if (!cigar) return res.status(404).json({ error: "Cigar not found" });
      if (cigar.calendarEventId)
        await deleteCalendarEvent(cigar.calendarEventId);
      const deleted = await storage.deleteCigar(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Cigar not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete cigar" });
    }
  });

  app.get("/api/cigars/:id/download-calendar", async (req, res) => {
    try {
      const cigar = await storage.getCigar(req.params.id);
      if (!cigar) return res.status(404).json({ error: "Cigar not found" });
      const title = cigar.brand
        ? `${cigar.cigarName} by ${cigar.brand}`
        : cigar.cigarName;
      const startDate = new Date(cigar.date);
      const endDate = new Date(cigar.date);
      endDate.setMinutes(endDate.getMinutes() + (cigar.duration || 60));
      const event = {
        start: [
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          startDate.getDate(),
          startDate.getHours(),
          startDate.getMinutes(),
        ] as [number, number, number, number, number],
        end: [
          endDate.getFullYear(),
          endDate.getMonth() + 1,
          endDate.getDate(),
          endDate.getHours(),
          endDate.getMinutes(),
        ] as [number, number, number, number, number],
        title: `Cigar Session: ${title}`,
        description: cigar.notes
          ? `Enjoyed ${title}\n\nRating: ${cigar.rating}/5 stars\n\nNotes: ${cigar.notes}`
          : `Enjoyed ${title}\n\nRating: ${cigar.rating}/5 stars`,
        status: "CONFIRMED" as const,
        busyStatus: "FREE" as const,
      };
      const { error, value } = createEvents([event]);
      if (error)
        return res
          .status(500)
          .json({ error: "Failed to create calendar file" });
      res.setHeader("Content-Type", "text/calendar");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="cigar-session-${cigar.id}.ics"`,
      );
      res.send(value);
    } catch (error) {
      res.status(500).json({ error: "Failed to download calendar event" });
    }
  });

  app.get("/api/releases", async (req, res) => {
    try {
      res.json(await storage.getAllReleases());
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch releases" });
    }
  });

  app.get("/api/releases/:id", async (req, res) => {
    try {
      const release = await storage.getRelease(req.params.id);
      if (!release) return res.status(404).json({ error: "Release not found" });
      res.json(release);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch release" });
    }
  });

  app.post("/api/releases", async (req, res) => {
    try {
      const parsed = insertReleaseSchema.parse(req.body);
      res.status(201).json(await storage.createRelease(parsed));
    } catch (error) {
      res.status(400).json({ error: "Invalid release data" });
    }
  });

  app.patch("/api/releases/:id", async (req, res) => {
    try {
      const updated = await storage.updateRelease(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: "Release not found" });
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Failed to update release" });
    }
  });

  app.delete("/api/releases/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRelease(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Release not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete release" });
    }
  });

  app.get("/api/events", async (req, res) => {
    try {
      res.json(await storage.getAllEvents());
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) return res.status(404).json({ error: "Event not found" });
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const parsed = insertEventSchema.parse(req.body);
      res.status(201).json(await storage.createEvent(parsed));
    } catch (error) {
      console.error("Event validation error:", error);
      res.status(400).json({ error: "Invalid event data" });
    }
  });

  app.patch("/api/events/:id", async (req, res) => {
    try {
      const updated = await storage.updateEvent(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: "Event not found" });
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEvent(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Event not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  app.post("/api/events/:id/rsvp", async (req, res) => {
    try {
      const updated = await storage.rsvpEvent(req.params.id);
      if (!updated)
        return res
          .status(400)
          .json({ error: "Event not found or at max capacity" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to RSVP to event" });
    }
  });

  app.get("/api/community", async (req, res) => {
    try {
      res.json(await storage.getAllCommunityPosts());
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/community/:id", async (req, res) => {
    try {
      const post = await storage.getCommunityPost(req.params.id);
      if (!post) return res.status(404).json({ error: "Post not found" });
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  app.post("/api/community", async (req, res) => {
    try {
      const parsed = insertCommunityPostSchema.parse(req.body);
      res.status(201).json(await storage.createCommunityPost(parsed));
    } catch (error) {
      res.status(400).json({ error: "Invalid post data" });
    }
  });

  app.get("/api/community/:id/liked", async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.json({ liked: false });
      const result = await storage.hasLiked(req.params.id, userId);
      res.json({ liked: result });
    } catch (error) {
      res.json({ liked: false });
    }
  });

  app.post("/api/community/:id/like", async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId)
        return res.status(401).json({ error: "Must be logged in to like" });
      const result = await storage.toggleLike(req.params.id, userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to like post" });
    }
  });

  app.post("/api/community/:id/comment", async (req, res) => {
    try {
      const post = await storage.commentOnCommunityPost(req.params.id);
      if (!post) return res.status(404).json({ error: "Post not found" });
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to comment on post" });
    }
  });

  app.post("/api/ai/recommendations", async (req, res) => {
    try {
      const { history } = req.body;
      if (!history || history.length === 0)
        return res.status(400).json({ error: "No cigar history provided" });
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey)
        return res.status(500).json({ error: "API key not configured" });
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `You are a world-class cigar sommelier. Based on this cigar history, recommend 3 cigars. Respond ONLY with a JSON array, no markdown. Format: [{"name":"cigar name","brand":"brand","strength":"Mild/Medium/Full","flavors":["f1","f2","f3"],"reason":"why they'll love it","rating":"93/100"}]\n\nHistory: ${JSON.stringify(history)}`,
            },
          ],
        }),
      });
      if (!response.ok) {
        const err = await response.text();
        console.error("Anthropic error:", response.status, err);
        return res
          .status(response.status)
          .json({ error: `Anthropic API error: ${response.status}` });
      }
      const data = await response.json();
      const text = data.content?.[0]?.text || "[]";
      const cleaned = text.replace(/```json\n?|```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed))
        return res.status(500).json({ error: "Invalid response format" });
      res.json(parsed);
    } catch (error) {
      console.error("AI error:", error);
      res.status(500).json({ error: "Failed to get recommendations" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const cigars = await storage.getAllCigars();
      const totalCigars = cigars.length;
      const avgRating =
        cigars.length > 0
          ? (
              cigars.reduce((sum, c) => sum + c.rating, 0) / cigars.length
            ).toFixed(1)
          : "0";
      const now = new Date();
      const thisMonth = cigars.filter((c) => {
        const cigarDate = new Date(c.date);
        return (
          cigarDate.getMonth() === now.getMonth() &&
          cigarDate.getFullYear() === now.getFullYear()
        );
      }).length;
      const withCalendar = cigars.filter((c) => c.calendarEventId).length;
      res.json({ totalCigars, avgRating, thisMonth, withCalendar });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
