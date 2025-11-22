import React from 'react';
import { WowClass } from '../types.ts';

interface VideoTutorialsProps {
    wowClass: WowClass;
}

export const VideoTutorials: React.FC<VideoTutorialsProps> = ({ wowClass }) => {
    // Mock data if no videos are present (for demonstration)
    const videos = wowClass.videoTutorials || [
        {
            title: `${wowClass.name} Overview & Basics`,
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
            thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg`
        },
        {
            title: `Advanced ${wowClass.name} Rotation Guide`,
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
            thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg`
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-white">
                    Video Tutorials
                </h2>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                    YouTube
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((video, index) => (
                    <a
                        key={index}
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative block overflow-hidden rounded-xl border border-gray-700 bg-gray-800 hover:border-gray-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                    >
                        <div className="aspect-video w-full overflow-hidden bg-gray-900 relative">
                            {video.thumbnail ? (
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-600">
                                    <span className="text-4xl">▶</span>
                                </div>
                            )}

                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-100 group-hover:text-blue-400 transition-colors line-clamp-2">
                                {video.title}
                            </h3>
                            <p className="mt-2 text-sm text-gray-400 flex items-center gap-2">
                                <span>Watch on YouTube</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};
