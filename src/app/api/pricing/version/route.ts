import { PRICING_VERSION } from '@/constants/pricing';

export async function GET() {
  return Response.json({ version: PRICING_VERSION });
} 