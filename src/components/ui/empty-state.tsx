
import React from "react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
}

export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action 
}: EmptyStateProps) => {
  return (
    <div className="text-center py-10">
      <div className="inline-flex justify-center mb-4">{icon}</div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6">{description}</p>
      {action}
    </div>
  );
};
