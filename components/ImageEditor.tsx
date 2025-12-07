import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckIcon, 
  XIcon, 
  RotateCcwIcon, 
  CropIcon, 
  SlidersIcon, 
  ZoomIcon,
  EditIcon
} from './Icons';

interface ImageEditorProps {
  imageSrc: string;
  onCancel: () => void;
  onSave: (newImageSrc: string) => void;
}

type EditorTab = 'ADJUST' | 'CROP';
type CropRatio = 'ORIGINAL' | '1:1' | '16:9' | '4:3';

const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, onCancel, onSave }) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('ADJUST');
  
  // Adjustment State
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  // Crop/Transform State
  const [cropRatio, setCropRatio] = useState<CropRatio>('ORIGINAL');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const containerRef = useRef<HTMLDivElement>(null);

  // Load image
  useEffect(() => {
    imageRef.current.src = imageSrc;
    imageRef.current.onload = () => {
      draw();
    };
  }, [imageSrc]);

  // Redraw when any state changes
  useEffect(() => {
    draw();
  }, [brightness, contrast, saturation, cropRatio, zoom, pan]);

  // Reset pan/zoom when ratio changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [cropRatio]);

  const getTargetDimensions = () => {
    const img = imageRef.current;
    if (!img.width) return { width: 0, height: 0 };

    let targetW = img.width;
    let targetH = img.height;

    if (cropRatio === '1:1') {
      const min = Math.min(img.width, img.height);
      targetW = min;
      targetH = min;
    } else if (cropRatio === '16:9') {
      targetW = img.width;
      targetH = img.width * (9/16);
      if (targetH > img.height) {
        targetH = img.height;
        targetW = targetH * (16/9);
      }
    } else if (cropRatio === '4:3') {
      targetW = img.width;
      targetH = img.width * (3/4);
      if (targetH > img.height) {
        targetH = img.height;
        targetW = targetH * (4/3);
      }
    }

    return { width: targetW, height: targetH };
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;
    if (!canvas || !ctx || !img.width) return;

    // 1. Determine Canvas Size (Target Crop Size)
    const { width, height } = getTargetDimensions();
    canvas.width = width;
    canvas.height = height;

    // 2. Clear & Filters
    ctx.clearRect(0, 0, width, height);
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    // 3. Draw Image with Transform (Zoom & Pan)
    // Center the image first
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-width / 2, -height / 2);
    
    // Apply Pan
    ctx.translate(pan.x, pan.y);

    // Draw image centered relative to the crop box
    // We want the image to cover the crop box by default (roughly)
    const x = (width - img.width) / 2;
    const y = (height - img.height) / 2;
    
    ctx.drawImage(img, x, y);

    // Reset transform for next frame (though we clear rect anyway)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTab !== 'CROP') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || activeTab !== 'CROP') return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleSave = () => {
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL('image/png'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <EditIcon className="w-5 h-5 text-purple-400" />
            Edit Image
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setBrightness(100);
                setContrast(100);
                setSaturation(100);
                setZoom(1);
                setPan({x:0,y:0});
                setCropRatio('ORIGINAL');
              }}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Reset All"
            >
              <RotateCcwIcon className="w-4 h-4" />
            </button>
            <button onClick={onCancel} className="p-2 text-slate-400 hover:text-white transition-colors">
              <XIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Canvas Area */}
          <div 
            ref={containerRef}
            className={`flex-1 bg-slate-950 flex items-center justify-center relative overflow-hidden p-8 
              ${activeTab === 'CROP' ? 'cursor-move' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Checkerboard background for transparency */}
            <div className="absolute inset-0 opacity-20" 
                 style={{backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '20px 20px'}} />
            
            <canvas 
              ref={canvasRef} 
              className="max-w-full max-h-full shadow-2xl border border-slate-800 pointer-events-none" // Events handled by container
            />
            
            {activeTab === 'CROP' && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-xs text-white pointer-events-none">
                Drag to pan • Use slider to zoom
              </div>
            )}
          </div>

          {/* Sidebar Controls */}
          <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
            
            {/* Tabs */}
            <div className="flex border-b border-slate-800">
              <button 
                onClick={() => setActiveTab('ADJUST')}
                className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'ADJUST' 
                    ? 'text-purple-400 border-b-2 border-purple-500 bg-slate-800/50' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <SlidersIcon className="w-4 h-4" /> Adjust
              </button>
              <button 
                onClick={() => setActiveTab('CROP')}
                className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'CROP' 
                    ? 'text-purple-400 border-b-2 border-purple-500 bg-slate-800/50' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <CropIcon className="w-4 h-4" /> Crop
              </button>
            </div>

            {/* Controls */}
            <div className="p-6 space-y-8 overflow-y-auto flex-1">
              
              {activeTab === 'ADJUST' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <label className="text-slate-300 font-medium">Brightness</label>
                      <span className="text-slate-500">{brightness}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" value={brightness} 
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-purple-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <label className="text-slate-300 font-medium">Contrast</label>
                      <span className="text-slate-500">{contrast}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" value={contrast} 
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-purple-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <label className="text-slate-300 font-medium">Saturation</label>
                      <span className="text-slate-500">{saturation}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" value={saturation} 
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full accent-purple-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'CROP' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-3">Aspect Ratio</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['ORIGINAL', '1:1', '16:9', '4:3'] as CropRatio[]).map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => setCropRatio(ratio)}
                          className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                            cropRatio === ratio
                              ? 'bg-purple-600 border-purple-500 text-white'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {ratio === 'ORIGINAL' ? 'Original' : ratio}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div className="flex justify-between text-xs">
                      <label className="text-slate-300 font-medium flex items-center gap-2">
                        <ZoomIcon className="w-3 h-3" /> Zoom
                      </label>
                      <span className="text-slate-500">{zoom.toFixed(1)}x</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="3" step="0.1" value={zoom} 
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full accent-purple-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
              <button 
                onClick={handleSave}
                className="w-full py-3 bg-white text-black rounded-xl font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <CheckIcon className="w-4 h-4" /> Save Changes
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;