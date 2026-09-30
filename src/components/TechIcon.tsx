import React from "react";
import {
  Code2,
  Coffee,
  Terminal,
  Binary,
  Database,
  Layout,
  FileCode2,
  Network,
  Cpu,
  Boxes,
  Brain,
  ShieldCheck,
  Sparkles,
  Layers
} from "lucide-react";

interface TechIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const TechIcon: React.FC<TechIconProps> = ({ name, className = "w-6 h-6", size }) => {
  switch (name) {
    case "c-lang":
      return <Code2 className={className} size={size} />;
    case "java":
      return <Coffee className={className} size={size} />;
    case "python":
      return <Terminal className={className} size={size} />;
    case "data-structures":
      return <Binary className={className} size={size} />;
    case "database":
      return <Database className={className} size={size} />;
    case "html-css":
      return <Layout className={className} size={size} />;
    case "javascript":
      return <FileCode2 className={className} size={size} />;
    case "networking":
      return <Network className={className} size={size} />;
    case "os":
      return <Cpu className={className} size={size} />;
    case "software-eng":
      return <Boxes className={className} size={size} />;
    case "ai":
      return <Brain className={className} size={size} />;
    case "cyber-security":
      return <ShieldCheck className={className} size={size} />;
    default:
      return <Layers className={className} size={size} />;
  }
};
