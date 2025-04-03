# CraftAds - API Documentation

## Overview

This document outlines the API endpoints for the CraftAds application, providing details on request/response formats, authentication, and error handling.

## Base URL

- Development: `https://api-dev.craftads.app`
- Production: `https://api.craftads.app`
- Staging: `https://api-staging.craftads.app`

## API Versioning

All endpoints are prefixed with the API version: `/api/v1/`

## Authentication

### Authentication Methods

The API supports the following authentication methods:

1. **NextAuth.js Session**
   - Obtained via Google OAuth authentication process
   - Session cookies are used for authenticated requests in the application
   - Default expiration: 24 hours

2. **JWT Bearer Token**
   - Included in the `Authorization` header: `Bearer {token}`
   - Used for programmatic API access
   - Secure, short-lived tokens

### Authentication Endpoints

#### Google OAuth Authentication

The application uses NextAuth.js with Google OAuth provider. The main endpoints are:

```
GET/POST /api/auth/signin
GET/POST /api/auth/signout
GET/POST /api/auth/session
GET/POST /api/auth/csrf
GET/POST /api/auth/providers
GET/POST /api/auth/callback/google
```

These endpoints are managed by NextAuth.js and handle the full OAuth flow with Google.

#### Register User

```
POST /api/v1/auth/register
```

Request:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  }
}
```

#### Login

```
POST /api/v1/auth/login
```

Request:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires": "2023-12-31T23:59:59Z",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

#### Refresh Token

```
POST /api/v1/auth/refresh
```

Request:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires": "2023-12-31T23:59:59Z"
  }
}
```

#### Logout

```
POST /api/v1/auth/logout
```

Response:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Ad Template Endpoints

### List Templates

```
GET /api/v1/templates
```

Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)
- `industry`: Filter by industry
- `style`: Filter by style
- `campaign`: Filter by campaign type
- `search`: Search term
- `sortBy`: Sort field (default: "featured")
- `order`: Sort order (default: "desc")

