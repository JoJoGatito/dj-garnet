# Overview

This is a full-stack music request system built with React and Express. The application allows users to submit song requests and provides an admin interface for managing request statuses. It's designed for DJ/music events where organizers can track and manage incoming song requests from the audience.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation resolvers

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **API Design**: RESTful API with JSON responses
- **Error Handling**: Centralized error middleware with proper status codes
- **Request Logging**: Custom middleware for API request/response logging
- **Development**: Hot reloading with Vite integration in development mode

## Data Storage
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle migrations in `./migrations` directory
- **Fallback Storage**: In-memory storage implementation for development/testing
- **Connection Pooling**: Using @neondatabase/serverless for connection management

## Core Data Models
- **Users**: Basic authentication schema with username/password
- **Requests**: Song requests with artist, title, status tracking, and timestamps
- **Status Types**: Enum-based status system (played, coming-up, maybe)

## Authentication & Authorization
- **Session Management**: Express sessions with PostgreSQL session store
- **Password Storage**: Plain text (development setup - needs production hardening)
- **User Management**: Basic CRUD operations for user accounts

## Development Workflow
- **Build Process**: Vite for frontend bundling, esbuild for server compilation
- **Type Safety**: Shared TypeScript schemas between client and server
- **Development Server**: Concurrent client/server development with HMR
- **Database Management**: Drizzle Kit for schema migrations and database operations

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting platform
- **Connection Library**: @neondatabase/serverless for database connectivity

## UI Component Library
- **Radix UI**: Comprehensive collection of accessible React components
- **shadcn/ui**: Pre-styled component system built on Radix primitives
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Frontend build tool with development server
- **Replit Integration**: Cartographer plugin and error overlay for Replit environment
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins

## Validation & Forms
- **Zod**: TypeScript-first schema validation library
- **React Hook Form**: Performant form library with minimal re-renders
- **Drizzle Zod**: Integration layer between Drizzle schemas and Zod validation

## Session & Storage
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **Date-fns**: Date manipulation and formatting utilities