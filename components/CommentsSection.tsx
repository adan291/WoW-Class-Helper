/**
 * Comments Section Component
 * Displays and manages guide comments with threading support
 */

import React, { useState, useCallback, useMemo } from 'react';
import { commentsService, Comment } from '../services/commentsService';

interface CommentsSectionProps {
  guideId: string;
  currentUserId: string;
  currentUserName: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  guideId,
  currentUserId,
  currentUserName,
}) => {
  const [comments, setComments] = useState<Comment[]>(() =>
    commentsService.getGuideComments(guideId)
  );
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());

  const stats = useMemo(() => commentsService.getCommentStats(guideId), [guideId]);

  const handleAddComment = useCallback(() => {
    if (!newComment.trim()) return;

    try {
      const comment = commentsService.addComment(
        guideId,
        currentUserId,
        currentUserName,
        newComment
      );
      setComments((prev) => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  }, [guideId, currentUserId, currentUserName, newComment]);

  const handleReply = useCallback(
    (parentId: string) => {
      if (!replyContent.trim()) return;

      try {
        const reply = commentsService.addComment(
          guideId,
          currentUserId,
          currentUserName,
          replyContent,
          parentId
        );
        setComments((prev) => [...prev, reply]);
        setReplyContent('');
        setReplyingTo(null);
      } catch (error) {
        console.error('Failed to add reply:', error);
      }
    },
    [guideId, currentUserId, currentUserName, replyContent]
  );

  const handleEditComment = useCallback(
    (commentId: string) => {
      if (!editContent.trim()) return;

      try {
        const updated = commentsService.editComment(commentId, editContent);
        if (updated) {
          setComments((prev) =>
            prev.map((c) => (c.id === commentId ? updated : c))
          );
          setEditingId(null);
          setEditContent('');
        }
      } catch (error) {
        console.error('Failed to edit comment:', error);
      }
    },
    [editContent]
  );

  const handleDeleteComment = useCallback((commentId: string) => {
    if (window.confirm('Delete this comment?')) {
      try {
        commentsService.deleteComment(commentId);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    }
  }, []);

  const handleLikeComment = useCallback((commentId: string) => {
    try {
      const likes = commentsService.likeComment(commentId);
      if (likes !== null) {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, likes } : c))
        );
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  }, []);

  const toggleThread = useCallback((commentId: string) => {
    setExpandedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  }, []);

  const topLevelComments = useMemo(
    () => comments.filter((c) => !c.parentId),
    [comments]
  );

  const getReplies = useCallback(
    (parentId: string) => comments.filter((c) => c.parentId === parentId),
    [comments]
  );

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const highlightMentions = (content: string) => {
    return content.replace(/@(\w+)/g, '<span class="text-blue-400">@$1</span>');
  };

  return (
    <div className="space-y-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Comments</h3>
        <div className="text-sm text-gray-400">
          {stats.totalComments} comments • {stats.totalReplies} replies
        </div>
      </div>

      {/* New Comment Form */}
      <div className="space-y-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts... (use @username to mention)"
          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
          rows={3}
          maxLength={5000}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {newComment.length}/5000
          </span>
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Post Comment
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {topLevelComments.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          topLevelComments.map((comment) => {
            const replies = getReplies(comment.id);
            const isExpanded = expandedThreads.has(comment.id);

            return (
              <div key={comment.id} className="space-y-2">
                {/* Main Comment */}
                <div className="p-3 bg-gray-800 rounded border border-gray-700 hover:border-gray-600 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-white">
                        {comment.userName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatTime(comment.timestamp)}
                        {comment.edited && ' (edited)'}
                      </p>
                    </div>
                    {comment.userId === currentUserId && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditContent(comment.content);
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Edit Mode */}
                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditComment(comment.id)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p
                      className="text-gray-200 text-sm"
                      dangerouslySetInnerHTML={{
                        __html: highlightMentions(comment.content),
                      }}
                    />
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className="hover:text-blue-400 transition"
                    >
                      👍 {comment.likes}
                    </button>
                    <button
                      onClick={() => setReplyingTo(comment.id)}
                      className="hover:text-blue-400 transition"
                    >
                      Reply
                    </button>
                    {replies.length > 0 && (
                      <button
                        onClick={() => toggleThread(comment.id)}
                        className="hover:text-blue-400 transition"
                      >
                        {isExpanded ? '▼' : '▶'} {replies.length} replies
                      </button>
                    )}
                  </div>
                </div>

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <div className="ml-6 p-3 bg-gray-800 rounded border border-gray-700 space-y-2">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReply(comment.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                        className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {isExpanded && replies.length > 0 && (
                  <div className="ml-6 space-y-2">
                    {replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="p-3 bg-gray-800 rounded border border-gray-700 hover:border-gray-600 transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-white text-sm">
                              {reply.userName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatTime(reply.timestamp)}
                            </p>
                          </div>
                          {reply.userId === currentUserId && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingId(reply.id);
                                  setEditContent(reply.content);
                                }}
                                className="text-xs text-blue-400 hover:text-blue-300"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteComment(reply.id)}
                                className="text-xs text-red-400 hover:text-red-300"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>

                        {editingId === reply.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditComment(reply.id)}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p
                            className="text-gray-200 text-sm"
                            dangerouslySetInnerHTML={{
                              __html: highlightMentions(reply.content),
                            }}
                          />
                        )}

                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <button
                            onClick={() => handleLikeComment(reply.id)}
                            className="hover:text-blue-400 transition"
                          >
                            👍 {reply.likes}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Top Commenters */}
      {stats.topCommenters.length > 0 && (
        <div className="p-3 bg-gray-800 rounded border border-gray-700">
          <h4 className="text-sm font-semibold text-white mb-2">
            Top Commenters
          </h4>
          <div className="space-y-1">
            {stats.topCommenters.map((commenter, idx) => (
              <div key={commenter.userId} className="flex items-center gap-2 text-xs text-gray-300">
                <span className="text-gray-500">#{idx + 1}</span>
                <span>{commenter.userName}</span>
                <span className="text-gray-500">({commenter.count})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
