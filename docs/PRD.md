# CraftAds - Product Requirements Document

## 1. Overview

CraftAds is a static advertising generation platform that allows users to craft beautiful ads by customizing proven templates with their own images using AI technology. The platform features a curated collection of the best 10,000 ads across various industries, providing users with proven templates to adapt for their own needs.

## 2. Target Audience

- Marketing professionals
- Small business owners
- Content creators
- Social media managers
- Design teams at agencies
- Entrepreneurs with limited design resources

## 3. Problem Statement

Creating effective advertisements is challenging, time-consuming, and often expensive. Many businesses:
- Lack design expertise
- Have limited budgets for professional design services
- Don't know what design elements make an ad successful
- Need to produce high-quality visual content quickly

## 4. Solution

CraftAds allows users to:
1. Sign in quickly and securely with Google authentication
2. Browse a curated library of successful ads from top brands
3. Select ads that match their industry or aesthetic preferences
4. Upload their own product/brand images
5. Use GPT-4o to remix the ad with their uploaded content
6. Generate professional-quality advertising within minutes
7. Purchase credits to enable more generations (1 credit = 1 generation)
8. Save and export results for immediate use

## 5. Key Features

### 5.1 Ad Library
- Collection of 10,000 top-performing ads across industries
- Categorization and filtering options
- Search functionality
- Performance metrics for each ad

### 5.2 Ad Crafting
- Simple three-step process: select ad > upload image > generate ad
- AI-powered customization using GPT-4o
- Text editing capabilities
- Custom prompt input for fine-tuning results

### 5.3 Generations
- History of all generated ads
- Ability to revisit and re-edit previous generations
- Download options in multiple formats
- Sharing capabilities
- "Coming Soon" indicator for initial release

### 5.4 User Account & Credit System
- Google authentication for quick, secure sign-in
- Credit-based generation system (1 credit = 1 generation)
- Various credit packages available for purchase
- Transaction history for tracking credit usage
- Credit balance displayed prominently in the UI

### 5.5 New Print Ad Creation
- Dedicated page for creating print advertisements
- Dual image upload functionality:
  - Reference image upload (inspiration)
  - Product image upload (to be featured)
- Pinterest integration for importing reference images
- Multiple prompt types with customizable templates
- Real-time previews of uploaded images
- Clear credit cost indication (1 credit per generation)

### 5.6 Account Management
- Profile page displaying user information
- Avatar with user initials for consistent visual identity
- Email and membership details display
- Member since date information

### 5.7 Connected Accounts (Coming Soon)
- Social media platform integration management
- Support for multiple platforms (Instagram, Twitter, Facebook, LinkedIn, Pinterest, TikTok)
- Connection status indicators
- Future feature with implementation planned for upcoming release
- Visual placeholders with "Coming Soon" notifications for user awareness

### 5.8 Pricing Plans
- Tiered subscription options (Free, Pro, Business)
- Clear feature comparison between plans
- Pricing transparency with monthly cost
- Prominent upgrade buttons
- Current plan indication

## 6. User Flows

### 6.1 Ad Discovery
1. User navigates to the home page
2. Browses the curated collection of ads
3. Filters by industry, style, or performance metrics
4. Selects an ad to craft

### 6.2 Ad Crafting
1. User clicks on an ad card
2. Views the original ad in a modal
3. Uploads their image (drag-and-drop or file browser)
4. Optionally adds/edits text and custom prompt
5. System validates user has sufficient credits
6. Clicks "Generate Ad" button
7. System deducts 1 credit for each generation
8. Views and downloads the resulting ad

### 6.3 Credit Management
1. User views their current credit balance in the sidebar
2. Navigates to the Credits page when they need more
3. Selects from available credit packages
4. Completes payment via integrated payment processor
5. Credits are immediately added to their account
6. User can view complete transaction history

### 6.4 Authentication Flow
1. User clicks "Sign In" button
2. Is presented with Google sign-in option
3. Authenticates through Google OAuth
4. Returns to the application with active session
5. User information and credit balance is displayed in the UI