Response:
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Summer Fashion Sale",
        "description": "High-converting fashion sale template",
        "thumbnailUrl": "https://assets.craftads.app/thumbnails/550e8400.jpg",
        "industry": "fashion",
        "style": "minimalist",
        "campaignType": "sale",
        "metrics": {
          "ctr": 4.2,
          "conversionRate": 2.8
        }
      },
      // More templates...
    ],
    "pagination": {
      "total": 156,
      "page": 1,
      "limit": 20,
      "pages": 8
    }
  }
}
```

### Get Template Details

```
GET /api/v1/templates/{templateId}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Summer Fashion Sale",
    "description": "High-converting fashion sale template with clean layout and strong call-to-action. Perfect for seasonal promotions.",
    "thumbnailUrl": "https://assets.craftads.app/thumbnails/550e8400.jpg",
    "originalImageUrl": "https://assets.craftads.app/originals/550e8400.jpg",
    "width": 1200,
    "height": 628,
    "format": "jpg",
    "industry": "fashion",
    "style": "minimalist",
    "campaignType": "sale",
    "metrics": {
      "ctr": 4.2,
      "conversionRate": 2.8,
      "impressions": 1250000,
      "engagementRate": 3.5
    },
    "categories": [
      {
        "id": "33e8400-e29b-41d4-a716-4466554400aa",
        "name": "Fashion"
      },
      {
        "id": "44e8400-e29b-41d4-a716-4466554400bb",
        "name": "Sale"
      }
    ],
    "metadata": {
      "textAreas": [
        {
          "id": "headline",
          "default": "Summer Sale",
          "position": {"x": 50, "y": 30},
          "maxLength": 20
        },
        {
          "id": "subheading",
          "default": "Up to 50% off",
          "position": {"x": 50, "y": 45},
          "maxLength": 30
        }
      ],
      "imageAreas": [
        {
          "id": "product",
          "position": {"x": 50, "y": 70},
          "width": 500,
          "height": 300
        }
      ]
    }
  }
}
```

## Generation Endpoints

### Create Image Generation

```
POST /api/v1/generations/create
```

Request:
```json
{
  "templateId": "550e8400-e29b-41d4-a716-446655440000",
  "aiModel": "gpt4o",
  "userImages": [
    {
      "url": "https://user-uploads.craftads.app/images/550e8400.jpg",
      "position": "primary"
    }
  ],
  "textCustomizations": {
    "headline": "Summer Sale Now On",
    "subheading": "Up to 50% off all items"
  },
  "customPrompt": "Make it look vibrant and summery with a beach theme."
}
```

Response:
```json
{
  "success": true,
  "data": {
    "generationId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "processing",
    "estimatedTime": 15,
    "creditsUsed": 1,
    "remainingCredits": 149
  }
}
```

### Get Generation Status

```
GET /api/v1/generations/{generationId}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "77e8400-e29b-41d4-a716-4466554400dd",
    "status": "completed",
    "resultImageUrl": "https://assets.craftads.app/results/77e8400.jpg",
    "aiModel": "gpt-4o",
    "processingTime": 13245,
    "createdAt": "2023-09-15T14:32:21Z"
  }
}
```

### List User Generations

```
GET /api/v1/generations
```

Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)
- `status`: Filter by status (completed, pending, failed)
- `model`: Filter by AI model
- `sortBy`: Sort field (default: "createdAt")
- `order`: Sort order (default: "desc")

Response:
```json
{
  "success": true,
  "data": {
    "generations": [
      {
        "id": "77e8400-e29b-41d4-a716-4466554400dd",
        "templateId": "550e8400-e29b-41d4-a716-446655440000",
        "templateName": "Summer Fashion Sale",
        "resultImageUrl": "https://assets.craftads.app/results/77e8400.jpg",
        "status": "completed",
        "aiModel": "gpt-4o",
        "createdAt": "2023-09-15T14:32:21Z"
      },
      // More generations...
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

## Asset Upload Endpoints

### Get Upload URL

```
POST /api/v1/assets/upload-url
```

Request:
```json
{
  "fileName": "product-image.jpg",
  "contentType": "image/jpeg",
  "purpose": "generation"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://assets.craftads.app/upload?token=abc123...",
    "assetId": "66e8400-e29b-41d4-a716-4466554400cc",
    "expiresAt": "2023-09-15T15:32:21Z"
  }
}
```

### Complete Upload

```
POST /api/v1/assets/complete
```

Request:
```json
{
  "assetId": "66e8400-e29b-41d4-a716-4466554400cc"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "66e8400-e29b-41d4-a716-4466554400cc",
    "url": "https://assets.craftads.app/uploads/66e8400.jpg",
    "fileName": "product-image.jpg",
    "mimeType": "image/jpeg",
    "sizeBytes": 245678
  }
}
```

## User Endpoints

### Get User Profile

```
GET /api/v1/user/profile
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatarUrl": "https://assets.craftads.app/avatars/550e8400.jpg",
    "createdAt": "2023-01-15T10:30:00Z",
    "subscription": {
      "plan": "pro",
      "status": "active",
      "expiresAt": "2023-12-31T23:59:59Z",
      "creditsRemaining": 250
    },
    "preferences": {
      "defaultAiModel": "gpt-4o",
      "uiPreferences": {
        "darkMode": false,
        "gridView": true
      }
    }
  }
}
```

### Update User Profile

```
PATCH /api/v1/user/profile
```

Request:
```json
{
  "firstName": "Jonathan",
  "lastName": "Doe",
  "preferences": {
    "defaultAiModel": "gpt-4o"
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "firstName": "Jonathan",
    "lastName": "Doe",
    "preferences": {
      "defaultAiModel": "gpt-4o"
    }
  }
}
```

## Subscription Endpoints

### Get Subscription Plans

```
GET /api/v1/subscriptions/plans
```

Response:
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "88e8400-e29b-41d4-a716-4466554400ee",
        "name": "Free",
        "description": "Basic access with limited generations",
        "price": 0,
        "billingPeriod": "monthly",
        "generationCredits": 5,
        "hasWatermark": true,
        "features": [
          "Access to 100 templates",
          "Limited generation quality",
          "Watermarked results"
        ]
      },
      {
        "id": "99e8400-e29b-41d4-a716-4466554400ff",
        "name": "Pro",
        "description": "Professional features for creators",
        "price": 19.99,
        "billingPeriod": "monthly",
        "generationCredits": 250,
        "hasWatermark": false,
        "features": [
          "Access to all templates",
          "High-quality generations",
          "No watermarks",
          "Priority processing"
        ]
      }
    ]
  }
}
```

### Create Subscription

```
POST /api/v1/subscriptions
```

Request:
```json
{
  "planId": "99e8400-e29b-41d4-a716-4466554400ff",
  "paymentMethod": {
    "type": "card",
    "token": "pm_card_visa_123456"
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "subscriptionId": "sub_1234567890",
    "plan": "Pro",
    "status": "active",
    "startDate": "2023-09-15T00:00:00Z",
    "endDate": "2023-10-15T00:00:00Z",
    "creditsRemaining": 250
  }
}
```

### Cancel Subscription

```
POST /api/v1/subscriptions/cancel
```

Response:
```json
{
  "success": true,
  "message": "Subscription will be canceled at the end of the billing period",
  "data": {
    "subscriptionId": "sub_1234567890",
    "endDate": "2023-10-15T00:00:00Z"
  }
}
```

## Category Endpoints

### List Categories

```
GET /api/v1/categories
```

Response:
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "33e8400-e29b-41d4-a716-4466554400aa",
        "name": "Fashion",
        "description": "Fashion and apparel advertisements",
        "icon": "tshirt"
      },
      {
        "id": "44e8400-e29b-41d4-a716-4466554400bb",
        "name": "Sale",
        "description": "Promotional sale advertisements",
        "icon": "tag"
      },
      // More categories...
    ]
  }
}
```

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource could not be found",
    "details": {
      "resourceType": "template",
      "resourceId": "550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required or invalid credentials |
| `FORBIDDEN` | 403 | Permission denied |
| `RESOURCE_NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Invalid request parameters |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INSUFFICIENT_CREDITS` | 402 | Insufficient generation credits |
| `GENERATION_FAILED` | 500 | Generation process failed |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

## Rate Limiting

API requests are subject to rate limiting:

- Anonymous requests: 30 requests per minute
- Authenticated requests: 60 requests per minute
- Generation endpoints: 10 requests per minute

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1631234567
```

## Webhooks

### Generation Completed Webhook

When a generation is completed, a webhook notification can be sent to a specified URL.

Payload:
```json
{
  "event": "generation.completed",
  "generationId": "77e8400-e29b-41d4-a716-4466554400dd",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "resultImageUrl": "https://assets.craftads.app/results/77e8400.jpg",
  "timestamp": "2023-09-15T14:35:21Z"
}
```

### Configure Webhooks

```
POST /api/v1/webhooks
```

Request:
```json
{
  "url": "https://example.com/webhook",
  "events": ["generation.completed", "generation.failed"],
  "secret": "whsec_abcdefg123456789"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "wh_1234567890",
    "url": "https://example.com/webhook",
    "events": ["generation.completed", "generation.failed"],
    "createdAt": "2023-09-15T14:32:21Z"
  }
}
```

## SDK Support

Official client libraries are available for:
- JavaScript/TypeScript
- Python
- PHP
- Ruby

Example (JavaScript):

```javascript
import { CraftAdsClient } from '@craftads/sdk';

