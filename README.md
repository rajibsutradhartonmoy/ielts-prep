# IELTS Prep Platform

A multi-tenant IELTS preparation platform for organizations to manage students, teachers, create tests, and track performance.

## Technology Stack

### Frontend
- **Next.js 14+** with App Router
- **Tailwind CSS v4** with CSS-first configuration
- **shadcn/ui** component library
- **Redux Toolkit** for state management
- **React Hook Form + Zod** for form handling

### Backend
- **NestJS** with modular architecture
- **PostgreSQL** with Drizzle ORM
- **Passport.js** for JWT authentication
- **Redis** for caching and queues
- **Swagger/OpenAPI** for API documentation

## Project Structure

```
ielts-prep/
├── apps/
│   ├── web/                 # Next.js frontend
│   └── api/                 # NestJS backend
├── packages/
│   ├── shared-types/        # Shared TypeScript types
│   └── shared-utils/        # Shared utilities
├── infrastructure/
│   └── docker/              # Docker configuration
└── ...
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker and Docker Compose (for local development)
- PostgreSQL 15+
- Redis 7+

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ielts-prep
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy environment files:
   ```bash
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

4. Update the environment variables in the `.env` files

### Development

#### Using Docker (Recommended)

Start all services:
```bash
cd infrastructure/docker
docker-compose up
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- API on port 3001
- Web on port 3000

#### Manual Setup

1. Start PostgreSQL and Redis locally

2. Run database migrations:
   ```bash
   pnpm db:push
   ```

3. Start the API:
   ```bash
   pnpm --filter @ielts-prep/api dev
   ```

4. Start the frontend:
   ```bash
   pnpm --filter @ielts-prep/web dev
   ```

### Available Scripts

- `pnpm dev` - Start all applications in development mode
- `pnpm build` - Build all applications
- `pnpm lint` - Run linting
- `pnpm type-check` - Run TypeScript type checking
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio

## API Documentation

Once the API is running, access Swagger documentation at:
```
http://localhost:3001/api/docs
```

## Architecture

### Multi-Tenancy

The platform uses a single-database multi-tenant architecture where:
- Each organization has isolated data
- Users belong to a single organization
- Tenant context is determined by:
  - HTTP header (`X-Organization-Id`)
  - Subdomain routing
  - Custom domain mapping

### Authentication

- JWT-based authentication with Passport.js
- Access tokens (15 min) and refresh tokens (7 days)
- Role-based access control (RBAC)
- Roles: System Admin, Organization Admin, Teacher, Student

### Database Schema

Core entities:
- System Admins (platform administrators)
- Organizations (tenants)
- Users (belong to organizations)
- Audit Logs (for compliance and tracking)

## Phase 1 Features (Completed)

- [x] Monorepo setup with pnpm workspaces
- [x] Next.js frontend with Tailwind CSS v4
- [x] NestJS backend with modular architecture
- [x] Drizzle ORM with PostgreSQL
- [x] JWT authentication with Passport.js
- [x] Multi-tenancy middleware
- [x] System admin module
- [x] Organization management
- [x] User management
- [x] Audit logging
- [x] Docker development environment
- [x] Shared packages for types and utilities

## Upcoming Phases

- **Phase 2**: Student, Teacher, and Batch Management
- **Phase 3**: Test Management System (IELTS sections)
- **Phase 4**: Test Assignment and Student Test Taking
- **Phase 5**: Grading System and Teacher Portal
- **Phase 6**: Analytics, Reports, and Organization Customization
- **Phase 7**: Advanced Features and Production Readiness

## Security

- Input validation and sanitization
- Rate limiting per organization
- CORS configuration
- Security headers (Helmet.js)
- Password hashing with bcrypt (cost factor: 12)
- Audit logging for all critical operations

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## License

Private - All rights reserved.
