import React, { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border py-4">
      <button 
        className="flex justify-between items-center w-full text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium">{question}</h3>
        <svg 
          className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="mt-2 text-muted-foreground">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

const FAQSection = () => {
  const faqItems = [
    {
      question: "How many ads can I generate?",
      answer: "1 credit per generation. With our subscription plans, you'll receive a set number of credits each month to generate ads."
    },
    {
      question: "How long does it take to generate an ad?",
      answer: "1-2 minutes for a complete, high-quality ad generation."
    },
    {
      question: "Can I customize the ad?",
      answer: "Yes, you can customize the ad in seconds using our intuitive editor."
    },
    {
      question: "What industries are supported?",
      answer: "We support 10+ industries with specialized templates and designs."
    },
    {
      question: "Can I cancel any time?",
      answer: "Yes, there's no lock-in and you can cancel your subscription at anytime of the month. When cancelling it will cancel at the end of your current billing period; you can still use the pro features until the end of your billing period."
    },
    {
      question: "Can I get a refund?",
      answer: "Yes, you can get a refund within 7 days of purchase."
    },
    {
      question: "I have another question.",
      answer: "Cool, contact us by email: prarthan@craftads.ai 👋"
    }
  ];

  return (
    <div id="faq" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently asked questions
          </h2>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {faqItems.map((item, index) => (
            <FAQItem 
              key={index}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQSection; 