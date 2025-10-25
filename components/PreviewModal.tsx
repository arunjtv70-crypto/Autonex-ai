
import React from 'react';
import XIcon from './icons/XIcon';

interface PreviewModalProps {
  media: { url: string; type: 'image' | 'video' };
  onClose: () => void;
  theme: 'light' | 'dark';
}

const PreviewModal: React.FC<PreviewModalProps> = ({ media, onClose, theme }) => {
  const isDark = theme === 'dark';

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 200ms ease-out forwards;
        }
      `}</style>
      <button 
        onClick={onClose}
        className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isDark ? 'text-gray-300 bg-gray-800/50 hover:bg-gray-700/70' : 'text-gray-600 bg-white/50 hover:bg-white/70'}`}
        aria-label="Close preview"
      >
        <XIcon className="w-6 h-6" />
      </button>
      <div 
        className="relative max-w-full max-h-full animate-fade-in"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the media
      >
        {media.type === 'image' ? (
          <img src={media.url} alt="Fullscreen preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
        ) : (
          <video src={media.url} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" controls autoPlay loop />
        )}
      </div>
    </div>
  );
};

export default PreviewModal;
