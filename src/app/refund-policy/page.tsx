"use client";

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold mb-6">Return & Refund Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: 09-04-2024</p>
          
          <div className="space-y-6">
            <section>
              <p className="mb-4">
                Thank you for shopping at craftads.
              </p>
              <p className="mb-4">
                The following terms are applicable for any products that you have purchased from us.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">Eligibility for Refunds</h2>
              <p className="mb-2">We offer refunds under the following circumstances:</p>
              <ul className="list-disc pl-6 mb-2 space-y-1">
                <li>If the service is not delivered as promised due to an error on our end.</li>
                <li>If a technical issue caused by our platform prevents you from accessing the features you paid for, and the issue cannot be resolved within a reasonable timeframe.</li>
                <li>If you cancel your subscription within the refund period outlined below.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">Refund Period</h2>
              <p>
                Refund requests must be made within 7 days of the payment date. Requests made after this period will not be eligible for a refund.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">Non-Refundable Cases</h2>
              <p className="mb-2">Refunds will not be granted under the following conditions:</p>
              <ul className="list-disc pl-6 mb-2 space-y-1">
                <li>If you change your mind after purchasing a subscription or service.</li>
                <li>If you fail to use the service during the subscription period.</li>
                <li>If the issue is caused by third-party software or tools not affiliated with our platform.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">Refund Process</h2>
              <p className="mb-2">To request a refund, please follow these steps:</p>
              <ol className="list-decimal pl-6 mb-2 space-y-1">
                <li>Contact our support team at refunds@craftads.xyz.</li>
                <li>Provide your payment receipt, order ID, and a detailed explanation of the issue.</li>
                <li>Our team will review your request and respond within 3-5 business days.</li>
                <li>If your request is approved, the refund will be processed to your original payment method within 7-10 business days.</li>
              </ol>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
              <p>
                If you have any questions about this Refund Policy or require assistance, please reach out to us:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> <a href="mailto:refunds@craftads.xyz" className="text-primary hover:underline">refunds@craftads.xyz</a>
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