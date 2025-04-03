# CraftAds - Application Flow

## Overview

This document outlines the detailed user flow within the CraftAds application, mapping the journey from initial landing to ad generation and beyond.

```mermaid
flowchart TD
    A[Landing Page] --> B[Browse Ads]
    A --> Z[Sign In with Google]
    Z --> B
    B --> C[Select Ad]
    C --> D[Craft Dialog]
    D --> E[Upload Image]
    E --> F[Customize]
    F --> G[Check Credit Balance]
    G --> |Sufficient Credits| H[Generate]
    G --> |Insufficient Credits| P[Purchase Credits]
    P --> H
    H --> I[View Result]
    I --> J[Save/Download]
    I --> K[Share]
    I --> L[Edit Further]
    L --> F
    A --> N[Generations]
    N --> O[View History]
    O --> P[Select Past Generation]
    P --> Q[Re-edit]
    Q --> F
    P --> R[Download]
    P --> S[Share]
    A --> T[Credits]
    T --> U[View Balance]
    T --> V[View History]
    T --> W[Purchase Package]
    A --> X[New Print Ad]
    X --> Y1[Upload Reference Image]
    X --> Y2[Upload Product Image]
    Y1 --> Y3[Choose Prompt]
    Y2 --> Y3[Choose Prompt]
    Y3 --> G
    A --> AC[Account]
    A --> AA[Connected Accounts<br>(Coming Soon)]
    A --> AB[Pricing Plans]
```

## Detailed User Flows

### 1. Homepage & Authentication

#### 1.1 First-time User
1. User lands on homepage
2. Views hero section with value proposition
3. Sees sample ads and success stories
4. Signs in with Google OAuth
5. Upon successful authentication, begins browsing the ad library

#### 1.2 Returning User
1. User lands on homepage or login page
2. If session is expired, clicks "Sign in with Google"
3. Is automatically authenticated via Google
4. Views personalized dashboard with credit balance and recent activities
5. Continues previous activities or starts new workflow

### 2. Authentication Flow

#### 2.1 Google Sign-in Process
1. User clicks "Sign in with Google" button
2. Google OAuth consent screen appears
3. User selects their Google account
4. Upon successful authentication, returns to the application
5. Application creates/updates user profile with Google account information
6. User session is established with NextAuth.js

#### 2.2 Session Management
1. User session is maintained for 24 hours by default
2. Session tokens are stored securely
3. Protected routes check for valid session
4. Sidebar displays user's profile picture and email from Google account
5. Sign out option is available in the user menu

### 3. Credit System

#### 3.1 Credit Status Display
1. Logged-in user views their current credit balance in the sidebar
2. Credit tooltip shows the generation conversion rate (1 credit = 1 generation)
3. Low credit warning appears when balance falls below threshold
4. Credit balance updates in real-time after generations or purchases

#### 3.2 Credit Purchase Flow
1. User navigates to Credits page or clicks "Buy Credits" button when low
2. Views available credit packages with clear pricing information
3. Selects desired package and proceeds to checkout
4. Completes payment through secure payment processor
5. Credits are immediately added to user's account
6. Confirmation and receipt are provided to user

#### 3.3 Credit Usage
1. Each generation attempt checks for sufficient credit balance
2. 1 credit allows for 1 generation attempt
3. Credit is deducted at the start of generation process
4. Failed generations due to technical issues don't consume credits
5. Credit transaction history logs all usage with timestamps and references

### 4. Ad Discovery

#### 4.1 Browsing
1. User navigates through paginated grid of ad cards
2. Each card displays:
   - Ad thumbnail image
   - Industry/category tag
   - Brief description
   - Success metrics (optional)

#### 4.2 Filtering & Search
1. User can filter ads by:
   - Industry/vertical
   - Ad format/dimensions
   - Style/aesthetic
   - Performance metrics
2. User can search by:
   - Keywords
   - Brands
   - Visual elements
   - Campaign types

#### 4.3 Ad Selection
1. User hovers over ad card to see "Craft this" button
2. Clicks on an ad card
3. Craft dialog opens with full ad preview and customization options

### 5. Ad Crafting

#### 5.1 Ad Preview
1. User sees original ad displayed prominently on left side of modal
2. Customization panel appears on right side
3. Information about the ad's success metrics may be displayed

#### 5.2 Image Upload
1. User can upload their image through:
   - Drag and drop interface
   - File browser button
   - Previously uploaded images (for returning users)
2. Preview of uploaded image appears
3. Option to remove or replace image

#### 5.3 Text Customization
1. User can edit headline/main text
2. Can adjust secondary copy text
3. Can modify call-to-action text
4. Can change text styling (limited options)

#### 5.4 Advanced Customization
1. User can enter custom prompts for AI guidance
2. Can specify brand guidelines/colors
3. Can adjust layout preferences (where applicable)

#### 5.5 Model Selection
1. User selects GPT-4o as the AI model for generation
2. Brief description explains its capabilities for creative text and diverse styles

