/**
 * Video Player Component
 * Display and manage video tutorials
 */

import React, { useState, useCallback, useMemo } from 'react';
import { videoService, VideoTutorial } from '../services/videoService';

interface VideoPlayerProps {
  videoId: string;
  onVideoEnd?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, onVideoEnd }) => {
  const [video, setVideo] = useState<VideoTutorial | null>(() =>
    videoService.getVideo(videoId)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null);

  const recommended = useMemo(
    () => (video ? videoService.getRecommendedVideos(video.id, 5) : []),
    [video]
  );

  const handlePlay = useCallback(() => {
    if (video) {
      videoService.viewVideo(video.id);
      setIsPlaying(true);
    }
  }, [video]);

  const handleLike = useCallback(() => {
    if (video) {
      videoService.likeVideo(video.id);
      const updated = videoService.getVideo(video.id);
      if (updated) {
        setVideo(updated);
      }
    }
  }, [video]);

  const handleRate = useCallback(
    (rating: number) => {
      if (video) {
        videoService.rateVideo(video.id, rating);
        const updated = videoService.getVideo(video.id);
        if (updated) {
          setVideo(updated);
        }
      }
    },
    [video]
  );

  const handleVideoEnd = useCallback(() => {
    setIsPlaying(false);
    onVideoEnd?.();
  }, [onVideoEnd]);

  if (!video) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-8 text-center text-gray-400">
        <p>Video not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
        {/* Video Container */}
        <div className="bg-black aspect-video flex items-center justify-center relative">
          <video
            src={video.url}
            controls
            onPlay={handlePlay}
            onEnded={handleVideoEnd}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onVolumeChange={(e) => setVolume(e.currentTarget.volume)}
            className="w-full h-full"
          />
        </div>

        {/* Video Info */}
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{video.title}</h2>
            <p className="text-gray-400 text-sm mt-2">{video.description}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 bg-gray-800 rounded">
              <p className="text-2xl font-bold text-blue-400">{video.views}</p>
              <p className="text-xs text-gray-400">Views</p>
            </div>
            <div className="p-3 bg-gray-800 rounded">
              <p className="text-2xl font-bold text-red-400">{video.likes}</p>
              <p className="text-xs text-gray-400">Likes</p>
            </div>
            <div className="p-3 bg-gray-800 rounded">
              <p className="text-2xl font-bold text-yellow-400">
                {video.rating.toFixed(1)}
              </p>
              <p className="text-xs text-gray-400">Rating</p>
            </div>
            <div className="p-3 bg-gray-800 rounded">
              <p className="text-2xl font-bold text-green-400">
                {videoService.formatDuration(video.duration)}
              </p>
              <p className="text-xs text-gray-400">Duration</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleLike}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              👍 Like
            </button>

            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRate(rating)}
                  className={`px-2 py-2 rounded transition ${
                    video.rating >= rating
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              📝 Transcript
            </button>

            {video.captions.length > 0 && (
              <select
                value={selectedCaption || ''}
                onChange={(e) => setSelectedCaption(e.target.value || null)}
                className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="">No Captions</option>
                {video.captions.map((caption) => (
                  <option key={caption.language} value={caption.language}>
                    {caption.language}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Tags */}
          {video.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {video.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transcript */}
      {showTranscript && video.transcripts.length > 0 && (
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Transcript</h3>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {video.transcripts[0].timestamps.map((ts, idx) => (
              <div key={idx} className="p-3 bg-gray-800 rounded">
                <p className="text-xs text-gray-400 mb-1">
                  {videoService.formatDuration(ts.time)}
                </p>
                <p className="text-sm text-gray-200">{ts.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Videos */}
      {recommended.length > 0 && (
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recommended</h3>

          <div className="space-y-3">
            {recommended.map((rec) => (
              <div
                key={rec.id}
                className="p-3 bg-gray-800 rounded hover:bg-gray-700 transition cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">{rec.title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {rec.views} views • {videoService.formatDuration(rec.duration)}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded capitalize">
                    {rec.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Video Library Component
 */
interface VideoLibraryProps {
  onVideoSelect?: (videoId: string) => void;
}

export const VideoLibrary: React.FC<VideoLibraryProps> = ({ onVideoSelect }) => {
  const [videos, setVideos] = useState<VideoTutorial[]>(() => videoService.getAllVideos());
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVideos = useMemo(() => {
    let result = videos;

    if (filter !== 'all') {
      result = result.filter((v) => v.difficulty === filter);
    }

    if (searchQuery) {
      result = videoService.searchVideos(searchQuery);
    }

    return result;
  }, [videos, filter, searchQuery]);

  const stats = useMemo(() => videoService.getVideoStats(), []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Video Tutorials</h2>
        <p className="text-gray-400 text-sm">Learn from our comprehensive video library</p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="p-3 bg-gray-800 rounded">
            <p className="text-2xl font-bold text-blue-400">{stats.totalVideos}</p>
            <p className="text-xs text-gray-400">Videos</p>
          </div>
          <div className="p-3 bg-gray-800 rounded">
            <p className="text-2xl font-bold text-green-400">{stats.totalViews}</p>
            <p className="text-xs text-gray-400">Total Views</p>
          </div>
          <div className="p-3 bg-gray-800 rounded">
            <p className="text-2xl font-bold text-red-400">{stats.totalLikes}</p>
            <p className="text-xs text-gray-400">Total Likes</p>
          </div>
          <div className="p-3 bg-gray-800 rounded">
            <p className="text-2xl font-bold text-yellow-400">
              {stats.averageRating.toFixed(1)}
            </p>
            <p className="text-xs text-gray-400">Avg Rating</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 space-y-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search videos..."
          className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
        />

        <div className="flex gap-2">
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-sm rounded transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVideos.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-8">
            <p>No videos found</p>
          </div>
        ) : (
          filteredVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => onVideoSelect?.(video.id)}
              className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="bg-black aspect-video flex items-center justify-center">
                <span className="text-4xl">▶️</span>
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-white line-clamp-2">{video.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-2">{video.description}</p>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{videoService.formatDuration(video.duration)}</span>
                  <span className="px-2 py-1 bg-gray-800 rounded capitalize">
                    {video.difficulty}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{video.views} views</span>
                  <span className="text-yellow-400">⭐ {video.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
