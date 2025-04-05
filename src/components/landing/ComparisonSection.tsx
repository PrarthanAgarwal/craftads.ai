import React from 'react';

interface ComparisonCardProps {
  title: string;
  description: string;
  icon: string; // This would be the icon component or name in a real implementation
}

const ComparisonCard = ({ title, description, icon }: ComparisonCardProps) => {
  return (
    <div className="bg-card rounded-lg p-7 shadow-md border border-border h-full flex flex-col">
      <div className="text-4xl mb-5">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground flex-grow">{description}</p>
    </div>
  );
};

const ComparisonSection = () => {
  const comparisonItems = [
    {
      icon: '👨‍🎨', // Replace with actual icon component in production
      title: 'Designers',
      description: 'Expensive, $50-200 per design, long turnaround times, and multiple revision cycles'
    },
    {
      icon: '🏢', // Replace with actual icon component in production
      title: 'Agencies',
      description: 'High retainer fees, overhead costs, and complex approval processes that slow down campaigns'
    },
    {
      icon: '🔄', // Replace with actual icon component in production
      title: 'Iteration Issues',
      description: 'Testing different ad variations requires starting from scratch each time, wasting resources'
    },
    {
      icon: '📱', // Replace with actual icon component in production
      title: 'Multi-platform Challenges',
      description: 'Creating consistent ads across different platforms requires specialized knowledge and extra time'
    },
  ];

  return (
    <div className="bg-muted py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Creating ads has been very tough.</h2>
          <p className="text-md text-muted-foreground max-w-2xl mx-auto">
            Other tools and services make the process complicated, expensive, and time-consuming.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {comparisonItems.map((item, index) => (
            <ComparisonCard 
              key={index}
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComparisonSection; 