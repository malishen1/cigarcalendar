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
  // Set up session middleware first
  app.use(getSession());

  // Sign up route
  app.post("/api/signup", async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Create user
      const user = await storage.createUser({ username, email, password });

      // Set up session
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

  // Sign in route
  app.post("/api/signin", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Username and password required" });
      }

      const user = await storage.authenticateUser(username, password);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set up session
      (req as any).session.userId = user.id;
      (req as any).session.username = user.username;

      res.json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ message: "Failed to sign in" });
    }
  });

  // Logout route
  app.post("/api/logout", async (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/user", async (req: any, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Cigar routes
  app.get("/api/cigars", async (req, res) => {
    try {
      const cigars = await storage.getAllCigars();
      res.json(cigars);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cigars" });
    }
  });

  app.get("/api/cigars/:id", async (req, res) => {
    try {
      const cigar = await storage.getCigar(req.params.id);
      if (!cigar) {
        return res.status(404).json({ error: "Cigar not found" });
      }
      res.json(cigar);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cigar" });
    }
  });

  app.post("/api/cigars", async (req, res) => {
    try {
      const { addToCalendar, ...cigarData } = req.body;

      // Convert date string to Date object
      if (cigarData.date) {
        cigarData.date = new Date(cigarData.date);
      }

      const parsed = insertCigarSchema.parse(cigarData);

      const cigar = await storage.createCigar(parsed);

      if (addToCalendar) {
        const eventId = await createCalendarEvent(
          cigar.cigarName,
          cigar.brand,
          cigar.date,
          cigar.duration,
        );
        if (eventId) {
          await storage.updateCigar(cigar.id, { calendarEventId: eventId });
        }
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

      // Convert date string to Date object if present
      if (cigarData.date) {
        cigarData.date = new Date(cigarData.date);
      }

      // Get the current cigar to check for calendar event
      const currentCigar = await storage.getCigar(req.params.id);
      if (!currentCigar) {
        return res.status(404).json({ error: "Cigar not found" });
      }

      const updated = await storage.updateCigar(req.params.id, cigarData);
      if (!updated) {
        return res.status(404).json({ error: "Cigar not found" });
      }

      // Update Google Calendar event if it exists
      if (currentCigar.calendarEventId) {
        await updateCalendarEvent(
          currentCigar.calendarEventId,
          updated.cigarName,
          updated.brand,
          updated.date,
          updated.duration,
        );
      }
      // Or create a new event if user wants to add to calendar
      else if (addToCalendar) {
        const eventId = await createCalendarEvent(
          updated.cigarName,
          updated.brand,
          updated.date,
          updated.duration,
        );
        if (eventId) {
          await storage.updateCigar(req.params.id, {
            calendarEventId: eventId,
          });
        }
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
      // Get the cigar first to check for calendar event
      const cigar = await storage.getCigar(req.params.id);
      if (!cigar) {
        return res.status(404).json({ error: "Cigar not found" });
      }

      // Delete from Google Calendar if event exists
      if (cigar.calendarEventId) {
        await deleteCalendarEvent(cigar.calendarEventId);
      }

      const deleted = await storage.deleteCigar(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Cigar not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting cigar:", error);
      res.status(500).json({ error: "Failed to delete cigar" });
    }
  });

  app.get("/api/cigars/:id/download-calendar", async (req, res) => {
    try {
      const cigar = await storage.getCigar(req.params.id);
      if (!cigar) {
        return res.status(404).json({ error: "Cigar not found" });
      }

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
        ],
        end: [
          endDate.getFullYear(),
          endDate.getMonth() + 1,
          endDate.getDate(),
          endDate.getHours(),
          endDate.getMinutes(),
        ],
        title: `Cigar Session: ${title}`,
        description: cigar.notes
          ? `Enjoyed ${title}\n\nRating: ${cigar.rating}/5 stars\n\nNotes: ${cigar.notes}`
          : `Enjoyed ${title}\n\nRating: ${cigar.rating}/5 stars`,
        status: "CONFIRMED" as const,
        busyStatus: "FREE" as const,
      };

      const { error, value } = createEvents([event]);

      if (error) {
        console.error("Error creating calendar event:", error);
        return res
          .status(500)
          .json({ error: "Failed to create calendar file" });
      }

      res.setHeader("Content-Type", "text/calendar");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="cigar-session-${cigar.id}.ics"`,
      );
      res.send(value);
    } catch (error) {
      console.error("Error downloading calendar:", error);
      res.status(500).json({ error: "Failed to download calendar event" });
    }
  });

  // Release routes
  app.get("/api/releases", async (req, res) => {
    try {
      const releases = await storage.getAllReleases();
      res.json(releases);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch releases" });
    }
  });

  app.get("/api/releases/:id", async (req, res) => {
    try {
      const release = await storage.getRelease(req.params.id);
      if (!release) {
        return res.status(404).json({ error: "Release not found" });
      }
      res.json(release);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch release" });
    }
  });

  app.post("/api/releases", async (req, res) => {
    try {
      const parsed = insertReleaseSchema.parse(req.body);
      const release = await storage.createRelease(parsed);
      res.status(201).json(release);
    } catch (error) {
      res.status(400).json({ error: "Invalid release data" });
    }
  });

  app.patch("/api/releases/:id", async (req, res) => {
    try {
      const updated = await storage.updateRelease(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Release not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Failed to update release" });
    }
  });

  app.delete("/api/releases/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRelease(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Release not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete release" });
    }
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const parsed = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(parsed);
      res.status(201).json(event);
    } catch (error) {
      console.error("Event validation error:", error);
      res.status(400).json({ error: "Invalid event data" });
    }
  });

  app.patch("/api/events/:id", async (req, res) => {
    try {
      const updated = await storage.updateEvent(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEvent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  app.post("/api/events/:id/rsvp", async (req, res) => {
    try {
      const updated = await storage.rsvpEvent(req.params.id);
      if (!updated) {
        return res
          .status(400)
          .json({ error: "Event not found or at max capacity" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error RSVPing to event:", error);
      res.status(500).json({ error: "Failed to RSVP to event" });
    }
  });

  // Community post routes
  app.get("/api/community", async (req, res) => {
    try {
      const posts = await storage.getAllCommunityPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/community/:id", async (req, res) => {
    try {
      const post = await storage.getCommunityPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  app.post("/api/community", async (req, res) => {
    try {
      const parsed = insertCommunityPostSchema.parse(req.body);
      const post = await storage.createCommunityPost(parsed);
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ error: "Invalid post data" });
    }
  });

  app.post("/api/community/:id/like", async (req, res) => {
    try {
      const post = await storage.likeCommunityPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to like post" });
    }
  });

  app.post("/api/community/:id/comment", async (req, res) => {
    try {
      const post = await storage.commentOnCommunityPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to comment on post" });
    }
  });

  // Stats endpoint for dashboard
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

      res.json({
        totalCigars,
        avgRating,
        thisMonth,
        withCalendar,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Seed releases if empty
  app.get("/api/seed", async (req, res) => {
  ```

  **Ctrl+S** to save, then just visit this in your browser:
  ```
  https://cigarcalendar.app/api/seed
    try {
      const existing = await storage.getAllReleases();
      if (existing.length === 0) {
        const seedReleases = [
          {
            name: "Cohiba Behike BHK 52",
            brand: "Cohiba",
            releaseDate: new Date("2026-04-15"),
            region: "UK & Europe",
            availability: "Limited",
            description:
              "The ultra-premium Behike line returns with a limited UK & Europe allocation. One of the most sought-after cigars in the world.",
          },
          {
            name: "Montecristo No. 2 Edición Limitada",
            brand: "Montecristo",
            releaseDate: new Date("2026-05-01"),
            region: "UK & Europe",
            availability: "Limited",
            description:
              "A special limited edition of the iconic torpedo shape, aged for an extra 18 months for added complexity.",
          },
          {
            name: "Romeo y Julieta Wide Churchills",
            brand: "Romeo y Julieta",
            releaseDate: new Date("2026-03-20"),
            region: "UK",
            availability: "Available",
            description:
              "A wider ring gauge take on the classic Churchill format. Rich and creamy with a long finish.",
          },
          {
            name: "Partagás Serie D No. 5",
            brand: "Partagás",
            releaseDate: new Date("2026-06-10"),
            region: "Europe",
            availability: "Upcoming",
            description:
              "A shorter, more powerful version of the beloved Serie D line. Full-bodied with dark chocolate and earth notes.",
          },
          {
            name: "H. Upmann Magnum 56 Edición Limitada",
            brand: "H. Upmann",
            releaseDate: new Date("2026-07-01"),
            region: "UK & Europe",
            availability: "Upcoming",
            description:
              "A bold new vitola from H. Upmann's limited edition programme. Expect cedar, leather and toasted nuts.",
          },
          {
            name: "Bolivar Royal Coronas",
            brand: "Bolivar",
            releaseDate: new Date("2026-03-10"),
            region: "UK",
            availability: "Available",
            description:
              "The classic Bolivar strength in a refined robusto format. Dark, powerful and complex.",
          },
        ];
        for (const r of seedReleases) {
          await storage.createRelease(r);
        }
      }

      const existingEvents = await storage.getAllEvents();
      if (existingEvents.length === 0) {
        const seedEvents = [
          {
            name: "London Cigar Tasting Evening",
            date: new Date("2026-04-18T19:00:00"),
            location: "Davidoff of London, St James's",
            type: "Tasting",
            description:
              "An exclusive evening of premium Cuban cigars paired with aged rum. Limited to 30 guests.",
            attendees: 12,
            maxCapacity: 30,
            link: "https://davidoff.com",
          },
          {
            name: "Manchester Cigar Social",
            date: new Date("2026-05-03T18:30:00"),
            location: "The Smoking Room, Manchester",
            type: "Social",
            description:
              "Monthly meetup for cigar enthusiasts in the North West. All experience levels welcome.",
            attendees: 8,
            maxCapacity: 20,
            link: "",
          },
          {
            name: "European Cigar Festival 2026",
            date: new Date("2026-06-20T10:00:00"),
            location: "Amsterdam, Netherlands",
            type: "Festival",
            description:
              "The premier cigar festival in Europe. 50+ brands, masterclasses, and exclusive releases.",
            attendees: 320,
            maxCapacity: 500,
            link: "",
          },
          {
            name: "Habanos Virtual Lounge",
            date: new Date("2026-04-05T20:00:00"),
            location: "Online",
            type: "Virtual",
            description:
              "Join master rollers and brand ambassadors for a live online session. Watch, learn and smoke along.",
            attendees: 45,
            maxCapacity: 200,
            link: "",
          },
        ];
        for (const e of seedEvents) {
          await storage.createEvent(e);
        }
      }

      res.json({ message: "Seeded successfully" });
    } catch (error) {
      console.error("Seed error:", error);
      res.status(500).json({ error: "Failed to seed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
