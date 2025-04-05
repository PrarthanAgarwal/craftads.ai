import React from 'react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-card p-7 rounded-lg shadow-md border border-border h-full flex flex-col">
      <div className="text-4xl mb-5">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground flex-grow">{description}</p>
    </div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: '🔄',
      title: 'Product Integration',
      description: 'Integrate your product into the reference ad style'
    },
    {
      icon: '📚',
      title: 'Rich Template Library',
      description: 'More than 1000 Ad templates available across industries'
    },
    {
      icon: '🎯',
      title: 'AI-Driven Design',
      description: 'Smart AI creates professional-quality ads that match your brand identity'
    },
    {
      icon: '⚡',
      title: 'Rapid Iteration',
      description: 'Test multiple variations quickly without starting from scratch'
    },
    {
      icon: '🔍',
      title: 'Pinterest Integration',
      description: 'Import inspiration directly from Pinterest with just a URL'
    },
    {
      icon: '💰',
      title: 'Budget Friendly',
      description: 'Create stunning ads for less than $1 each, saving thousands in design costs'
    },
  ];

  return (
    <div id="features" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Features that make ad creation simple
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            CraftAds gives you all the tools you need to create high-quality advertisements in seconds
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection; 