import { formatPromptTemplate } from './utils';

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  placeholders: string[];
  defaultValues: Record<string, string>;
}

// Collection of prompt templates for different styles
export const promptTemplates: PromptTemplate[] = [
  {
    id: 'product-integration',
    name: 'Product Integration',
    description: 'Integrate your product into the reference ad style',
    template: 'Create a new advertisement that follows the style, layout, and aesthetic of the reference ad, but replace the main product with my product. Maintain the overall look and feel, color scheme, and typography style of the reference ad. Make sure my product is the focal point of the new ad.',
    placeholders: [],
    defaultValues: {}
  },
  {
    id: 'style-transfer',
    name: 'Style Transfer',
    description: 'Transfer the visual style to your product',
    template: 'Create a new advertisement featuring my product using the visual style, color palette, and design elements of the reference ad. Adapt the composition to best showcase my product while maintaining the artistic direction of the reference.',
    placeholders: [],
    defaultValues: {}
  },
  {
    id: 'brand-adaptation',
    name: 'Brand Adaptation',
    description: 'Adapt your brand message in this style',
    template: 'Create a new advertisement for my product that uses the design language and layout approach of the reference ad, but update it to reflect my product\'s unique features. Include the tagline: "{tagline}" in a way that integrates well with the design.',
    placeholders: ['tagline'],
    defaultValues: {
      tagline: 'Experience the difference'
    }
  },
  {
    id: 'seasonal-theme',
    name: 'Seasonal Theme',
    description: 'Create a seasonal variation in this style',
    template: 'Create a {season}-themed advertisement for my product, inspired by the design style of the reference ad. Incorporate seasonal elements and colors while maintaining the visual language of the reference.',
    placeholders: ['season'],
    defaultValues: {
      season: 'summer'
    }
  },
  {
    id: 'custom',
    name: 'Custom Instructions',
    description: 'Write your own specific instructions',
    template: '{customInstructions}',
    placeholders: ['customInstructions'],
    defaultValues: {
      customInstructions: 'Create a new advertisement that features my product, inspired by the reference ad.'
    }
  }
];

export class PromptService {
  /**
   * Gets all available prompt templates
   */
  getPromptTemplates(): PromptTemplate[] {
    return promptTemplates;
  }
  
  /**
   * Gets a specific prompt template by ID
   */
  getPromptTemplate(id: string): PromptTemplate | undefined {
    return promptTemplates.find(template => template.id === id);
  }
  
  /**
   * Formats a prompt template with the provided values
   */
  formatPrompt(templateId: string, values: Record<string, string>): string {
    const template = this.getPromptTemplate(templateId);
    if (!template) {
      throw new Error(`Prompt template with ID '${templateId}' not found`);
    }
    
    // Merge default values with provided values
    const mergedValues = { ...template.defaultValues, ...values };
    
    return formatPromptTemplate(template.template, mergedValues);
  }
  
  /**
   * Enhances a prompt with additional context about the images
   */
  enhancePrompt(prompt: string, referenceImageDesc?: string, productImageDesc?: string): string {
    let enhancedPrompt = prompt;
    
    if (referenceImageDesc) {
      enhancedPrompt += `\n\nThe reference ad shows: ${referenceImageDesc}`;
    }
    
    if (productImageDesc) {
      enhancedPrompt += `\n\nMy product image shows: ${productImageDesc}`;
    }
    
    return enhancedPrompt;
  }
}

// Export a singleton instance
export const promptService = new PromptService(); 