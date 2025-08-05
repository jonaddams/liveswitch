'use client'

import { sampleImages } from '@/lib/sample-images'

interface PhotosPanelProps {
  onDragStart: (imageData: string) => void;
  onDragEnd: () => void;
}

export default function PhotosPanel({ onDragStart, onDragEnd }: PhotosPanelProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, imageData: string) => {
    console.log('Drag started with image:', imageData.substring(0, 50) + '...');
    onDragStart(imageData);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    onDragEnd();
    e.currentTarget.style.opacity = '1';
  };

  return (
    <div className="photos-panel">
      <div className="photos-header">
        <h2>Photos</h2>
      </div>
      <div className="photos-grid">
        {sampleImages.map((imageData, index) => (
          <div
            key={index}
            className="photo-item"
            draggable
            style={{ backgroundImage: `url(${imageData})` }}
            onDragStart={(e) => handleDragStart(e, imageData)}
            onDragEnd={handleDragEnd}
          >
            <div className="photo-select-indicator">○</div>
          </div>
        ))}
      </div>
    </div>
  );
}