import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAIService } from '@/services/ai/aiServiceFactory';
import { promptService } from '@/services/ai/promptService';
import { GenerationInput } from '@/services/ai/types';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { 
      referenceImage, 
      productImage, 
      promptTemplate, 
      promptValues = {},
      width = 1024,
      height = 1024
    } = body;

    // Validate required fields
    if (!referenceImage || !productImage || !promptTemplate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: referenceImage, productImage, and promptTemplate are required' },
        { status: 400 }
      );
    }
    
    // Format the prompt using the prompt service
    let formattedPrompt;
    try {
      formattedPrompt = promptService.formatPrompt(promptTemplate, promptValues);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: `Invalid prompt template: ${error.message}` },
        { status: 400 }
      );
    }

    // Check credit balance
    const creditCheckRes = await fetch(`${req.nextUrl.origin}/api/credits/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        requiredCredits: 1,
        operation: 'generation' 
      })
    });
    
    const creditCheck = await creditCheckRes.json();
    
    if (!creditCheck.success) {
      return NextResponse.json(
        { success: false, error: creditCheck.error || 'Insufficient credits' },
        { status: 403 }
      );
    }

    // Get the AI service and generate the ad
    const aiService = getAIService();
    
    const input: GenerationInput = {
      referenceImage,
      productImage,
      prompt: formattedPrompt,
      userId: session.user.id || session.user.email || 'anonymous',
      width,
      height
    };
    
    const result = await aiService.generateAdFromImages(input);
    
    // If generation was successful, deduct credits
    if (result.success) {
      await fetch(`${req.nextUrl.origin}/api/credits/deduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          credits: result.creditUsed,
          description: 'Ad generation',
          referenceId: result.generationId,
          referenceType: 'generation'
        })
      });
      
      // Record the generation in history
      await fetch(`${req.nextUrl.origin}/api/generations/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          generationId: result.generationId,
          imageUrl: result.imageUrl,
          prompt: formattedPrompt,
          metadata: result.metadata
        })
      });
    }
    
    // Return the result
    return NextResponse.json({
      success: result.success,
      data: result.success 
        ? {
            imageUrl: result.imageUrl,
            generationId: result.generationId,
            metadata: result.metadata
          }
        : undefined,
      error: result.error
    });
    
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error during generation' },
      { status: 500 }
    );
  }
} 