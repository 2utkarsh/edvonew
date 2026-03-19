'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Play, Youtube, ExternalLink } from 'lucide-react';
import { getCourseArtwork } from '@/lib/marketing-images';

const YouTubeSection = () => {
  const videos = [
    { id: 1, title: 'AI Engineer Roadmap | How I\'d Learn AI in 2026', views: '700K+', duration: '45:30' },
    { id: 2, title: 'Python Pandas | Introduction & Installation', views: '700K+', duration: '32:15' },
    { id: 3, title: 'How to become an expert in Python', views: '700K+', duration: '28:45' },
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Watch on Youtube</h2>
          <div className="flex items-center gap-2">
            <Youtube className="w-6 h-6 text-red-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">1.4M+ Subscribers</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Card key={video.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
              <div className="relative aspect-video overflow-hidden bg-gray-900">
                <img
                  src={getCourseArtwork(video.title)}
                  alt={video.title}
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/25">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold line-clamp-2 mb-2 text-slate-900 dark:text-white">{video.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{video.views} views</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <a href="https://youtube.com/@edvo" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg">
              Open Channel <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default YouTubeSection;
