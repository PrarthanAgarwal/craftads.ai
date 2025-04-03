# CraftAds - Technical Stack

## Overview

This document outlines the complete technology stack for the CraftAds application, covering frontend, backend, infrastructure, and third-party integrations.

## 1. Frontend Technologies

### 1.1 Core Framework
- **Next.js 14+**: React framework with server-side rendering and static site generation capabilities
- **React 18+**: Component-based UI library
- **TypeScript**: For type-safe code and better developer experience

### 1.2 Styling & UI
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Shadcn UI**: Component library for consistent design patterns
- **Phosphor Icons**: Modern icon library with multiple weights and styles
- **Framer Motion**: Animation library for smooth transitions and effects

### 1.3 State Management
- **React Context API**: For global state management
- **Zustand**: Lightweight state management for complex component interactions
- **SWR**: For data fetching, caching, and revalidation

### 1.4 Form Handling
- **React Hook Form**: For efficient form validation and management
- **Zod**: TypeScript-first schema validation

## 2. Backend Technologies

### 2.1 API Layer
- **Next.js API Routes**: For serverless backend functionality
- **tRPC**: Type-safe API layer connecting frontend and backend

### 2.2 Authentication
- **NextAuth.js**: Main authentication solution using JWT sessions
- **Google OAuth 2.0**: Primary authentication provider
- **Session-based Authentication**: For web client interactions
- **JWT Tokens**: For secure API interactions

### 2.3 Database
- **Supabase**: PostgreSQL database with authentication and storage solutions
- **Prisma**: ORM for database interactions with TypeScript type safety
- **Database Structure**:
  - User profiles with credit balances
  - Credit transactions for purchase and usage tracking
  - Generation history and assets
- **Drizzle ORM**: Lightweight alternative for complex queries
- **Redis**: For caching and session management

### 2.4 File Storage
- **Amazon S3**: For storing user uploads and generated ads
- **Cloudinary**: For image transformations and optimizations
- **Vercel Blob Storage**: For storing generated images securely

## 3. AI & Integration Services

### 3.1 AI Models
- **OpenAI GPT-4o API**: Primary AI model for image generation and remixing
- **Credit-based System**: 1 credit = 1 image generation
- **Prompt Optimization**: Structured prompt templates for consistent results

### 3.2 Image Processing
- **Sharp**: Node.js image processing library for thumbnails and optimizations
- **ImageMagick**: For more complex image manipulations
- **Canvas API**: For browser-based image compositing
- **Vercel Blob Storage**: For storing generated images securely
- **Image Optimization**: Next.js built-in image optimization

### 3.3 Third-Party Services
- **Stripe**: Payment processing for credit purchases
- **SendGrid**: For transactional emails
- **Sentry**: For error tracking and monitoring
- **PostHog**: For analytics and user behavior tracking
- **Vercel**: Primary hosting platform with serverless functions
- **Google OAuth**: Authentication service
- **Pinterest API**: For fetching Pinterest images (planned integration, coming soon)

## 4. DevOps & Infrastructure

### 4.1 Hosting & Deployment
- **Vercel**: Primary hosting platform with CI/CD integration
- **Docker**: For containerization of services
- **GitHub Actions**: For automated testing and deployment workflows

### 4.2 Monitoring & Logging
- **Datadog**: For application performance monitoring
- **Prometheus**: For metrics collection
- **Grafana**: For visualization and alerting
- **Logflare**: For centralized logging

### 4.3 Security
- **Helmet.js**: For securing HTTP headers
- **Auth0**: For advanced authentication scenarios
- **reCAPTCHA Enterprise**: For bot protection
- **Snyk**: For vulnerability scanning

## 5. Testing Stack

### 5.1 Testing Frameworks
- **Jest**: For unit and integration testing
- **React Testing Library**: For component testing
- **Cypress**: For end-to-end testing
- **Playwright**: For cross-browser testing

### 5.2 Quality Assurance
- **ESLint**: For code linting
- **Prettier**: For code formatting
- **Husky**: For pre-commit hooks
- **Chromatic**: For visual regression testing

## 6. Development Tools

### 6.1 Code Management
- **Git**: For version control
- **GitHub**: For repository hosting and collaboration
- **Conventional Commits**: For standardized commit messages

### 6.2 Documentation
- **Storybook**: For component documentation
- **Swagger/OpenAPI**: For API documentation
- **TypeDoc**: For TypeScript documentation

## 7. Architecture Patterns

