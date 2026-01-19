import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react";

interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ZoomableImage = ({ src, alt, className = "" }: ZoomableImageProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const minScale = 0.5;
  const maxScale = 4;
  const scaleStep = 0.25;

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + scaleStep, maxScale));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - scaleStep, minScale));
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [scale, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Limit panning based on zoom level
      const maxOffset = (scale - 1) * 150;
      setPosition({
        x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
        y: Math.max(-maxOffset, Math.min(maxOffset, newY))
      });
    }
  }, [isDragging, dragStart, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -scaleStep : scaleStep;
    setScale((prev) => Math.max(minScale, Math.min(maxScale, prev + delta)));
  }, []);

  // Reset position when zooming back to 1
  useEffect(() => {
    if (scale <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);

  return (
    <div className={`relative ${className}`}>
      {/* Zoom Controls */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-lg p-1 border border-border shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleZoomOut}
          disabled={scale <= minScale}
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-xs font-medium w-12 text-center">
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleZoomIn}
          disabled={scale >= maxScale}
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleReset}
          disabled={scale === 1 && position.x === 0 && position.y === 0}
          title="Reset view"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Pan indicator */}
      {scale > 1 && (
        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1 border border-border text-xs text-muted-foreground">
          <Move className="w-3 h-3" />
          <span>Drag to pan</span>
        </div>
      )}

      {/* Image Container */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden rounded-lg cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain transition-transform duration-150"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
          draggable={false}
        />
      </div>
    </div>
  );
};
