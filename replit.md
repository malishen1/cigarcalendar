# Cigar Calendar Application

## Overview

A premium cigar tracking application that allows enthusiasts to log, review, and discover cigars. The application features personal tracking with ratings and notes, upcoming cigar releases, industry events, and community engagement. Designed with an elegant, sophisticated interface inspired by premium tracking apps like Vivino and Untappd, combined with the clean data organization principles of Notion.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server, providing fast HMR and optimized production builds
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query (React Query)** for server state management, data fetching, and caching

**UI Component System**
- **shadcn/ui** component library built on Radix UI primitives (New York style variant)
- **Tailwind CSS** for utility-first styling with custom design tokens
- **class-variance-authority** for managing component variants
- Custom design system following premium lifestyle app patterns:
  - Typography: Crimson Pro (serif) for headings, Inter (sans-serif) for body text
  - Color scheme: Neutral base with primary/secondary/destructive variants
  - Consistent spacing scale using Tailwind units (2, 4, 6, 8)
  - Responsive breakpoints: mobile (base), tablet (md), desktop (lg)

**State Management Pattern**
- Server state managed via TanStack Query with optimistic updates
- Local UI state managed via React hooks (useState, useContext)
- Form state handled by React Hook Form with Zod validation
- Toast notifications via custom useToast hook

### Backend Architecture

**Server Framework**
- **Express.js** running on Node.js for HTTP server
- **TypeScript** with ES modules for type safety across the stack
- Custom middleware for request logging and JSON parsing
- Session management with connect-pg-simple for PostgreSQL-backed sessions

**API Design**
- RESTful API endpoints organized by resource (cigars, releases, events, community)
- Standard HTTP methods: GET for retrieval, POST for creation, PATCH for updates, DELETE for removal
- Consistent JSON request/response format
- Error handling with appropriate HTTP status codes

**Storage Layer**
- **Drizzle ORM** for type-safe database operations and schema management
- Interface-based storage abstraction (IStorage) allowing for multiple implementations
- In-memory storage implementation (MemStorage) for development/testing
- Schema definitions using Drizzle's pgTable with TypeScript inference

### Data Model

**Core Entities**
- **Users**: Authentication and user management (id, username, password)
- **Cigars**: Personal cigar logging with ratings, notes, duration, strength, and calendar integration
- **Releases**: Upcoming cigar releases with brand, region, availability tracking
- **Events**: Industry events (festivals, tastings, virtual lounges) with location and attendee data
- **Community Posts**: User-generated content with likes and comments

**Schema Patterns**
- UUID primary keys generated via PostgreSQL's gen_random_uuid()
- Timestamp fields for temporal data (dates, release dates)
- Optional fields for flexibility in data entry
- Type-safe schema validation using drizzle-zod

### External Dependencies

**Database**
- **PostgreSQL** via @neondatabase/serverless for serverless PostgreSQL connections
- Configured via DATABASE_URL environment variable
- Migrations managed in ./migrations directory via Drizzle Kit

**Google Calendar Integration**
- **Google Calendar API** (googleapis package) for syncing cigar sessions
- OAuth 2.0 authentication via Replit Connectors
- Automatic event creation/update/deletion with cigar details
- Token refresh handled automatically via connector service
- Calendar event IDs stored in cigar records for synchronization

**Development Tools**
- Replit-specific plugins for development:
  - @replit/vite-plugin-runtime-error-modal for error overlays
  - @replit/vite-plugin-cartographer for code navigation
  - @replit/vite-plugin-dev-banner for development indicators
- Hot module replacement in development mode

**Build & Deployment**
- Production build: Vite for frontend, esbuild for backend bundling
- Static assets served from dist/public
- Environment-based configuration (NODE_ENV)
- TypeScript compilation checking via tsc

**UI Dependencies**
- Extensive Radix UI component primitives for accessibility
- date-fns for date formatting and manipulation
- embla-carousel-react for carousel components
- lucide-react for icon system
- cmdk for command palette functionality