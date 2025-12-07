import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { GeneratedItem, MediaType, AspectRatio, Resolution } from '../types';
import { 
  WandIcon, 
  LoaderIcon, 
  PaletteIcon, 
  UserIcon, 
  BookOpenIcon, 
  LayoutIcon, 
  SmileIcon, 
  BoxIcon,
  PhotoIcon,
  LayersIcon,
  HexagonIcon,
  GamepadIcon,
  CameraIcon,
  PenToolIcon,
  SofaIcon,
  UsersIcon,
  PlusIcon,
  TrashIcon
} from './Icons';

interface ImageStudioProps {
  onGenerateSuccess: (item: GeneratedItem) => void;
}

interface Character {
  id: string;
  name: string;
  description: string;
}

const ASPECT_RATIOS: { value: AspectRatio; label: string; iconClass: string }[] = [
  { value: '1:1', label: 'Square', iconClass: 'aspect-square' },
  { value: '16:9', label: 'Landscape', iconClass: 'aspect-video' },
  { value: '9:16', label: 'Portrait', iconClass: 'aspect-[9/16]' },
  { value: '4:3', label: 'Standard', iconClass: 'aspect-[4/3]' },
  { value: '3:4', label: 'Tall', iconClass: 'aspect-[3/4]' },
];

const STYLES = [
  { value: 'None', label: 'No Style' },
  { value: 'Photorealistic', label: 'Realistic' },
  { value: 'Anime', label: 'Anime' },
  { value: 'Cyberpunk', label: 'Cyberpunk' },
  { value: 'Watercolor', label: 'Watercolor' },
  { value: '3D Render', label: '3D Render' },
  { value: 'Oil Painting', label: 'Oil Paint' },
  { value: 'Pencil Sketch', label: 'Sketch' },
  { value: 'Pixel Art', label: 'Pixel' },
  { value: 'Claymation', label: 'Clay' },
  { value: 'Cinematic', label: 'Cinema' },
  { value: 'Retro Wave', label: 'Retro' },
];

const GENERATION_TYPES = [
  { id: 'DEFAULT', label: 'Standard', icon: PhotoIcon, description: 'Default image generation' },
  { id: 'ANIMATION_STORY', label: 'Story w/ Cast', icon: UsersIcon, description: 'Define characters and generate a story scene' },
  { id: 'CHARACTER', label: 'Character Sheet', icon: UserIcon, description: 'Three-view design (Front, Side, Back)' },
  { id: 'COMIC', label: 'Manga/Comic', icon: BookOpenIcon, description: 'Comic page layout with panels' },
  { id: 'STORYBOARD', label: 'Storyboard', icon: LayoutIcon, description: 'Cinematic sequence frames' },
  { id: 'LOGO', label: 'Logo Design', icon: HexagonIcon, description: 'Minimalist vector logo' },
  { id: 'STICKER', label: 'Sticker', icon: SmileIcon, description: 'Die-cut sticker with white border' },
  { id: 'PIXEL', label: 'Pixel Art', icon: GamepadIcon, description: 'Retro 16-bit game art' },
  { id: 'PORTRAIT', label: 'Pro Portrait', icon: CameraIcon, description: 'Studio photography headshot' },
  { id: 'ISOMETRIC', label: 'Isometric 3D', icon: BoxIcon, description: '3D Game asset view' },
  { id: 'TATTOO', label: 'Tattoo', icon: PenToolIcon, description: 'Black & white line art stencil' },
  { id: 'INTERIOR', label: 'Interior', icon: SofaIcon, description: 'Interior design visualization' },
];

