import React from "react";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  name: string;
  url?: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="py-2.5 px-4 bg-slate-900/60 border-b border-slate-800 text-xs">
      <ol className="flex items-center flex-wrap gap-1.5 text-slate-400 max-w-7xl mx-auto">
        <li className="flex items-center gap-1.5">
          <a
            href={items[0]?.url || "/"}
            onClick={(e) => {
              if (items[0]?.onClick) {
                e.preventDefault();
                items[0].onClick();
              }
            }}
            className="flex items-center gap-1 hover:text-blue-400 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{items[0]?.name || "Home"}</span>
          </a>
        </li>

        {items.slice(1).map((item, index) => {
          const isLast = index === items.length - 2;
          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-slate-600" />
              {isLast ? (
                <span className="text-slate-200 font-semibold truncate max-w-[200px] sm:max-w-[350px]">
                  {item.name}
                </span>
              ) : (
                <a
                  href={item.url || "/"}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                    }
                  }}
                  className="hover:text-blue-400 transition-colors cursor-pointer truncate max-w-[150px] sm:max-w-[250px]"
                >
                  {item.name}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
