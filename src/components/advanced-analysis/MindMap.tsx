
import React, { useEffect, useRef } from "react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}

interface MindMapProps {
  data: MindMapNode;
  className?: string;
}

export function MindMap({ data, className }: MindMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Colors
  const textColor = isDarkMode ? "#f3f4f6" : "#1f2937";
  const lineColor = isDarkMode ? "#475569" : "#cbd5e1";
  const nodeColor = isDarkMode ? "#334155" : "#f8fafc";
  const nodeBorderColor = isDarkMode ? "#475569" : "#cbd5e1";
  const rootNodeColor = isDarkMode ? "#3b82f6" : "#3b82f6";
  const rootTextColor = isDarkMode ? "#f3f4f6" : "#ffffff";

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawMindMap();
    };

    const drawMindMap = () => {
      if (!ctx || !canvas) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate total width and height needed
      const nodeWidth = 160;
      const nodeHeight = 40;
      const horizontalSpacing = 80;
      const verticalSpacing = 70;

      // Determine number of levels and max nodes per level
      const levels: MindMapNode[][] = [];
      const traverseTree = (node: MindMapNode, level: number) => {
        if (!levels[level]) levels[level] = [];
        levels[level].push(node);
        node.children?.forEach(child => traverseTree(child, level + 1));
      };

      traverseTree(data, 0);

      // Calculate canvas dimensions
      const totalLevels = levels.length;
      const maxNodesInLevel = Math.max(...levels.map(level => level.length));
      
      // Scale down if we have too many nodes
      const scale = maxNodesInLevel > 5 ? 0.8 : 1;
      const scaledNodeWidth = nodeWidth * scale;
      const scaledNodeHeight = nodeHeight * scale;
      const scaledHorizSpacing = horizontalSpacing * scale;
      const scaledVertSpacing = verticalSpacing * scale;

      // Calculate total width and height
      const totalWidth = (totalLevels * (scaledNodeWidth + scaledHorizSpacing));
      const totalHeight = maxNodesInLevel * (scaledNodeHeight + scaledVertSpacing);

      // Set minimum canvas size
      const minWidth = Math.max(container.clientWidth, totalWidth);
      const minHeight = Math.max(300, totalHeight); // Minimum height of 300px
      
      canvas.width = minWidth;
      canvas.height = minHeight;

      // Center the root node
      const rootX = canvas.width / 2;
      const rootY = canvas.height / 2;

      // Draw the mind map
      const drawNode = (
        node: MindMapNode, 
        x: number, 
        y: number, 
        isRoot: boolean = false
      ) => {
        // Draw node
        ctx.beginPath();
        ctx.roundRect(
          x - scaledNodeWidth / 2, 
          y - scaledNodeHeight / 2, 
          scaledNodeWidth, 
          scaledNodeHeight,
          8 // Rounded corners
        );
        ctx.fillStyle = isRoot ? rootNodeColor : nodeColor;
        ctx.fill();
        ctx.strokeStyle = isRoot ? rootNodeColor : nodeBorderColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw text
        ctx.fillStyle = isRoot ? rootTextColor : textColor;
        ctx.font = `${isRoot ? 'bold ' : ''}${12 * scale}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Handle long text with ellipsis
        const maxTextWidth = scaledNodeWidth - 20;
        let displayText = node.label;
        if (ctx.measureText(displayText).width > maxTextWidth) {
          let testText = displayText;
          while (ctx.measureText(testText + "...").width > maxTextWidth && testText.length > 0) {
            testText = testText.slice(0, -1);
          }
          displayText = testText + "...";
        }
        
        ctx.fillText(displayText, x, y);

        // Draw children
        if (node.children && node.children.length > 0) {
          const availableRadius = Math.min(canvas.width, canvas.height) / 2 - 100;
          const radius = isRoot ? availableRadius / 2 : availableRadius / 3;
          const angleStep = Math.PI * 1.5 / node.children.length;
          const startAngle = isRoot ? Math.PI / 4 : Math.PI * 0.75;

          node.children.forEach((child, index) => {
            const angle = startAngle + index * angleStep;
            const childX = x + Math.cos(angle) * radius;
            const childY = y + Math.sin(angle) * radius;

            // Draw connecting line
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(childX, childY);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = isRoot ? 2 : 1;
            ctx.stroke();

            // Draw the child node
            drawNode(child, childX, childY);
          });
        }
      };

      // Start drawing from the root
      drawNode(data, rootX, rootY, true);
    };

    // Initial draw
    resizeCanvas();

    // Handle window resize
    window.addEventListener("resize", resizeCanvas);
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [data, isDarkMode, textColor, lineColor, nodeColor, nodeBorderColor, rootNodeColor, rootTextColor]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full overflow-auto touch-auto", className)}
      style={{ minHeight: "300px" }}
    >
      <canvas
        ref={canvasRef}
        className="block"
      />
    </div>
  );
}

export default MindMap;
