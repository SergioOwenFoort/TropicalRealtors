import React, { useState, useRef, useCallback } from 'react';
import { Move, RotateCcw, ZoomIn, ZoomOut, Check, X } from 'lucide-react';

interface ImageAdjusterProps {
  imageUrl: string;
  onSave: (adjustedImageDataUrl: string) => void;
  onCancel: () => void;
}

export const ImageAdjuster: React.FC<ImageAdjusterProps> = ({
  imageUrl,
  onSave,
  onCancel,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const cropImage = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to desired output (square for profile picture)
    const outputSize = 400;
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Clear canvas
    ctx.clearRect(0, 0, outputSize, outputSize);

    // Save context state
    ctx.save();

    // Calculate the image's natural aspect ratio
    const imgAspectRatio = img.naturalWidth / img.naturalHeight;
    let drawWidth, drawHeight;

    // Scale the image to fit within the container while maintaining aspect ratio
    if (imgAspectRatio > 1) {
      // Landscape image
      drawWidth = outputSize;
      drawHeight = outputSize / imgAspectRatio;
    } else {
      // Portrait image
      drawHeight = outputSize;
      drawWidth = outputSize * imgAspectRatio;
    }

    // Apply transformations from center
    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(position.x / zoom, position.y / zoom);

    // Draw the image centered
    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

    // Restore context
    ctx.restore();

    // Get the cropped image as data URL
    const croppedImageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onSave(croppedImageDataUrl);
  };

  const resetAdjustments = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Adjust Your Image</h3>
        
        {/* Preview Area */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4 flex items-center justify-center" style={{ height: '500px' }}>
          <div 
            className="relative cursor-move"
            onMouseDown={handleMouseDown}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Adjust"
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: '480px', maxWidth: '480px' }}
              draggable={false}
            />
          </div>
          
          {/* Crop Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full border-4 border-dashed border-blue-500 opacity-30"></div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Zoom Controls */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium w-16">Zoom:</label>
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-2 border rounded hover:bg-gray-50"
            >
              <ZoomOut size={16} />
            </button>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1"
            />
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              className="p-2 border rounded hover:bg-gray-50"
            >
              <ZoomIn size={16} />
            </button>
            <span className="text-sm w-12">{zoom.toFixed(1)}x</span>
          </div>

          {/* Rotation Controls */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium w-16">Rotate:</label>
            <button
              onClick={() => setRotation(rotation - 90)}
              className="p-2 border rounded hover:bg-gray-50"
            >
              <RotateCcw size={16} />
            </button>
            <input
              type="range"
              min="0"
              max="360"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm w-12">{rotation}°</span>
          </div>

          {/* Position Info */}
          <div className="flex items-center gap-4">
            <Move size={16} />
            <span className="text-sm text-gray-600">
              Drag the image to reposition it
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={resetAdjustments}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Reset
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              onClick={cropImage}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <Check size={16} />
              Apply Changes
            </button>
          </div>
        </div>

        {/* Hidden canvas for cropping */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};
