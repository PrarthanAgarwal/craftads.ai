import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Configure this route to be dynamically rendered
export const dynamic = "force-dynamic";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 