### 7.1 Frontend Architecture
- **Atomic Design**: Component organization methodology
- **Feature-based Structure**: Code organization by feature rather than type
- **Container/Presenter Pattern**: Separation of logic and presentation
- **Server Components**: For optimized data fetching with Next.js
- **Modal-based Login**: Clean, modern login experience
- **Credit Display**: Real-time credit balance in user interface
- **Generation Flow**: Streamlined three-step process for image generation
- **Tabbed Interfaces**: For organizing related features (e.g., image upload methods)
- **Multi-step Forms**: For guided user workflows with numbered indicators
- **Two-column Layout Pattern**: For side-by-side workflows (reference and customization)
- **Card-based UI**: For displaying plans, social media connections, and other grouped items
- **User Profile Management**: Consistent patterns for displaying user information
- **Social Media Integration Framework**: Extensible system for platform connections

### 7.2 Page-specific Architecture Patterns

#### 7.2.1 New Print Ad Page
- **Dual Upload Framework**: Separate flows for reference and product images
- **Tab Navigation Pattern**: Toggle between upload methods (file upload vs Pinterest)
- **Step Indicator Pattern**: Numbered visual flow for guiding users
- **Preview Display Pattern**: Real-time visual feedback for uploaded content
- **Conditional Validation**: Generate button enabled only when all required inputs are provided
- **Prompt Template System**: Pre-defined prompts with customization options

#### 7.2.2 Account Pages
- **User Information Display**: Consistent pattern for showing profile data
- **Initials Avatar System**: Fallback display when no profile image exists
- **Social Connection Grid**: Extensible layout for platform integrations
- **Plan Comparison Cards**: Feature-based comparison between subscription tiers

#### 7.2.3 Placeholder Pages
- **Coming Soon Pattern**: Standardized approach for future features
- **Feedback Collection**: User notification with return options

### 7.3 Backend Architecture
- **Microservices**: For scaling specific components independently
- **API-first Design**: Building around well-defined APIs
- **Event-driven Architecture**: For handling asynchronous processes
- **CQRS Pattern**: For separating read and write operations where needed

## 8. Performance Optimization

### 8.1 Frontend Performance
- **Code Splitting**: To reduce initial load time
- **Image Optimization**: Via Next.js Image component
- **Lazy Loading**: For non-critical resources
- **Service Workers**: For offline capabilities

### 8.2 Backend Performance
- **Redis Caching**: For frequently accessed data
- **Edge Functions**: For globally distributed processing
- **Queue Processing**: For handling intensive operations asynchronously
- **Serverless Functions**: For cost-effective scaling

### 8.3 Credit System Optimization
- **Credit Batching**: Batch credit transactions to reduce database operations
- **Caching Credit Balances**: Optimized balance checking for active users
- **Generation Queueing**: Efficient processing based on server load and user tier

## 9. Scalability Considerations

### 9.1 Database Scaling
- **Connection Pooling**: For efficient database connections
- **Read Replicas**: For scaling read operations
- **Sharding Strategy**: For horizontal scaling of data

### 9.2 AI Processing Scaling
- **Job Queuing**: Using Bull/Redis for processing image generation requests
- **Batch Processing**: For efficient API usage
- **Tiered Processing**: Different processing speeds based on user tier

### 9.3 Credit Economy Scaling
- **Dynamic Pricing**: Ability to adjust credit pricing based on demand
- **Credit Promotion System**: Tools for marketing campaigns and special offers
- **Enterprise Credit Pooling**: For team and organization accounts

## 10. Integration Architecture

```mermaid
graph TD
    A[Next.js Frontend] --> B[Next.js API Routes]
    B --> C[tRPC Router]
    C --> D[Authentication]
    C --> E[User Service]
    C --> F[Ad Service]
    C --> G[Generation Service]
    C --> H[Billing Service]
    G --> I[OpenAI GPT-4o]
    G --> K[Image Processing]
    H --> L[Stripe]
    F --> M[PostgreSQL]
    E --> M
    G --> N[File Storage]
    N --> O[S3/Cloudinary]
    C --> P[Social Media Service (Coming Soon)]
    P --> Q[Platform Connectors]
```

## 11. Development & Production Environments

### 11.1 Local Development
- **Docker Compose**: For local service orchestration
- **Minikube**: For local Kubernetes development
- **Mock Services**: For AI and payment testing

### 11.2 CI/CD Pipeline
- **GitHub Actions**: For automated workflows
- **Vercel Preview Deployments**: For PR previews
- **Semaphore CI**: For more complex testing scenarios

### 11.3 Environments
- **Development**: For ongoing development work
- **Staging**: For pre-release testing
- **Production**: For end users
- **Sandbox**: For integration testing 