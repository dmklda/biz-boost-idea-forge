
import { useEffect, useRef } from "react";
import { useTheme } from "@/hooks/use-theme";

interface MindMapNode {
  name: string;
  children?: MindMapNode[];
}

interface MindMapData {
  root: MindMapNode;
}

interface MindMapProps {
  data: MindMapData;
}

function createMindMap(
  container: HTMLDivElement, 
  data: MindMapData, 
  theme: "dark" | "light" | "system"
) {
  // Clear existing content
  container.innerHTML = "";

  // Set up colors based on theme
  const colors = {
    background: theme === "dark" ? "#1a1a1a" : "#ffffff",
    text: theme === "dark" ? "#e0e0e0" : "#333333",
    nodeStroke: theme === "dark" ? "#444444" : "#cccccc",
    nodeFill: {
      root: theme === "dark" ? "#2a2a2a" : "#f0f0f0",
      level1: ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"],
      level2: theme === "dark" ? "#3a3a3a" : "#f7f7f7",
    },
    connection: theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
  };

  const width = container.clientWidth;
  const height = container.clientHeight;
  
  // Set up the SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  container.appendChild(svg);

  const rootNode = data.root;
  const rootX = width / 2;
  const rootY = height / 2;

  // Draw the root node
  const rootElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const rootCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  rootCircle.setAttribute("cx", rootX.toString());
  rootCircle.setAttribute("cy", rootY.toString());
  rootCircle.setAttribute("r", "50");
  rootCircle.setAttribute("fill", colors.nodeFill.root);
  rootCircle.setAttribute("stroke", colors.nodeStroke);
  rootCircle.setAttribute("stroke-width", "1");
  rootElement.appendChild(rootCircle);

  // Draw the root text
  const rootText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  rootText.setAttribute("x", rootX.toString());
  rootText.setAttribute("y", rootY.toString());
  rootText.setAttribute("text-anchor", "middle");
  rootText.setAttribute("dominant-baseline", "middle");
  rootText.setAttribute("fill", colors.text);
  rootText.setAttribute("font-size", "12px");
  rootText.textContent = rootNode.name;
  rootElement.appendChild(rootText);

  svg.appendChild(rootElement);

  // If the root has children, draw them
  if (rootNode.children && rootNode.children.length > 0) {
    const radius = 150; // Distance from root to first level nodes
    const angleStep = (2 * Math.PI) / rootNode.children.length;

    rootNode.children.forEach((child, i) => {
      const angle = i * angleStep;
      const x = rootX + radius * Math.cos(angle);
      const y = rootY + radius * Math.sin(angle);

      // Draw connection to root
      const connection = document.createElementNS("http://www.w3.org/2000/svg", "line");
      connection.setAttribute("x1", rootX.toString());
      connection.setAttribute("y1", rootY.toString());
      connection.setAttribute("x2", x.toString());
      connection.setAttribute("y2", y.toString());
      connection.setAttribute("stroke", colors.connection);
      connection.setAttribute("stroke-width", "2");
      svg.appendChild(connection);

      // Draw the child node
      const childElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
      const childCircle = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
      childCircle.setAttribute("cx", x.toString());
      childCircle.setAttribute("cy", y.toString());
      childCircle.setAttribute("rx", "60");
      childCircle.setAttribute("ry", "30");
      childCircle.setAttribute("fill", colors.nodeFill.level1[i % colors.nodeFill.level1.length]);
      childCircle.setAttribute("stroke", colors.nodeStroke);
      childCircle.setAttribute("stroke-width", "1");
      childElement.appendChild(childCircle);

      // Draw the child text
      const childText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      childText.setAttribute("x", x.toString());
      childText.setAttribute("y", y.toString());
      childText.setAttribute("text-anchor", "middle");
      childText.setAttribute("dominant-baseline", "middle");
      childText.setAttribute("fill", colors.text);
      childText.setAttribute("font-size", "10px");
      childText.textContent = child.name;
      childElement.appendChild(childText);

      svg.appendChild(childElement);

      // If the child has children (level 2), draw them
      if (child.children && child.children.length > 0) {
        const subRadius = 80; // Distance from level 1 to level 2 nodes
        const subAngleRange = Math.PI / 3; // Range of angles for the children
        const subAngleStart = angle - subAngleRange / 2;
        const subAngleStep = subAngleRange / (child.children.length || 1);

        child.children.forEach((grandchild, j) => {
          const subAngle = subAngleStart + j * subAngleStep;
          const subX = x + subRadius * Math.cos(subAngle);
          const subY = y + subRadius * Math.sin(subAngle);

          // Draw connection to parent
          const subConnection = document.createElementNS("http://www.w3.org/2000/svg", "line");
          subConnection.setAttribute("x1", x.toString());
          subConnection.setAttribute("y1", y.toString());
          subConnection.setAttribute("x2", subX.toString());
          subConnection.setAttribute("y2", subY.toString());
          subConnection.setAttribute("stroke", colors.connection);
          subConnection.setAttribute("stroke-width", "1");
          svg.appendChild(subConnection);

          // Draw the grandchild node
          const grandchildElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
          const grandchildRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          grandchildRect.setAttribute("x", (subX - 40).toString());
          grandchildRect.setAttribute("y", (subY - 15).toString());
          grandchildRect.setAttribute("width", "80");
          grandchildRect.setAttribute("height", "30");
          grandchildRect.setAttribute("rx", "10");
          grandchildRect.setAttribute("ry", "10");
          grandchildRect.setAttribute("fill", colors.nodeFill.level2);
          grandchildRect.setAttribute("stroke", colors.nodeStroke);
          grandchildRect.setAttribute("stroke-width", "1");
          grandchildElement.appendChild(grandchildRect);

          // Draw the grandchild text
          const grandchildText = document.createElementNS("http://www.w3.org/2000/svg", "text");
          grandchildText.setAttribute("x", subX.toString());
          grandchildText.setAttribute("y", subY.toString());
          grandchildText.setAttribute("text-anchor", "middle");
          grandchildText.setAttribute("dominant-baseline", "middle");
          grandchildText.setAttribute("fill", colors.text);
          grandchildText.setAttribute("font-size", "8px");
          grandchildText.textContent = grandchild.name;
          grandchildElement.appendChild(grandchildText);

          svg.appendChild(grandchildElement);
        });
      }
    });
  }
}

const MindMap: React.FC<MindMapProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (containerRef.current && data) {
      createMindMap(containerRef.current, data, theme);
    }
    
    // Redraw on resize
    const handleResize = () => {
      if (containerRef.current && data) {
        createMindMap(containerRef.current, data, theme);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [data, theme]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default MindMap;
