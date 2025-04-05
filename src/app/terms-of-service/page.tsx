"use client";

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Agreement to Terms</h2>
              <p className="mb-2">
                By accessing or using CraftAds ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, you may not access the Service.
              </p>
              <p>
                We reserve the right to update or change our Terms at any time without notice. Your continued use of the Service after we post any modifications to the Terms will constitute your acknowledgment of the modifications and your consent to abide by the modified Terms.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">2. Account Registration</h2>
              <p className="mb-2">
                To access certain features of the Service, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>
              <p>
                You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">3. Use of Service</h2>
              <p className="mb-2">
                You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              <ul className="list-disc pl-6 mb-2 space-y-1">
                <li>Use the Service in any way that violates any applicable law or regulation</li>
                <li>Attempt to interfere with the proper working of the Service</li>
                <li>Bypass measures we may use to prevent or restrict access to the Service</li>
                <li>Use the Service to create content that is illegal, harmful, threatening, abusive, harassing, or otherwise objectionable</li>
                <li>Use the Service to infringe upon the intellectual property rights of others</li>
                <li>Use the Service to transmit any material that contains malware, viruses, or other harmful code</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">4. Credit System and Payments</h2>
              <p className="mb-2">
                CraftAds operates using a credit system. Credits are required to generate content using our Service.
              </p>
              <p className="mb-2">
                When you purchase credits or subscribe to one of our plans, you agree to pay all fees associated with your selected plan. All payments are processed through our third-party payment processors. By providing payment information, you represent that you are authorized to use the payment method.
              </p>
              <p>
                All purchases are final and non-refundable, except as required by law or as explicitly stated in our refund policy. We reserve the right to change our pricing at any time.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">5. Content Generation and Ownership</h2>
              <p className="mb-2">
                The Service allows you to generate ads and other creative content. You retain ownership of any content you generate using the Service, subject to the following conditions:
              </p>
              <ul className="list-disc pl-6 mb-2 space-y-1">
                <li>You must have all necessary rights to use any input content provided to the Service</li>
                <li>You are solely responsible for ensuring that content generated using the Service does not infringe on any third-party rights, including intellectual property rights</li>
                <li>We grant you a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display the generated content for personal or commercial purposes</li>
                <li>We reserve the right to use anonymized, aggregated data about content generation for improving our Service</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
              <p className="mb-2">
                The Service, including its content, features, and functionality, is owned by CraftAds and is protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p>
                Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of CraftAds.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Third-Party Services</h2>
              <p>
                The Service may contain links to third-party websites or services that are not owned or controlled by CraftAds. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
              <p>
                In no event shall CraftAds, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">9. Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless CraftAds and its licensee and licensors, and their employees, contractors, agents, officers, and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of your use of the Service.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">10. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of law provisions.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">11. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any significant changes by posting the new Terms on this page. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">12. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">13. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at legal@craftads.ai.
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