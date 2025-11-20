/**
 * Video Service
 * Manages video tutorials and playback
 */

export interface VideoTimestamp {
  time: number; // in seconds
  label: string;
}

export interface VideoTranscript {
  id: string;
  language: string;
  content: string;
  timestamps: VideoTimestamp[];
}

export interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  duration: number; // in seconds
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  transcripts: VideoTranscript[];
  captions: {
    language: string;
    url: string;
  }[];
  views: number;
  likes: number;
  rating: number;
  createdAt: number;
  updatedAt: number;
}

export interface PlaybackState {
  videoId: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  volume: number;
  playbackRate: number;
}

class VideoService {
  private readonly VIDEOS_KEY = 'wow_class_helper_videos';
  private readonly PLAYBACK_KEY = 'wow_class_helper_playback_state';
  private readonly WATCH_HISTORY_KEY = 'wow_class_helper_watch_history';

  /**
   * Create video tutorial
   */
  createVideo(
    title: string,
    description: string,
    url: string,
    duration: number,
    category: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  ): VideoTutorial {
    const video: VideoTutorial = {
      id: this.generateId(),
      title,
      description,
      url,
      duration,
      category,
      difficulty,
      tags: [],
      transcripts: [],
      captions: [],
      views: 0,
      likes: 0,
      rating: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.saveVideo(video);
    return video;
  }

  /**
   * Get video by ID
   */
  getVideo(videoId: string): VideoTutorial | null {
    try {
      const data = localStorage.getItem(this.VIDEOS_KEY);
      if (!data) return null;

      const videos: VideoTutorial[] = JSON.parse(data);
      return videos.find((v) => v.id === videoId) || null;
    } catch {
      return null;
    }
  }

  /**
   * Get all videos
   */
  getAllVideos(): VideoTutorial[] {
    try {
      const data = localStorage.getItem(this.VIDEOS_KEY);
      if (!data) return [];

      const videos: VideoTutorial[] = JSON.parse(data);
      return videos.sort((a, b) => b.createdAt - a.createdAt);
    } catch {
      return [];
    }
  }

  /**
   * Get videos by category
   */
  getVideosByCategory(category: string): VideoTutorial[] {
    return this.getAllVideos().filter((v) => v.category === category);
  }

  /**
   * Get videos by difficulty
   */
  getVideosByDifficulty(difficulty: string): VideoTutorial[] {
    return this.getAllVideos().filter((v) => v.difficulty === difficulty);
  }

  /**
   * Search videos
   */
  searchVideos(query: string): VideoTutorial[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllVideos().filter(
      (v) =>
        v.title.toLowerCase().includes(lowerQuery) ||
        v.description.toLowerCase().includes(lowerQuery) ||
        v.tags.some((t) => t.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Add transcript
   */
  addTranscript(videoId: string, transcript: Omit<VideoTranscript, 'id'>): boolean {
    const video = this.getVideo(videoId);
    if (!video) return false;

    const newTranscript: VideoTranscript = {
      ...transcript,
      id: this.generateId(),
    };

    video.transcripts.push(newTranscript);
    this.updateVideo(videoId, video);
    return true;
  }

  /**
   * Add caption
   */
  addCaption(videoId: string, language: string, url: string): boolean {
    const video = this.getVideo(videoId);
    if (!video) return false;

    video.captions.push({ language, url });
    this.updateVideo(videoId, video);
    return true;
  }

  /**
   * View video
   */
  viewVideo(videoId: string): number | null {
    const video = this.getVideo(videoId);
    if (!video) return null;

    video.views++;
    this.updateVideo(videoId, video);

    // Add to watch history
    this.addToWatchHistory(videoId);

    return video.views;
  }

  /**
   * Like video
   */
  likeVideo(videoId: string): number | null {
    const video = this.getVideo(videoId);
    if (!video) return null;

    video.likes++;
    this.updateVideo(videoId, video);
    return video.likes;
  }

  /**
   * Rate video
   */
  rateVideo(videoId: string, rating: number): boolean {
    const video = this.getVideo(videoId);
    if (!video) return false;

    if (rating < 0 || rating > 5) return false;

    video.rating = rating;
    this.updateVideo(videoId, video);
    return true;
  }

  /**
   * Save playback state
   */
  savePlaybackState(state: PlaybackState): void {
    try {
      localStorage.setItem(this.PLAYBACK_KEY, JSON.stringify(state));
    } catch {
      console.error('Failed to save playback state');
    }
  }

  /**
   * Get playback state
   */
  getPlaybackState(videoId: string): PlaybackState | null {
    try {
      const data = localStorage.getItem(this.PLAYBACK_KEY);
      if (!data) return null;

      const state: PlaybackState = JSON.parse(data);
      return state.videoId === videoId ? state : null;
    } catch {
      return null;
    }
  }

  /**
   * Get watch history
   */
  getWatchHistory(): VideoTutorial[] {
    try {
      const data = localStorage.getItem(this.WATCH_HISTORY_KEY);
      if (!data) return [];

      const history: string[] = JSON.parse(data);
      const videos: VideoTutorial[] = [];

      for (const videoId of history) {
        const video = this.getVideo(videoId);
        if (video) {
          videos.push(video);
        }
      }

      return videos;
    } catch {
      return [];
    }
  }

  /**
   * Clear watch history
   */
  clearWatchHistory(): void {
    try {
      localStorage.removeItem(this.WATCH_HISTORY_KEY);
    } catch {
      console.error('Failed to clear watch history');
    }
  }

  /**
   * Get recommended videos
   */
  getRecommendedVideos(videoId: string, limit = 5): VideoTutorial[] {
    const video = this.getVideo(videoId);
    if (!video) return [];

    const allVideos = this.getAllVideos();
    const recommended = allVideos
      .filter(
        (v) =>
          v.id !== videoId &&
          (v.category === video.category || v.tags.some((t) => video.tags.includes(t)))
      )
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);

    return recommended;
  }

  /**
   * Get video statistics
   */
  getVideoStats(): {
    totalVideos: number;
    totalViews: number;
    totalLikes: number;
    averageRating: number;
  } {
    const videos = this.getAllVideos();

    const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
    const totalLikes = videos.reduce((sum, v) => sum + v.likes, 0);
    const averageRating =
      videos.length > 0 ? videos.reduce((sum, v) => sum + v.rating, 0) / videos.length : 0;

    return {
      totalVideos: videos.length,
      totalViews,
      totalLikes,
      averageRating,
    };
  }

  /**
   * Get trending videos
   */
  getTrendingVideos(limit = 10): VideoTutorial[] {
    return this.getAllVideos()
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }

  /**
   * Format duration
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    return `${minutes}:${String(secs).padStart(2, '0')}`;
  }

  // Private helper methods

  private updateVideo(videoId: string, video: VideoTutorial): void {
    try {
      const data = localStorage.getItem(this.VIDEOS_KEY);
      if (!data) return;

      const videos: VideoTutorial[] = JSON.parse(data);
      const index = videos.findIndex((v) => v.id === videoId);

      if (index >= 0) {
        videos[index] = { ...video, updatedAt: Date.now() };
        localStorage.setItem(this.VIDEOS_KEY, JSON.stringify(videos));
      }
    } catch {
      console.error('Failed to update video');
    }
  }

  private saveVideo(video: VideoTutorial): void {
    try {
      const data = localStorage.getItem(this.VIDEOS_KEY);
      const videos: VideoTutorial[] = data ? JSON.parse(data) : [];
      videos.push(video);
      localStorage.setItem(this.VIDEOS_KEY, JSON.stringify(videos));
    } catch {
      console.error('Failed to save video');
    }
  }

  private addToWatchHistory(videoId: string): void {
    try {
      const data = localStorage.getItem(this.WATCH_HISTORY_KEY);
      const history: string[] = data ? JSON.parse(data) : [];

      // Remove if already exists
      const filtered = history.filter((id) => id !== videoId);

      // Add to beginning
      filtered.unshift(videoId);

      // Keep only last 50
      if (filtered.length > 50) {
        filtered.pop();
      }

      localStorage.setItem(this.WATCH_HISTORY_KEY, JSON.stringify(filtered));
    } catch {
      console.error('Failed to add to watch history');
    }
  }

  private generateId(): string {
    return `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const videoService = new VideoService();
