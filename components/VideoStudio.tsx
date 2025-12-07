import React, { useState } from 'react';
import { generateVideo } from '../services/geminiService';
import { GeneratedItem, MediaType, VideoResolution } from '../types';
import { FilmIcon, LoaderIcon } from './Icons';

interface VideoStudioProps {
  onGenerateSuccess: (item: GeneratedItem) => void;
}

const VideoStudio: React.FC<VideoStudioProps> = ({ onGenerateSuccess }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [resolution, setResolution] = useState<VideoResolution>("720p");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      const videoUrl = await generateVideo({ prompt, aspectRatio, resolution });
      
      const newItem: GeneratedItem = {
        id: crypto.randomUUID(),
        type: MediaType.VIDEO,
        url: videoUrl,
        prompt,
        timestamp: Date.now(),
        aspectRatio,
      };

      onGenerateSuccess(newItem);
    } catch (err: any) {
      console.error("Video generation error:", err);
      let msg = err.message || "An unexpected error occurred.";

      // Map common error codes/messages to user-friendly text
      if (msg.includes('403') || msg.includes('API key')) {
        msg = "Access denied. Please check your API key and ensure billing is enabled.";
      } else if (msg.includes('429') || msg.includes('quota')) {
        msg = "Daily quota exceeded. Please try again later.";
      } else if (msg.includes('503') || msg.includes('overloaded')) {
        msg = "Veo Service is high demand. Please try again in a moment.";
      } else if (msg.includes('SAFETY') || msg.includes('blocked')) {
        msg = "Video generation blocked by safety guidelines. Please try a different prompt.";
      } else if (msg.includes('Video generation failed')) {
        msg = "Generation failed. The model may be busy or the prompt was filtered.";
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
          <FilmIcon className="w-5 h-5 text-pink-400" />
          Create Video (Veo)
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Prompt</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the video you want to see... (e.g., A cinematic drone shot of a futuristic city)"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none h-32"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Aspect Ratio</label>
              <select 
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as "16:9" | "9:16")}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="16:9">16:9 (Landscape)</option>
                <option value="9:16">9:16 (Portrait)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Resolution</label>
              <select 
                value={resolution}
                onChange={(e) => setResolution(e.target.value as VideoResolution)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="720p">720p (Fast)</option>
                <option value="1080p">1080p (HD)</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="bg-blue-900/20 border border-blue-800/50 p-3 rounded-lg text-xs text-blue-200">
             <strong>Note:</strong> Video generation uses Google Veo and requires a paid billing project. You will be prompted to select your API key if you haven't already. Generation may take 1-2 minutes.
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all shadow-lg shadow-pink-900/20
              ${isGenerating || !prompt.trim() 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-500 hover:to-orange-500 text-white transform active:scale-[0.98]'
              }`}
          >
            {isGenerating ? (
              <>
                <LoaderIcon className="w-5 h-5 animate-spin" />
                Synthesizing Video...
              </>
            ) : (
              <>
                Generate Video <FilmIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;