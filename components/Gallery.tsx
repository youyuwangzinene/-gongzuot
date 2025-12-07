import React, { useState } from 'react';
import { GeneratedItem, MediaType } from '../types';
import { DownloadIcon, MaximizeIcon, FilmIcon, PhotoIcon, TrashIcon, EditIcon } from './Icons';
import ImageEditor from './ImageEditor';

interface GalleryProps {
  items: GeneratedItem[];
  onDelete: (id: string) => void;
  onSaveNewItem: (item: GeneratedItem) => void;
}

const Gallery: React.FC<GalleryProps> = ({ items, onDelete, onSaveNewItem }) => {
  const [selectedItem, setSelectedItem] = useState<GeneratedItem | null>(null);
  const [editingItem, setEditingItem] = useState<GeneratedItem | null>(null);

  const handleSaveEdited = (newUrl: string) => {
    if (!editingItem) return;

    const newItem: GeneratedItem = {
      id: crypto.randomUUID(),
      type: MediaType.IMAGE,
      url: newUrl,
      prompt: `[Edited] ${editingItem.prompt}`,
      timestamp: Date.now(),
      aspectRatio: editingItem.aspectRatio // This might have technically changed due to crop, but we keep metadata simple
    };

    onSaveNewItem(newItem);
    setEditingItem(null);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/20">
        <div className="bg-slate-800 p-4 rounded-full mb-4">
            <PhotoIcon className="w-8 h-8 opacity-50" />
        </div>
        <p className="text-lg font-medium">No creations yet</p>
        <p className="text-sm">Start dreaming to see your gallery fill up.</p>
      </div>
    );
  }

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
      {items.map((item) => (
        <div 
          key={item.id} 
          className="group relative bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-xl transition-all hover:scale-[1.01] hover:border-slate-600"
        >
          {/* Media Container */}
          <div className="relative aspect-square md:aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
             {item.type === MediaType.IMAGE ? (
               <img src={item.url} alt={item.prompt} className="w-full h-full object-cover" loading="lazy" />
             ) : (
                <video src={item.url} controls className="w-full h-full object-cover" />
             )}
             
             {/* Overlay */}
             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                <button 
                  onClick={() => setSelectedItem(item)}
                  className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
                  title="View Fullscreen"
                >
                  <MaximizeIcon className="w-5 h-5" />
                </button>
                
                {item.type === MediaType.IMAGE && (
                  <button 
                    onClick={() => setEditingItem(item)}
                    className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
                    title="Edit Image"
                  >
                    <EditIcon className="w-5 h-5" />
                  </button>
                )}

                <a 
                  href={item.url} 
                  download={`dreamina-${item.id}.${item.type === MediaType.IMAGE ? 'png' : 'mp4'}`}
                  className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
                  title="Download"
                >
                  <DownloadIcon className="w-5 h-5" />
                </a>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="p-3 bg-red-500/10 hover:bg-red-500/30 backdrop-blur-md rounded-full text-red-400 hover:text-red-200 transition-colors border border-red-500/20"
                  title="Delete"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
             </div>
             
             {/* Type Badge */}
             <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-xs font-semibold text-white flex items-center gap-1">
               {item.type === MediaType.IMAGE ? <PhotoIcon className="w-3 h-3" /> : <FilmIcon className="w-3 h-3" />}
               {item.type === MediaType.IMAGE ? 'IMG' : 'VEO'}
             </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed mb-2 font-light">
              "{item.prompt}"
            </p>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
              <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">{item.aspectRatio}</span>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Modal for Fullscreen View */}
    {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setSelectedItem(null)}>
            <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
                {selectedItem.type === MediaType.IMAGE ? (
                    <img src={selectedItem.url} alt={selectedItem.prompt} className="max-w-full max-h-[80vh] rounded-lg shadow-2xl" />
                ) : (
                    <video src={selectedItem.url} controls autoPlay className="max-w-full max-h-[80vh] rounded-lg shadow-2xl" />
                )}
                <div className="mt-4 w-full bg-slate-900 p-4 rounded-xl border border-slate-800">
                     <p className="text-white text-center font-light">{selectedItem.prompt}</p>
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute -top-12 right-0 text-white hover:text-slate-300"
                >
                    Close
                </button>
            </div>
        </div>
    )}

    {/* Modal for Image Editing */}
    {editingItem && (
      <ImageEditor 
        imageSrc={editingItem.url}
        onCancel={() => setEditingItem(null)}
        onSave={handleSaveEdited}
      />
    )}
    </>
  );
};

export default Gallery;