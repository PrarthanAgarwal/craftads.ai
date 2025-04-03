/**
 * Utility functions for AI service operations
 */

/**
 * Converts a file to a base64 data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Extracts the base64 data from a data URL (removes the prefix)
 */
export function extractBase64FromDataUrl(dataUrl: string): string {
  const base64Data = dataUrl.split(',')[1];
  return base64Data;
}

/**
 * Converts an image URL to a base64 string (client-side only)
 */
export async function imageUrlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Validates if a string is a valid base64 image
 */
export function isValidBase64Image(base64String: string): boolean {
  // Check if it's a data URL
  if (base64String.startsWith('data:image/')) {
    return true;
  }
  
  // Check if it's a raw base64 string (without data URL prefix)
  try {
    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64String);
  } catch (e) {
    return false;
  }
}

/**
 * Creates a placeholder image URL for testing
 */
export function createPlaceholderImageUrl(width = 800, height = 600, text = 'Placeholder'): string {
  return `https://via.placeholder.com/${width}x${height}.png?text=${encodeURIComponent(text)}`;
}

/**
 * Formats prompt templates with dynamic values
 */
export function formatPromptTemplate(template: string, values: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
} 