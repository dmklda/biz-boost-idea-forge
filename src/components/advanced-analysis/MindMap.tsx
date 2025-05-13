import { useEffect, useRef } from "react";

interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}

interface MindMapProps {
  data: MindMapNode;
}

export function MindMap({ data }: MindMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !data) return;

    // This is a placeholder for a mind map visualization
    // In a real implementation, you would use a library like react-flow or d3.js
    // to create an interactive mind map
    const container = containerRef.current;
    container.innerHTML = '';

    // Create a simple visualization with HTML and CSS
    const rootNode = document.createElement('div');
    rootNode.className = 'root-node';
    rootNode.style.cssText = `
      background-color: #3b82f6;
      color: white;
      padding: 10px 16px;
      border-radius: 8px;
      font-weight: 600;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    rootNode.textContent = data.label || 'Ideia';
    container.appendChild(rootNode);

    // For simplicity, we'll just create a visual representation
    // that doesn't actually use the full data structure
    const createBranch = (angle: number, color: string, label: string) => {
      const distance = 120;
      const branch = document.createElement('div');
      branch.className = 'branch-node';
      
      // Calculate position based on angle and distance
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      branch.style.cssText = `
        background-color: ${color};
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-weight: 500;
        font-size: 14px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px));
        z-index: 5;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        max-width: 120px;
        text-align: center;
      `;
      branch.textContent = label;
      
      // Create the connecting line
      const line = document.createElement('div');
      line.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: ${distance}px;
        height: 2px;
        background-color: ${color};
        transform: translate(0, 0) rotate(${angle}rad);
        transform-origin: left center;
        opacity: 0.6;
        z-index: 1;
      `;
      
      container.appendChild(line);
      container.appendChild(branch);
    };

    // Create some sample branches
    const branches = [
      { angle: 0, color: '#3b82f6', label: 'Mercado' },
      { angle: Math.PI / 3, color: '#8b5cf6', label: 'Produto' },
      { angle: 2 * Math.PI / 3, color: '#ec4899', label: 'Monetização' },
      { angle: Math.PI, color: '#ef4444', label: 'Tecnologia' },
      { angle: 4 * Math.PI / 3, color: '#f59e0b', label: 'Concorrência' },
      { angle: 5 * Math.PI / 3, color: '#10b981', label: 'Marketing' }
    ];
    
    branches.forEach(branch => {
      createBranch(branch.angle, branch.color, branch.label);
    });
    
  }, [data]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative"
      style={{ backgroundColor: '#f8fafc' }}
    />
  );
}