const client = new CraftAdsClient({
  apiKey: 'your_api_key',
  environment: 'production'
});

// Create a generation
const generation = await client.generations.create({
  templateId: '550e8400-e29b-41d4-a716-446655440000',
  aiModel: 'gpt-4o',
  customizations: {
    text: {
      headline: 'Winter Collection',
    },
    prompt: 'Winter fashion ad with snowy background'
  },
  uploadedAssetId: '66e8400-e29b-41d4-a716-4466554400cc'
});

console.log(`Generation created: ${generation.id}`);
```

## Credit System Endpoints

### Get User Credit Balance

```
GET /api/v1/credits/balance
```

Response:
```json
{
  "success": true,
  "data": {
    "credits": 50,
    "lastUpdated": "2023-12-31T23:59:59Z"
  }
}
```

### Get Credit Transaction History

```
GET /api/v1/credits/history
```

Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)
- `type`: Filter by transaction type (purchase, usage, refund, etc.)
- `startDate`: Filter by date range start
- `endDate`: Filter by date range end

Response:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "type": "purchase",
        "amount": 50,
        "description": "Purchased Starter Package",
        "balanceAfter": 150,
        "timestamp": "2023-12-31T23:59:59Z",
        "referenceId": "payment_550e8400",
        "referenceType": "payment"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "type": "usage",
        "amount": -1,
        "description": "Image generation",
        "balanceAfter": 149,
        "timestamp": "2024-01-01T12:30:45Z",
        "referenceId": "generation_550e8400",
        "referenceType": "generation"
      }
      // More transactions...
    ],
    "pagination": {
      "total": 156,
      "page": 1,
      "limit": 20,
      "pages": 8
    }
  }
}
```

### List Available Credit Packages

```
GET /api/v1/credits/packages
```

Response:
```json
{
  "success": true,
  "data": {
    "packages": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Starter Package",
        "description": "Perfect for beginners",
        "creditAmount": 50,
        "price": 19.99,
        "currency": "USD",
        "isFeatured": false,
        "equivalentGenerations": 150
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Pro Package",
        "description": "Best value for regular users",
        "creditAmount": 200,
        "price": 69.99,
        "currency": "USD",
        "isFeatured": true,
        "equivalentGenerations": 600
      }
      // More packages...
    ]
  }
}
```

### Purchase Credits

```
POST /api/v1/credits/purchase
```

Request:
```json
{
  "packageId": "550e8400-e29b-41d4-a716-446655440000",
  "paymentMethod": "card"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "transactionId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "pending",
    "redirectUrl": "https://payment.processor.com/checkout/12345",
    "paymentSessionId": "session_12345"
  }
}
```

### Complete Credit Purchase

```
POST /api/v1/credits/purchase/complete
```

Request:
```json
{
  "paymentSessionId": "session_12345"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "transactionId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "creditsPurchased": 50,
    "newBalance": 150,
    "receiptUrl": "https://api.craftads.app/receipts/550e8400"
  }
}
``` 