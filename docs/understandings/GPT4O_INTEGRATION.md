# GPT-4o Integration Plan

## Overview

This document outlines our approach to integrating GPT-4o for image generation in the CraftAds application. Since the GPT-4o API is not yet fully available, we've implemented a modular architecture that allows us to develop and test the application with mock data now, while making it easy to switch to the real API when it becomes available.

## Architecture

### Service Abstraction Layer

We've created a service abstraction layer that decouples the application from the specific AI implementation:

```
src/services/ai/
├── aiServiceFactory.ts    # Factory that provides the appropriate AI service
├── gpt4oAIService.ts      # Placeholder for the real GPT-4o implementation
├── mockAIService.ts       # Mock implementation for development
├── promptService.ts       # Service for handling prompt templates
├── types.ts               # Interface definitions
└── utils.ts               # Utility functions
```

### Key Interfaces

The core of the abstraction is the `AIServiceInterface`:

```typescript
export interface AIServiceInterface {
  // Main generation method
  generateAdFromImages(input: GenerationInput): Promise<GenerationResult>;
  
  // Check if service is available (useful for health checks)
  isAvailable(): Promise<boolean>;
  
  // Get information about the current model/service
  getModelInfo(): Promise<{
    name: string;
    version: string;
    capabilities: string[];
    creditCost: number;
  }>;
}
```

### Factory Pattern

We use a factory pattern to provide the appropriate service implementation:

```typescript
export enum AIServiceType {
  MOCK = 'mock',
  GPT4O = 'gpt4o',
}

// Get the service based on environment config or explicit parameter
public getService(type: AIServiceType = AIServiceType.MOCK): AIServiceInterface {
  // Default to mock service for now
  return this.serviceInstances.get(type) || this.serviceInstances.get(AIServiceType.MOCK)!;
}
```

## Mock Implementation

For development and testing, we've created a mock AI service that:

1. Returns predefined images from `/images/mock_generations/`
2. Simulates processing delay
3. Occasionally fails (10% of the time) to test error handling
4. Mimics the expected API response format

```typescript
async generateAdFromImages(input: GenerationInput): Promise<GenerationResult> {
  // Validate inputs
  // Simulate processing delay
  // Occasionally fail to test error handling
  // Return a mock result with randomly selected image
}
```

## Frontend Integration

The frontend integration includes:

1. **New Ad Creation Page** - Collects user inputs (reference image, product image, and prompt)
2. **Generation API Endpoint** - Validates inputs, checks credit balance, calls the AI service
3. **Generations History Page** - Displays the user's previous generations

## API Endpoints

We've created several API endpoints for the generation flow:

- `/api/generate` - Main endpoint for generating ad images
- `/api/generations/record` - Records generation history
- `/api/generations/history` - Retrieves paginated generation history
- `/api/credits/validate` - Validates credit balance before generation
- `/api/credits/deduct` - Deducts credits after successful generation

## Prompt System

We've created a flexible prompt system that:

1. Provides template prompts for common use cases
2. Allows for custom prompts
3. Supports variable substitution in templates
4. Enhances prompts with context about the images

## Transition Plan to Real GPT-4o API

When the GPT-4o API becomes available, we'll need to:

1. **Implement the GPT4oAIService**:
   - Update the placeholder implementation with real API calls
   - Configure authentication and endpoint settings
   - Handle API-specific errors and rate limiting

2. **Update the Service Factory**:
   - Switch the default service to GPT4o
   - Add environment configuration for API keys
   - Implement proper availability checking

3. **Test and Optimize**:
   - Test the integration with real API calls
   - Optimize prompt engineering for best results
   - Implement caching and cost optimization strategies

4. **Enhance Monitoring**:
   - Add observability for API performance
   - Track usage metrics and costs
   - Set up alerting for API issues

## Current Limitations

- The mock implementation doesn't actually generate new images based on the inputs
- The prompt engineering is simplified compared to what will be needed for the real API
- Error handling may need enhancement for real API-specific errors
- Cost optimization strategies are not yet implemented

## Next Steps

1. Monitor OpenAI announcements for GPT-4o API availability
2. Keep the mock implementation up-to-date with UI changes
3. Begin implementing the real service as soon as the API is available
4. Gradually transition from mock to real implementation, starting with test environments

## Resources

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [GPT-4o Announcements](https://openai.com/blog/) 