### 6.5 New Print Ad Creation
1. User clicks "New Print Ad" in the sidebar navigation
2. Views two-column interface for ad creation:
   - Left: Reference image section
   - Right: Customization section
3. In the reference image section:
   - Selects between upload or Pinterest import tabs
   - Uploads or imports an inspirational ad design
   - Preview displays selected reference image
4. In the customization section:
   - Uploads their product image (Step 1)
   - Selects prompt type from dropdown (Step 2)
   - Customizes prompt text based on template
5. Reviews credit cost indication
6. Clicks "Generate Ad" button after providing both images
7. Views generated ad and can download or share

### 6.6 Account Management
1. User clicks on their profile icon or "Account" in dropdown
2. Views personal account information:
   - Profile avatar with initials
   - Name and email details
   - Plan information
3. Can click "Change Plan" to navigate to pricing page

### 6.7 Connected Accounts Management
1. User navigates to "Connected Accounts" page
2. Views grid of available social media platforms
3. Sees "Coming Soon" notification
4. (Future) Can connect accounts for direct publishing of ads

### 6.8 Pricing Plan Selection
1. User navigates to "Plans" page
2. Views three-tier pricing structure:
   - Free: Basic features
   - Pro: Enhanced features ($29/month)
   - Business: Advanced features ($99/month)
3. Compares features across plans
4. Selects appropriate plan based on needs
5. Current plan is indicated with disabled button

## 7. Technical Requirements

### 7.1 Frontend
- React/Next.js for the user interface
- Responsive design for all device sizes
- Optimized image handling
- Real-time previews where possible

### 7.2 Backend
- API endpoints for image processing
- Integration with GPT-4o
- Google OAuth authentication via NextAuth.js
- Supabase database for user and credit management
- Credit transaction system with robust error handling
- Storage solutions for user uploads and generations

### 7.3 AI Integration
- OpenAI GPT-4o API integration
- Credit-based access control
- Prompt engineering for optimal results
- Result caching to improve performance and reduce credit usage

### 7.4 Credit System
- Secure credit purchase workflow
- Credit usage tracking and validation
- Clear user interfaces for viewing credit balance
- Admin tools for managing and monitoring credit economy

## 8. Success Metrics

- User sign-up rate via Google OAuth
- Number of ads remixed per user
- Average credit purchase amount
- Credit usage patterns (time of day, frequency)
- Conversion rate (browsing to generation)
- User retention and repeat usage
- Credit repurchase rate

## 9. Future Enhancements

### 9.1 Credit System Enhancements
- Subscription model alongside credit purchases
- Credit rewards for user actions (referrals, daily logins)
- Credit usage analytics for users
- Advanced purchasing options (bulk discounts, promotions)

### 9.2 Additional Authentication Methods
- Email/password authentication
- Additional OAuth providers (Apple, Microsoft, etc.)
- Enterprise SSO options

### 9.3 Social Media Integration (Coming Soon)
- Full implementation of social media connections planned for future release
- Direct publishing to connected platforms from within the application
- Platform-specific ad size templates optimized for each network
- Engagement tracking for published ads
- API integrations with major social platforms

### 9.4 Enhanced Ad Creation Tools
- Multi-product ad layouts
- Brand kit integration
- Ad template creation tools
- Animation options for dynamic ads

## 10. Timeline

### Phase 1: MVP (Month 1-2)
- Basic UI implementation
- Core remix functionality with one AI model
- Limited ad library (1,000 ads)
- Essential user accounts

### Phase 2: Enhancement (Month 3-4)
- Full ad library (10,000 ads)
- Multiple AI model options
- Advanced filtering and search
- Improved generation quality

### Phase 3: Monetization (Month 5-6)
- Subscription implementation
- Advanced user management
- Analytics integration
- Export options

### Phase 4: Expansion (Month 7+)
- Additional AI model integrations
- Advanced customization features
- Enterprise capabilities
- Partner integrations 