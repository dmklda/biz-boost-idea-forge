import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, Target, Users, DollarSign, TrendingUp, ChevronLeft, ChevronUp as ChevronUpIcon } from 'lucide-react';

interface MindMapProps {
  data: any;
  className?: string;
}

export function MindMap({ data, className }: MindMapProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const { t } = useTranslation();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  
  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollTop, scrollWidth, scrollHeight, clientWidth, clientHeight } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      setCanScrollUp(scrollTop > 0);
      setCanScrollDown(scrollTop < scrollHeight - clientHeight - 1);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, []);

  const scrollTo = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 200;
      
      switch (direction) {
        case 'left':
          container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
          break;
        case 'right':
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
          break;
        case 'up':
          container.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
          break;
        case 'down':
          container.scrollBy({ top: scrollAmount, behavior: 'smooth' });
          break;
      }
    }
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getNodeIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('mercado') || lowerLabel.includes('market')) return <Target className="h-4 w-4" />;
    if (lowerLabel.includes('público') || lowerLabel.includes('audience')) return <Users className="h-4 w-4" />;
    if (lowerLabel.includes('receita') || lowerLabel.includes('revenue')) return <DollarSign className="h-4 w-4" />;
    if (lowerLabel.includes('crescimento') || lowerLabel.includes('growth')) return <TrendingUp className="h-4 w-4" />;
    return null;
  };

  const renderNode = (node: any, level: number = 0, index: number = 0) => {
    const nodeId = `${level}-${index}`;
    const isRoot = level === 0;
    const isFirstLevelChild = level === 1;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(nodeId);
    
    const nodeContainerClassName = cn(
      "relative transition-all duration-300",
      isRoot ? "text-center mb-6" :
      isFirstLevelChild ? 
        "align-top pt-4 before:content-[''] before:absolute before:left-1/2 before:-translate-x-1/2 before:top-0 before:h-4 before:w-0.5 before:transition-all before:duration-300" + 
        (isDarkMode ? " before:bg-gray-600" : " before:bg-gray-400")
        :
        "ml-4 md:ml-6 mt-2 pl-4 border-l-2 transition-all duration-300" + (isDarkMode ? " border-gray-700" : " border-gray-300"),
    );

    const textBoxClassName = cn(
      "p-3 rounded-lg inline-flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer",
      isRoot ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold px-6 py-4 text-lg" :
      isFirstLevelChild ? 
        (isDarkMode ? "bg-blue-900 text-blue-100 hover:bg-blue-800" : "bg-blue-100 text-blue-800 hover:bg-blue-200 font-medium") :
        (isDarkMode ? "bg-gray-800 text-gray-200 hover:bg-gray-700" : "bg-gray-100 text-gray-800 hover:bg-gray-200"),
    );

    const childrenContainerClassName = cn(
      "transition-all duration-300 overflow-hidden",
      isRoot ? 
        "mt-6 flex flex-wrap justify-center gap-x-4 md:gap-x-8 gap-y-4 md:gap-y-6 relative pt-6 border-t-2" + 
        (isDarkMode ? " border-gray-600" : " border-gray-400")
        : 
        "mt-3",
      isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
    );
    
    return (
      <div 
        key={nodeId}
        className={nodeContainerClassName}
      >
        <div 
          className={textBoxClassName}
          onClick={() => hasChildren && toggleNode(nodeId)}
        >
          {getNodeIcon(node.label)}
          <span className="text-sm md:text-base">{node.text || node.label || "Unknown"}</span>
          {hasChildren && (
            <div className="ml-2">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              ) : (
                <ChevronRight className="h-4 w-4 transition-transform duration-200" />
              )}
            </div>
          )}
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
        <CardTitle className={cn("text-lg flex items-center gap-2", isDarkMode ? "text-white" : "")}>
          <Target className="h-5 w-5" />
          {data.title || t('mindmap.title', "Mapa Mental")}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {/* Controles de navegação */}
        <div className="absolute top-2 right-2 z-10 flex gap-1 bg-background/80 backdrop-blur-sm rounded-lg p-1 border shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollTo('left')}
            disabled={!canScrollLeft}
            className={cn(
              "h-8 w-8 p-0 hover:bg-accent",
              isDarkMode ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
            )}
            title="Rolar para esquerda"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollTo('right')}
            disabled={!canScrollRight}
            className={cn(
              "h-8 w-8 p-0 hover:bg-accent",
              isDarkMode ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
            )}
            title="Rolar para direita"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollTo('up')}
            disabled={!canScrollUp}
            className={cn(
              "h-8 w-8 p-0 hover:bg-accent",
              isDarkMode ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
            )}
            title="Rolar para cima"
          >
            <ChevronUpIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollTo('down')}
            disabled={!canScrollDown}
            className={cn(
              "h-8 w-8 p-0 hover:bg-accent",
              isDarkMode ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
            )}
            title="Rolar para baixo"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Container de scroll */}
        <div 
          ref={scrollContainerRef}
          className="overflow-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
          style={{ scrollbarWidth: 'thin' }}
        >
          <div className="min-w-max min-h-max p-4">
            {renderNode(data.root || data)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
