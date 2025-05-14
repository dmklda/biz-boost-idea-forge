
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

interface MindMapProps {
  data: any;
  className?: string;
}

export function MindMap({ data, className }: MindMapProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  // Renderizador recursivo para os nós do mapa mental
  const renderNode = (node: any, level: number = 0, index: number = 0) => {
    const isRoot = level === 0;
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div 
        key={`${level}-${index}`}
        className={cn(
          "relative",
          isRoot ? "text-center mb-8" : "ml-6 mt-2 pl-4 border-l-2 border-gray-300",
          isDarkMode && !isRoot ? "border-gray-700" : ""
        )}
      >
        <div 
          className={cn(
            "p-2 rounded-md inline-block",
            isRoot ? "bg-brand-purple text-white font-bold px-4" : 
              level === 1 ? "bg-blue-100 text-blue-800 font-medium" : 
                "bg-gray-100 text-gray-800",
            isDarkMode && !isRoot && level === 1 ? "bg-blue-900 text-blue-100" : "",
            isDarkMode && !isRoot && level > 1 ? "bg-gray-800 text-gray-200" : ""
          )}
        >
          {node.text || node.label || "Unknown"}
        </div>
        
        {hasChildren && (
          <div className="mt-2">
            {node.children.map((child: any, i: number) => 
              renderNode(child, level + 1, i)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={cn("border shadow-sm", className, isDarkMode ? "bg-slate-900 border-slate-800" : "")}>
      <CardHeader className="pb-2">
        <CardTitle className={cn("text-lg", isDarkMode ? "text-white" : "")}>
          {data.title || "Mind Map"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px] p-4">
            {renderNode(data.root || data)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
