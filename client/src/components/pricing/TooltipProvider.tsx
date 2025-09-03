import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: string;
  children: React.ReactElement;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setIsVisible(true);
    
    // Initial positioning
    let x = rect.left + rect.width / 2;
    let y = rect.top - 8;
    
    setPosition({ x, y });
  };

  const hideTooltip = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      const tooltip = tooltipRef.current;
      const rect = tooltip.getBoundingClientRect();
      
      let { x, y } = position;
      
      // Center horizontally on trigger
      x = x - rect.width / 2;
      
      // Edge detection
      if (x < 10) x = 10;
      if (x + rect.width > window.innerWidth - 10) {
        x = window.innerWidth - rect.width - 10;
      }
      if (y < 10) {
        // Position below if not enough space above
        const triggerRect = triggerRef.current?.getBoundingClientRect();
        if (triggerRect) {
          y = triggerRect.bottom + 8;
        }
      }
      
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
    }
  }, [isVisible, position]);

  return (
    <>
      {React.cloneElement(children, {
        ref: triggerRef,
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
      })}
      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            className="tooltip-container show"
            style={{
              position: "fixed",
              left: position.x,
              top: position.y,
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
}
