import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Check, Move, RotateCw, RefreshCw, Sliders } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string; // Base64 or object URL of original image
  onCropComplete: (croppedImgBase64: string) => void;
  onClose: () => void;
}

export default function ImageCropper({ imageSrc, onCropComplete, onClose }: ImageCropperProps) {
  // Responsive viewport dimensions state
  const [viewportWidth, setViewportWidth] = useState(280);
  const [viewportHeight, setViewportHeight] = useState(330);

  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // For dragging/panning tracking
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  // Handle image load to establish coverage limits
  const [imgDims, setImgDims] = useState({ width: 0, height: 0, initialScale: 1 });

  // Dynamically update viewport dimensions relative to window height & width to ensure perfect visibility
  useEffect(() => {
    function updateDimensions() {
      const hStr = window.innerHeight;
      const wStr = window.innerWidth;
      
      let targetVw = 320;
      let targetVh = 320;
      
      // Adaptively scale based on limiting dimension
      if (hStr < 650 || wStr < 380) {
        targetVw = 230;
        targetVh = 230;
      } else if (hStr < 760 || wStr < 440) {
        targetVw = 260;
        targetVh = 260;
      } else if (hStr < 850) {
        targetVw = 290;
        targetVh = 290;
      }
      
      setViewportWidth(targetVw);
      setViewportHeight(targetVh);
    }
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      // Calculate scale to cover viewport
      const scaleW = viewportWidth / img.width;
      const scaleH = viewportHeight / img.height;
      const initialScale = Math.max(scaleW, scaleH);
      
      setImgDims({
        width: img.width,
        height: img.height,
        initialScale
      });
      // Reset zoom and pan on image charge
      setZoom(1);
      setPanX(0);
      setPanY(0);
      setRotation(0);
    };
  }, [imageSrc, viewportWidth, viewportHeight]);

  // Compute computed actual sizes after coverage scaling & zoom
  const currentScale = imgDims.initialScale * zoom;
  const imgWidth = imgDims.width * currentScale;
  const imgHeight = imgDims.height * currentScale;

  // Render centered initially, then translate
  const x0 = (viewportWidth - imgWidth) / 2;
  const y0 = (viewportHeight - imgHeight) / 2;

  // Clamp pan relative to viewport limits to avoid black margins
  const getMaxPan = () => {
    const maxPanX = Math.max(0, (imgWidth - viewportWidth) / 2);
    const maxPanY = Math.max(0, (imgHeight - viewportHeight) / 2);
    return { maxPanX, maxPanY };
  };

  const clampPan = (x: number, y: number) => {
    const { maxPanX, maxPanY } = getMaxPan();
    return {
      x: Math.min(Math.max(x, -maxPanX), maxPanX),
      y: Math.min(Math.max(y, -maxPanY), maxPanY)
    };
  };

  // Drag Handlers
  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStart.current = { x: clientX, y: clientY };
    panStart.current = { x: panX, y: panY };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;
    
    const newPan = clampPan(panStart.current.x + dx, panStart.current.y + dy);
    setPanX(newPan.x);
    setPanY(newPan.y);
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Mouse drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  // Touch drag handlers (Mobile compatible)
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    handleStart(e.touches[0].clientX, e.touches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  // Rotate image by 90 degrees clockwise
  const handleRotate = () => {
    setRotation(prev => {
      const next = (prev + 90) % 360 as 0 | 90 | 180 | 270;
      return next;
    });
  };

  // Trigger high-res crop rendering via HTML5 Canvas
  const handleApply = () => {
    if (!imageSrc || imgDims.width === 0) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const targetWidth = 800;
      const targetHeight = 800; // Matches ticket stub dynamic aspect ratio
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fill background as white to prevent transparent borders on edge cases
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Conversion factor from visual viewport pixel coordinates to canvas target coordinates
      const scaleCanvas = targetWidth / viewportWidth;

      // Compute actual visual pixel position of image in viewport
      const visualX = x0 + panX;
      const visualY = y0 + panY;

      // Translate to canvas space
      const canvasX = visualX * scaleCanvas;
      const canvasY = visualY * scaleCanvas;
      const canvasW = imgWidth * scaleCanvas;
      const canvasH = imgHeight * scaleCanvas;

      // Handle custom orientation/rotation
      if (rotation !== 0) {
        ctx.save();
        const drawCenterX = canvasX + canvasW / 2;
        const drawCenterY = canvasY + canvasH / 2;

        ctx.translate(drawCenterX, drawCenterY);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -canvasW / 2, -canvasH / 2, canvasW, canvasH);
        ctx.restore();
      } else {
        ctx.drawImage(img, canvasX, canvasY, canvasW, canvasH);
      }

      // Convert generated high quality crop to base64
      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9);
      onCropComplete(croppedBase64);
    };
  };

  // Keep pans clamped within limits if zoom slider reduces scale
  useEffect(() => {
    const newPan = clampPan(panX, panY);
    setPanX(newPan.x);
    setPanY(newPan.y);
  }, [zoom]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[150] flex flex-col items-center justify-center p-4 sm:p-6">
      <div 
        className="bg-[#1A1A1A] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-full"
        id="image-cropper-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-white/5">
          <div className="flex items-center gap-3">
            <span className="p-1.5 bg-white/10 border border-white/10 text-white rounded-lg">
              <Sliders className="w-4 h-4" />
            </span>
            <span className="font-semibold text-white text-base tracking-tight">Position Image</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scaled Dynamic Viewport Container */}
        <div className="flex-1 flex flex-col items-center justify-center py-6 px-5 bg-black/40 relative overflow-hidden select-none min-h-0">
          {/* Main Visual Drag Zone */}
          <div 
            ref={containerRef}
            className="relative border border-white/10 rounded-[24px] overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
            style={{ width: `${viewportWidth}px`, height: `${viewportHeight}px` }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={handleEnd}
          >
            {/* Image Preview Canvas */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Cropper Frame"
              className="absolute pointer-events-none select-none max-w-none origin-center"
              style={{
                width: `${imgDims.width * imgDims.initialScale}px`,
                height: `${imgDims.height * imgDims.initialScale}px`,
                transform: `translate(${panX}px, ${panY}px) scale(${zoom}) rotate(${rotation}deg)`,
                left: `${(viewportWidth - imgDims.width * imgDims.initialScale) / 2}px`,
                top: `${(viewportHeight - imgDims.height * imgDims.initialScale) / 2}px`,
                transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />

            {/* Custom Premium Frame Overlay mimicking Ticket Stub Proportion */}
            <div className="absolute inset-0 border border-white/20 pointer-events-none rounded-[24px] shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]">
              {/* Guides / Grid rules */}
              <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-white/15 border-b border-dashed border-white/5" />
              <div className="absolute top-2/3 left-0 right-0 h-[1px] bg-white/15 border-b border-dashed border-white/5" />
              <div className="absolute left-1/3 top-0 bottom-0 w-[1px] bg-white/15 border-r border-dashed border-white/5" />
              <div className="absolute left-2/3 top-0 bottom-0 w-[1px] bg-white/15 border-r border-dashed border-white/5" />
            </div>

            {/* Float Badge Details */}
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 text-white text-[10px] font-semibold tracking-wider uppercase rounded-md pointer-events-none backdrop-blur-md border border-white/10">
              Drag to Recenter
            </div>
          </div>
        </div>

        {/* Minimal Control Board */}
        <div className="px-6 py-5 border-t border-white/10 bg-[#1A1A1A] space-y-5 shrink-0 overflow-y-auto">
          {/* Zoom controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setZoom(prev => Math.max(1, prev - 0.2))}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer border border-transparent hover:border-white/10"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <div className="flex-1 flex flex-col justify-center">
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/20 accent-white rounded-lg appearance-none cursor-pointer focus:outline-none"
              />
            </div>
            <button
              onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer border border-transparent hover:border-white/10"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          {/* Settings row */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleRotate}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-sm font-medium transition-all cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>Rotate 90°</span>
            </button>
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Prominent Responsive Action Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 py-3 bg-white text-black hover:bg-slate-200 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Apply Crop</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
