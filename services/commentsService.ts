/**
 * Comments Service
 * Manages guide comments, discussions, and threaded conversations
 */

export interface Comment {
  id: string;
  guideId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  parentId?: string; // For threaded replies
  likes: number;
  edited: boolean;
  editedAt?: number;
  mentions: string[]; // @username mentions
}

export interface CommentThread {
  id: string;
  guideId: string;
  comments: Comment[];
  totalReplies: number;
}

class CommentsService {
  private readonly STORAGE_KEY = 'wow_class_helper_comments';
  private readonly MAX_COMMENT_LENGTH = 5000;
  private readonly MIN_COMMENT_LENGTH = 1;

  /**
   * Add a new comment
   */
  addComment(
    guideId: string,
    userId: string,
    userName: string,
    content: string,
    parentId?: string
  ): Comment {
    if (!this.validateComment(content)) {
      throw new Error('Invalid comment');
    }

    const comment: Comment = {
      id: this.generateId(),
      guideId,
      userId,
      userName,
      content: this.sanitizeContent(content),
      timestamp: Date.now(),
      parentId,
      likes: 0,
      edited: false,
      mentions: this.extractMentions(content),
    };

    this.saveComment(comment);
    return comment;
  }

  /**
   * Get all comments for a guide
   */
  getGuideComments(guideId: string): Comment[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];

      const comments: Comment[] = JSON.parse(data);
      return comments.filter((c) => c.guideId === guideId).sort((a, b) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
  }

  /**
   * Get comment thread (parent + replies)
   */
  getCommentThread(commentId: string): CommentThread | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return null;

      const comments: Comment[] = JSON.parse(data);
      const parent = comments.find((c) => c.id === commentId);

      if (!parent) return null;

      const replies = comments.filter((c) => c.parentId === commentId);

      return {
        id: commentId,
        guideId: parent.guideId,
        comments: [parent, ...replies],
        totalReplies: replies.length,
      };
    } catch {
      return null;
    }
  }

  /**
   * Edit a comment
   */
  editComment(commentId: string, newContent: string): Comment | null {
    if (!this.validateComment(newContent)) {
      throw new Error('Invalid comment');
    }

    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return null;

      const comments: Comment[] = JSON.parse(data);
      const comment = comments.find((c) => c.id === commentId);

      if (!comment) return null;

      comment.content = this.sanitizeContent(newContent);
      comment.edited = true;
      comment.editedAt = Date.now();
      comment.mentions = this.extractMentions(newContent);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(comments));
      return comment;
    } catch {
      return null;
    }
  }

  /**
   * Delete a comment
   */
  deleteComment(commentId: string): boolean {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return false;

      const comments: Comment[] = JSON.parse(data);
      const filtered = comments.filter((c) => c.id !== commentId && c.parentId !== commentId);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Like a comment
   */
  likeComment(commentId: string): number | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return null;

      const comments: Comment[] = JSON.parse(data);
      const comment = comments.find((c) => c.id === commentId);

      if (!comment) return null;

      comment.likes++;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(comments));
      return comment.likes;
    } catch {
      return null;
    }
  }

  /**
   * Get comments by user
   */
  getUserComments(userId: string): Comment[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];

      const comments: Comment[] = JSON.parse(data);
      return comments.filter((c) => c.userId === userId).sort((a, b) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
  }

  /**
   * Get mentioned users in a comment
   */
  getMentionedUsers(commentId: string): string[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];

      const comments: Comment[] = JSON.parse(data);
      const comment = comments.find((c) => c.id === commentId);

      return comment?.mentions || [];
    } catch {
      return [];
    }
  }

  /**
   * Get comment statistics
   */
  getCommentStats(guideId: string): {
    totalComments: number;
    totalReplies: number;
    topCommenters: Array<{ userId: string; userName: string; count: number }>;
  } {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return { totalComments: 0, totalReplies: 0, topCommenters: [] };

      const comments: Comment[] = JSON.parse(data);
      const guideComments = comments.filter((c) => c.guideId === guideId);

      const totalComments = guideComments.filter((c) => !c.parentId).length;
      const totalReplies = guideComments.filter((c) => c.parentId).length;

      const commenterMap = new Map<string, { userName: string; count: number }>();
      guideComments.forEach((c) => {
        const existing = commenterMap.get(c.userId) || { userName: c.userName, count: 0 };
        commenterMap.set(c.userId, { ...existing, count: existing.count + 1 });
      });

      const topCommenters = Array.from(commenterMap.entries())
        .map(([userId, { userName, count }]) => ({ userId, userName, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return { totalComments, totalReplies, topCommenters };
    } catch {
      return { totalComments: 0, totalReplies: 0, topCommenters: [] };
    }
  }

  /**
   * Clear all comments for a guide
   */
  clearGuideComments(guideId: string): boolean {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return true;

      const comments: Comment[] = JSON.parse(data);
      const filtered = comments.filter((c) => c.guideId !== guideId);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  // Private helper methods

  private validateComment(content: string): boolean {
    return (
      typeof content === 'string' &&
      content.trim().length >= this.MIN_COMMENT_LENGTH &&
      content.length <= this.MAX_COMMENT_LENGTH
    );
  }

  private sanitizeContent(content: string): string {
    return content
      .trim()
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex) || [];
    return matches.map((m) => m.substring(1)); // Remove @ symbol
  }

  private generateId(): string {
    return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveComment(comment: Comment): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      const comments: Comment[] = data ? JSON.parse(data) : [];
      comments.push(comment);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(comments));
    } catch {
      console.error('Failed to save comment');
    }
  }
}

export const commentsService = new CommentsService();
