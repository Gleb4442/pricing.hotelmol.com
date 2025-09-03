# Overview

This is a full-stack web application built as a pricing page for AI hotel services. The application features a modern React frontend with a sleek pricing interface that allows users to toggle between usage-based and monthly billing modes. The frontend is built with Vite, React, TypeScript, and styled using Tailwind CSS with shadcn/ui components. The backend uses Express.js with TypeScript and is configured to work with PostgreSQL via Drizzle ORM.

The application appears to be designed for a Russian-speaking market, offering AI-powered hotel management services with two main pricing tiers (PRO and PREMIUM). The pricing page includes interactive billing toggles, tooltips, and responsive design elements.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend follows a modern React architecture pattern with:

- **Component Structure**: Built using shadcn/ui component library for consistent, accessible UI components
- **State Management**: Uses React hooks for local state and TanStack Query for server state management
- **Routing**: Implements client-side routing with Wouter (lightweight alternative to React Router)
- **Styling**: Tailwind CSS with custom design tokens and shadcn/ui theming system
- **Type Safety**: Full TypeScript implementation with strict type checking

## Backend Architecture

The backend uses a clean Express.js setup with:

- **API Design**: RESTful API structure with route registration system
- **Middleware**: Express middleware for JSON parsing, URL encoding, and request logging
- **Storage Interface**: Abstract storage interface allowing for both in-memory and database implementations
- **Error Handling**: Centralized error handling middleware

## Component Organization

The application is organized with clear separation of concerns:

- **Pages**: Route-level components (`pricing.tsx`, `not-found.tsx`)
- **UI Components**: Reusable shadcn/ui components in `/components/ui/`
- **Business Components**: Custom pricing-specific components in `/components/pricing/`
- **Hooks**: Custom hooks for billing mode state management and mobile detection
- **Shared Types**: Common types and schemas in `/shared/`

## Build System

- **Development**: Vite development server with HMR and TypeScript support
- **Production**: Vite build for frontend, esbuild for backend bundling
- **Type Checking**: Separate TypeScript compilation for type validation

## CSS Architecture

- **Design System**: Comprehensive design token system with CSS custom properties
- **Component Styling**: Utility-first approach with Tailwind CSS
- **Theme Support**: Built-in dark mode support via CSS custom properties
- **Responsive Design**: Mobile-first responsive design patterns

# External Dependencies

## Database and ORM

- **PostgreSQL**: Primary database (configured via DATABASE_URL environment variable)
- **Drizzle ORM**: Type-safe database queries with schema validation
- **Neon Database**: Cloud PostgreSQL provider (based on @neondatabase/serverless dependency)

## Frontend Libraries

- **React**: Core UI library with hooks-based architecture
- **Vite**: Build tool and development server
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight client-side routing
- **React Hook Form**: Form handling with validation
- **Date-fns**: Date manipulation utilities

## UI and Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible primitive components (via shadcn/ui)
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant styling

## Development Tools

- **TypeScript**: Static type checking across the stack
- **ESBuild**: Fast JavaScript/TypeScript bundling
- **PostCSS**: CSS processing with Tailwind
- **Replit Integration**: Development environment optimizations for Replit

## Fonts and Assets

- **Google Fonts**: Inter and Montserrat font families
- **Custom Images**: AI-generated hotel/chatbot imagery stored in attached_assets

## Backend Dependencies

- **Express.js**: Web server framework
- **Connect-pg-simple**: PostgreSQL session store
- **Drizzle-zod**: Schema validation integration
- **Session Management**: PostgreSQL-backed session storage