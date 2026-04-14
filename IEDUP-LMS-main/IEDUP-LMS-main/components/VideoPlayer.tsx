import React from 'react';

interface VideoPlayerProps {
  src: string;
  type?: string;
  width?: string | number;
  height?: string | number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, type = 'video/webm', width = '100%', height = 360 }) => {
  const resolvedWidth = typeof width === 'number' ? `${width}px` : width;
  const resolvedHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <video
      controls
      preload="auto"
      crossOrigin="anonymous"
      style={{
        width: resolvedWidth,
        maxWidth: '100%',
        height: 'auto',
        maxHeight: resolvedHeight,
        aspectRatio: '16 / 9',
        borderRadius: 8,
        background: '#000',
      }}
    >
      <source src={src} type={type} />
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoPlayer;
