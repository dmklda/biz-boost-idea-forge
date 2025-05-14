import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';

interface MindMapProps {
  data: any;
  className?: string;
}

export function MindMap({ data, className }: MindMapProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const { t } = useTranslation();
  
  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  const renderNode = (node: any, level: number = 0, index: number = 0) => {
    const isRoot = level === 0;
    const isFirstLevelChild = level === 1;
    const hasChildren = node.children && node.children.length > 0;
    
    const nodeContainerClassName = cn(
      "relative",
      isRoot ? "text-center mb-4" :
      isFirstLevelChild ? 
        "align-top pt-4 before:content-[''] before:absolute before:left-1/2 before:-translate-x-1/2 before:top-0 before:h-4 before:w-0.5" + 
        (isDarkMode ? " before:bg-gray-600" : " before:bg-gray-400")
        :
        "ml-6 mt-2 pl-4 border-l-2" + (isDarkMode ? " border-gray-700" : " border-gray-300"),
    );

    const textBoxClassName = cn(
      "p-2 rounded-md inline-block",
      isRoot ? "bg-brand-purple text-white font-bold px-4" :
      isFirstLevelChild ? (isDarkMode ? "bg-blue-900 text-blue-100" : "bg-blue-100 text-blue-800 font-medium") :
        (isDarkMode ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-800"),
    );

    const childrenContainerClassName = cn(
      isRoot ? 
        "mt-4 flex flex-wrap justify-center gap-x-8 gap-y-6 relative pt-4 border-t-2" + 
        (isDarkMode ? " border-gray-600" : " border-gray-400")
        : 
        "mt-2"
    );
    
    return (
      <div 
        key={`${level}-${index}`}
        className={nodeContainerClassName}
      >
        <div 
          className={textBoxClassName}
        >
          {node.text || node.label || "Unknown"}
        </div>
        
        {hasChildren && (
          <div className={childrenContainerClassName}>
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
          {data.title || t('mindmap.title', "Mind Map")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-max inline-block p-4">
            {renderNode(data.root || data)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