#### 5.6 Generation Process
1. User clicks "Generate Ad" button
2. System validates credit balance (minimum 1 credit required)
3. If sufficient, credit transaction is created and generation begins
4. Loading/processing indicator appears
5. Backend processes request through GPT-4o
6. Result is displayed to user, using 1 credit for the generation

### 6. Result Management

#### 6.1 Result Review
1. User views the generated ad
2. Can compare with original template
3. Can make additional adjustments if needed

#### 6.2 Saving & Downloading
1. Generation is automatically saved to user's history
2. User can download in various formats:
   - JPG/PNG for digital use
   - PDF for print
   - Social media-optimized versions

#### 6.3 Sharing
1. User can share via:
   - Direct link
   - Email
   - Social media platforms
   - Team collaboration tools (for business users)

### 7. Generation History

#### 7.1 History Browsing
1. User navigates to Generations page
2. Views chronological list/grid of past generations
3. Can filter by date, project, or ad type

#### 7.2 Generation Management
1. User can view full details of any past generation
2. Can duplicate a generation as starting point for new ad
3. Can re-edit any past generation
4. Can organize generations into collections/projects
5. Can delete unwanted generations

### 8. Account Management

#### 8.1 Profile Settings
1. User can view and edit profile information
2. Can manage subscription/billing details
3. Can set preferences for generation defaults

#### 8.2 Usage Tracking
1. User can view generation credits remaining
2. Can see usage statistics
3. Can upgrade subscription if needed

### 9. Pricing & Subscription

#### 9.1 Plan Selection
1. User views available subscription tiers
2. Compares features and limitations
3. Selects appropriate plan
4. Completes payment process

#### 9.2 Billing Management
1. User can view billing history
2. Can update payment methods
3. Can change subscription tier
4. Can cancel subscription

### 10. New Print Ad Creation

#### 10.1 Creating a New Print Ad
1. User clicks on "New Print Ad" in the sidebar
2. Views two-column interface for ad creation
3. Left side: For reference image upload/selection
   - Can upload directly or import from Pinterest
   - Preview of the selected reference image is displayed
4. Right side: For customization
   - Upload product image to be featured in the ad
   - Choose prompt type (Custom, Product Replacement, Style Transfer)
   - Customize prompt text based on selected template
5. User views credit cost information (1 credit per generation)
6. Clicks "Generate Ad" button
7. System validates that both reference and product images are provided
8. Generated ad is added to the user's generation history

#### 10.2 Reference Image Selection
1. User has two tab options:
   - Upload Image: Direct upload from local device
   - Pinterest Link: Import from Pinterest URL
2. For local upload:
   - Drag and drop functionality
   - Click to browse files
   - Preview displayed after selection
3. For Pinterest:
   - Enter Pinterest pin URL
   - System fetches the image
   - Preview displayed after successful import

#### 10.3 Product Image Upload
1. User uploads their product image
2. Preview displayed immediately
3. Option to remove and upload different image

#### 10.4 Prompt Selection
1. User selects prompt type from dropdown
2. Default template text is provided based on selection
3. User can customize prompt text further
4. System uses this prompt to guide the AI generation

### 11. Account Management Pages

#### 11.1 Account Page
1. User navigates to Account page from sidebar or profile menu
2. Views personal information:
   - Profile avatar with initials
   - User's name
   - Email address
   - Membership information (Free Plan)
   - Member since date
3. Can navigate to Pricing page to change plan

#### 11.2 Connected Accounts (Coming Soon)
1. User navigates to Connected Accounts page
2. Views "Coming Soon" banner prominently displayed at the top
3. Sees a preview grid of social media platforms that will be available:
   - Instagram, Twitter, Facebook, LinkedIn, Pinterest, TikTok
4. Each platform card shows a disabled "Connect" button with a coming soon indicator
5. Information about the future functionality is provided:
   - Direct publishing to social platforms
   - Content optimization for each platform
   - Analytics integration
6. User can sign up for notifications when the feature becomes available

#### 11.3 Pricing Plans
1. User navigates to Plans page
2. Views available subscription options:
   - Free: Basic features with limited generations
   - Pro: Enhanced features with more generations
   - Business: Complete feature set with unlimited generations
3. Each plan displays:
   - Monthly price
   - Core features
   - Limitations
   - Upgrade button (if applicable)
4. Current plan is clearly indicated

## Error Handling Flows

### E1. Upload Errors
1. User attempts to upload invalid file type
2. Error message displays with accepted file types
3. User is prompted to try again with correct file

### E2. Generation Failures
1. If generation fails due to content policy violation:
   - User receives specific feedback on violation
   - Suggested modifications are provided
2. If generation fails due to technical issues:
   - Error is logged
   - User is prompted to try again
   - Alternative model may be suggested

### E3. Connectivity Issues
1. App detects offline status
2. User is notified of connection issues
3. Unsaved work is preserved locally where possible
4. Automatic retry when connection is restored

### E4. Credit-Related Errors
1. Insufficient credits for generation:
   - User receives clear notification
   - Options to purchase credits are presented
   - Current work is preserved
2. Failed credit purchase:
   - Error details are displayed
   - Alternative payment methods suggested
   - Support contact information provided 