# Game Development Group Student Club Website

## Overview

This is a full-stack web application for a Game Development Group Student Club (GDGSC). The application serves as a community platform for students interested in game development, featuring user authentication, event management, mentor profiles, user progression tracking with badges and experience points, and a comprehensive dashboard for members.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side navigation
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query (@tanstack/react-query) for server state
- **UI Theme**: Gaming-inspired dark theme with custom CSS variables
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: tsx for TypeScript execution

### Monorepo Structure
The application follows a monorepo pattern with three main directories:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript schemas and types

## Key Components

### Authentication System
- **Provider**: Replit Auth integration using OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **User Management**: Automatic user creation/updates from Replit profile data
- **Security**: HTTP-only cookies, CSRF protection, secure session handling

### Database Schema
The application uses PostgreSQL with the following core entities:
- **Users**: Profile information, experience points, levels, ranks
- **Events**: Club events with status tracking (upcoming, ongoing, completed)
- **Mentors**: Mentor profiles with contact information and specializations
- **User Event Participation**: Tracking member attendance at events
- **Badges**: Achievement system for user accomplishments
- **User Badges**: Linking users to earned badges
- **Sessions**: Required table for Replit Auth session management

### API Architecture
- **RESTful Design**: Standard HTTP methods and status codes
- **Route Organization**: Centralized route registration in `server/routes.ts`
- **Error Handling**: Global error middleware with proper status codes
- **Request Logging**: Comprehensive API request/response logging
- **Authentication Middleware**: Protected routes using `isAuthenticated` guard

### UI Component System
- **Design System**: shadcn/ui components with Radix UI primitives
- **Theming**: CSS custom properties for consistent theming
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Animations**: GSAP integration for smooth animations
- **Icons**: Lucide React icons with React Icons for social media

## Data Flow

### Authentication Flow
1. User clicks login → Redirected to Replit OAuth
2. Successful auth → User data stored/updated in database
3. Session created → User redirected to dashboard
4. Protected routes check session validity

### Event Management Flow
1. Events fetched from database via `/api/events`
2. React Query caches event data
3. Components render events with real-time status
4. User participation tracked in separate table

### User Progression System
1. Users earn experience points through activities
2. Level calculated based on total experience
3. Badges awarded for specific achievements
4. Dashboard displays progress metrics and stats

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React router
- **express**: Web application framework
- **passport**: Authentication middleware

### UI Dependencies
- **@radix-ui/***: Headless UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant utilities
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for Node.js
- **typescript**: Static type checking

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` script

### Environment Configuration
- **Database**: PostgreSQL connection via `DATABASE_URL`
- **Authentication**: Replit-specific environment variables
- **Sessions**: Secure session secret configuration

### Production Deployment
- Node.js application serves both API and static files
- Express serves built React app from `dist/public`
- Database migrations managed through Drizzle Kit

## Changelog
```
Changelog:
- July 05, 2025: Initial setup with full-stack gaming club website
- July 05, 2025: Enhanced with sample data, improved animations, and modern gaming UI
- July 05, 2025: Added card hover effects, gradient animations, and enhanced visual design
- July 05, 2025: Integrated user-provided inspiration image for hero section
- July 05, 2025: Populated database with sample events, mentors, and badges
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```