const ImageStudio: React.FC<ImageStudioProps> = ({ onGenerateSuccess }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [resolution, setResolution] = useState<Resolution>('1K');
  const [selectedStyle, setSelectedStyle] = useState('None');
  const [generationType, setGenerationType] = useState('DEFAULT');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Character Management State
  const [characters, setCharacters] = useState<Character[]>([
    { id: '1', name: 'Hero', description: 'A young adventurer with messy blue hair and a red scarf' },
    { id: '2', name: 'Villain', description: 'A shadowy figure in obsidian armor with glowing green eyes' }
  ]);

  const handleAddCharacter = () => {
    setCharacters([...characters, { id: crypto.randomUUID(), name: '', description: '' }]);
  };

  const handleRemoveCharacter = (id: string) => {
    setCharacters(characters.filter(c => c.id !== id));
  };

  const handleUpdateCharacter = (id: string, field: keyof Character, value: string) => {
    setCharacters(characters.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      let finalPrompt = "";
      const styleSuffix = selectedStyle !== 'None' ? `, ${selectedStyle} art style` : '';
      const qualitySuffix = ", masterpiece, best quality, high resolution, 8k";

      // Construct prompt based on Generation Type
      switch (generationType) {
        case 'ANIMATION_STORY':
          const charStr = characters.map(c => `- ${c.name}: ${c.description}`).join('\n');
          finalPrompt = `Animation Storyboard Sequence.\n\nCAST OF CHARACTERS:\n${charStr}\n\nSCENE DESCRIPTION:\n${prompt}\n\nINSTRUCTIONS:\nCreate a coherent storyboard sheet showing this scene. Ensure the characters match their descriptions perfectly. Use dynamic camera angles and expressive poses.${styleSuffix}${qualitySuffix}`;
          break;
        case 'CHARACTER':
          finalPrompt = `Detailed character design sheet of: ${prompt}. Include three views: front view, side view, and back view. Consistent character details, neutral background, concept art${styleSuffix}${qualitySuffix}`;
          break;
        case 'COMIC':
          finalPrompt = `Manga/Comic book page layout featuring: ${prompt}. Dynamic paneling, speech bubbles, dramatic angles, visual storytelling, black and white or colored${styleSuffix}${qualitySuffix}`;
          break;
        case 'STORYBOARD':
          finalPrompt = `Professional movie storyboard sheet layout: ${prompt}. Sequential panels, cinematic lighting, camera directions, rough sketch aesthetic${styleSuffix}`;
          break;
        case 'LOGO':
          finalPrompt = `Professional vector logo design of: ${prompt}. Minimalist, flat design, vector graphics, simple shapes, white background, high contrast, brand identity${styleSuffix}`;
          break;
        case 'STICKER':
          finalPrompt = `Die-cut sticker design of: ${prompt}. White contour border, vector illustration style, isolated on white background, simple colors, cute${styleSuffix}`;
          break;
        case 'PIXEL':
          finalPrompt = `Pixel art of: ${prompt}. 16-bit retro game style, crisp pixels, sprite sheet or scene, vibrant colors${styleSuffix}`;
          break;
        case 'PORTRAIT':
          finalPrompt = `High-end editorial studio portrait photography of: ${prompt}. 85mm lens, f/1.8, sharp focus on eyes, dramatic lighting, skin texture, photorealistic, bokeh background${styleSuffix}${qualitySuffix}`;
          break;
        case 'ISOMETRIC':
          finalPrompt = `Isometric 3D view of: ${prompt}. Diorama style, unreal engine 5 render, cute, low poly or high detail depending on style, isolated on neutral background${styleSuffix}`;
          break;
        case 'TATTOO':
          finalPrompt = `Tattoo stencil design of: ${prompt}. Black and white line art, clean lines, high contrast, isolated on white background, ink style${styleSuffix}`;
          break;
        case 'INTERIOR':
          finalPrompt = `Professional interior design photography of: ${prompt}. Architectural Digest style, modern luxury, perfect lighting, wide angle, photorealistic, 8k${styleSuffix}`;
          break;
        default: // DEFAULT
          finalPrompt = `${prompt}${styleSuffix}${qualitySuffix}`;
          break;
      }

      const imageUrl = await generateImage({ 
        prompt: finalPrompt, 
        aspectRatio, 
        resolution 
      });
      
      const typeLabel = GENERATION_TYPES.find(t => t.id === generationType)?.label || 'Image';
      const displayPrompt = generationType === 'DEFAULT' 
        ? (selectedStyle !== 'None' ? `[${selectedStyle}] ${prompt}` : prompt)
        : `[${typeLabel}] ${prompt}`;

      const newItem: GeneratedItem = {
        id: crypto.randomUUID(),
        type: MediaType.IMAGE,
        url: imageUrl,
        prompt: displayPrompt,
        timestamp: Date.now(),
        aspectRatio,
      };

      onGenerateSuccess(newItem);
    } catch (err: any) {
      console.error("Image generation error:", err);
      let msg = err.message || "An unexpected error occurred.";
      
      if (msg.includes('403') || msg.includes('API key')) {
        msg = "Access denied. Please check your API key and ensure billing is enabled.";
      } else if (msg.includes('429') || msg.includes('quota')) {
        msg = "Daily quota exceeded. Please try again later.";
      } else if (msg.includes('503') || msg.includes('overloaded')) {
        msg = "AI Service is currently overloaded. Please try again in a moment.";
      } else if (msg.includes('SAFETY') || msg.includes('blocked') || msg.includes('No image data found')) {
        msg = "Generation blocked by safety guidelines. Please try a different prompt.";
      } else if (msg.includes('400')) {
        msg = "Invalid request. Please check your prompt and settings.";
      }

      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <WandIcon className="w-5 h-5 text-purple-400" />
          Create Image
        </h2>
        
        <div className="space-y-6">
          {/* Generation Type Selection */}
          <div>
             <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                <LayersIcon className="w-4 h-4" /> Generation Type
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {GENERATION_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setGenerationType(type.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center h-20 ${
                    generationType === type.id
                      ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-sm'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                  title={type.description}
                >
                  <type.icon className={`w-5 h-5 mb-1 ${generationType === type.id ? 'text-purple-400' : 'text-slate-500'}`} />
                  <span className="text-[10px] font-medium leading-tight">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Character Management (Only for ANIMATION_STORY) */}
          {generationType === 'ANIMATION_STORY' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 border border-purple-500/30 bg-purple-900/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-purple-300 flex items-center gap-2">
                   <UsersIcon className="w-4 h-4" /> Character Cast
                </label>
                <button 
                  onClick={handleAddCharacter}
                  className="text-xs flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded transition-colors"
                >
                  <PlusIcon className="w-3 h-3" /> Add Character
                </button>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {characters.map((char, index) => (
                  <div key={char.id} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-1">
                      <input 
                        type="text" 
                        placeholder="Name (e.g. Hero)"
                        value={char.name}
                        onChange={(e) => handleUpdateCharacter(char.id, 'name', e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-700 rounded p-1.5 text-xs text-white focus:border-purple-500 outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="Appearance (e.g. Blue hair, red scarf)"
                        value={char.description}
                        onChange={(e) => handleUpdateCharacter(char.id, 'description', e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-700 rounded p-1.5 text-xs text-slate-300 focus:border-purple-500 outline-none"
                      />
                    </div>
                    {characters.length > 1 && (
                      <button 
                        onClick={() => handleRemoveCharacter(char.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors mt-1"
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-purple-300/60 mt-2">
                Define your characters here. The AI will use these descriptions to maintain consistency in the storyboard.
              </p>
            </div>
          )}

          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              {generationType === 'ANIMATION_STORY' ? 'Story / Scene Description' : 'Prompt'}
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={generationType === 'ANIMATION_STORY' 
                ? "Describe what happens in this scene... (e.g. The Hero discovers a hidden cave while the Villain watches from the shadows)" 
                : "Describe your dream image..."}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none h-28 transition-all"
            />
          </div>

          {/* Style Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                <PaletteIcon className="w-4 h-4" /> Artistic Style
            </label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => setSelectedStyle(style.value)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-all border ${
                    selectedStyle === style.value
                      ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Buttons */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Aspect Ratio</label>
            <div className="grid grid-cols-5 gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.value}
                  onClick={() => setAspectRatio(ratio.value)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    aspectRatio === ratio.value
                      ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/30'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-6 h-6 border-2 rounded-sm mb-1 ${
                    aspectRatio === ratio.value ? 'border-white' : 'border-slate-500'
                  } ${ratio.value === '1:1' ? 'aspect-square' : ''} 
                    ${ratio.value === '16:9' ? 'w-8 h-4.5' : ''}
                    ${ratio.value === '9:16' ? 'w-4.5 h-8' : ''}
                    ${ratio.value === '4:3' ? 'w-7 h-5' : ''}
                    ${ratio.value === '3:4' ? 'w-5 h-7' : ''}
                  `} />
                  <span className="text-[10px] font-medium">{ratio.value}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Resolution Select */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Resolution</label>
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700">
              {['1K', '2K', '4K'].map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res as Resolution)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    resolution === res
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={`w-full py-4 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all shadow-lg shadow-purple-900/20
              ${isGenerating || !prompt.trim() 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white transform active:scale-[0.98]'
              }`}
          >
            {isGenerating ? (
              <>
                <LoaderIcon className="w-5 h-5 animate-spin" />
                {generationType !== 'DEFAULT' ? `Creating ${GENERATION_TYPES.find(t => t.id === generationType)?.label}...` : 'Dreaming...'}
              </>
            ) : (
              <>
                Generate Image <WandIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="text-xs text-slate-500 text-center px-4">
        Powered by Gemini 3 Pro Image Preview. High fidelity output.
      </div>
    </div>
  );
};

export default ImageStudio;