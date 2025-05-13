
import { useEffect, useRef } from "react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
  className?: string;
}

interface MindMapProps {
  data: MindMapNode;
  className?: string;
}

export function MindMap({ data, className }: MindMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    if (!ref.current) return;

    const container = ref.current;
    
    // Clear previous content
    container.innerHTML = "";

    // Create mind map
    const createMindMap = (node: MindMapNode, depth: number = 0, parent?: HTMLElement) => {
      const nodeEl = document.createElement("div");
      
      // Apply styling based on depth
      nodeEl.className = cn(
        "relative p-3 rounded-lg transition-all duration-300 font-medium text-sm",
        depth === 0 
          ? "bg-gradient-to-r from-brand-blue to-brand-purple text-white text-base font-semibold shadow-lg" 
          : depth === 1 
            ? isDarkMode 
              ? "bg-slate-800 text-white border border-slate-700" 
              : "bg-white text-slate-800 border border-slate-200 shadow"
            : isDarkMode 
              ? "bg-slate-900 text-slate-300" 
              : "bg-slate-50 text-slate-700",
        depth === 0 ? "mx-auto w-fit mb-8 px-5" : "",
        depth === 1 ? "my-2 mx-2" : "my-1 mx-1",
        node.className || "",
        depth > 0 && "hover:shadow-md"
      );
      
      nodeEl.textContent = node.label;

      // Append to parent or container
      if (parent) {
        parent.appendChild(nodeEl);
      } else {
        container.appendChild(nodeEl);
      }

      // If there are children, create a container for them
      if (node.children && node.children.length > 0) {
        const childrenContainer = document.createElement("div");
        childrenContainer.className = cn(
          "flex flex-wrap justify-center items-start my-2",
          depth === 0 ? "gap-4" : "gap-2"
        );
        
        if (depth > 0) {
          const connector = document.createElement("div");
          connector.className = isDarkMode 
            ? "w-0.5 h-4 bg-slate-700 mx-auto" 
            : "w-0.5 h-4 bg-slate-300 mx-auto";
          nodeEl.appendChild(connector);
        }
        
        nodeEl.appendChild(childrenContainer);

        // Create children nodes
        node.children.forEach(childNode => {
          createMindMap(childNode, depth + 1, childrenContainer);
        });
      }
    };

    createMindMap(data);
  }, [data, theme]);

  return (
    <div 
      ref={ref} 
      className={cn(
        "mind-map overflow-auto p-4 w-full flex flex-col items-center", 
        className
      )}
    ></div>
  );
}
