"use client";

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="mb-2">
                Welcome to CraftAds ("we," "our," or "us"). We are committed to protecting your privacy and handling your data in an open and transparent manner. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
              </p>
              <p>
                By using CraftAds, you agree to the collection and use of information in accordance with this policy. We will not use or share your information with anyone except as described in this Privacy Policy.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
              <p className="mb-2"><strong>Personal Information:</strong> When you create an account, we collect information such as your name, email address, and profile picture.</p>
              <p className="mb-2"><strong>Usage Data:</strong> We collect information about how you interact with our service, including ad generations, preferences, and browsing activity.</p>
              <p className="mb-2"><strong>Payment Information:</strong> When you purchase credits or subscribe to our services, we collect payment information. This is processed through our payment processor, and we do not store complete credit card details.</p>
              <p><strong>Generated Content:</strong> We store the ads and content you generate using our service.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="mb-1">We use the information we collect to:</p>
              <ul className="list-disc pl-6 mb-2 space-y-1">
                <li>Provide, maintain, and improve our services</li>
                <li>Process payments and manage your account</li>
                <li>Send you important information, such as confirmations, technical notices, updates, and security alerts</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Monitor and analyze trends, usage, and activities in connection with our service</li>
                <li>Personalize your experience and provide content that may interest you</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">4. How We Share Your Information</h2>
              <p className="mb-2">We may share your information with:</p>
              <p className="mb-2"><strong>Service Providers:</strong> Companies that perform services on our behalf, such as payment processing, data analysis, email delivery, and hosting services.</p>
              <p className="mb-2"><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</p>
              <p><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect the security of your personal information. However, please be aware that no method of transmission over the internet or method of electronic storage is 100% secure.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Your Data Rights</h2>
              <p className="mb-2">Depending on your location, you may have certain rights regarding your personal information, including:</p>
              <ul className="list-disc pl-6 mb-2 space-y-1">
                <li>The right to access your personal information</li>
                <li>The right to rectify inaccurate information</li>
                <li>The right to erasure of your information</li>
                <li>The right to restrict processing of your information</li>
                <li>The right to data portability</li>
                <li>The right to object to processing</li>
              </ul>
              <p>To exercise any of these rights, please contact us at privacy@craftads.ai.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Children's Privacy</h2>
              <p>
                Our service is not intended for use by children under the age of 13. We do not knowingly collect personally identifiable information from children under 13.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">9. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@craftads.ai.
              </p>
            </section>
          </div>
          
          <div className="mt-10 pt-6 border-t">
            <Link href="/" className="text-primary hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
} 