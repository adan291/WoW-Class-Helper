/**
 * Comment Thread Component
 * Displays a single comment thread with all replies
 */

import React, { useState, useCallback } from 'react';
import { commentsService, Comment } from '../services/commentsService';

interface CommentThreadProps {
  parentComment: Comment;
  replies: Comment[];
  currentUserId: string;
  currentUserName: string;
  onCommentUpdate: () => void;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  parentComment,
  replies,
  currentUserId,
  currentUserName,
  onCommentUpdate,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAddReply = useCallback(() => {
    if (!replyContent.trim()) return;

    try {
      commentsService.addComment(
        parentComment.guideId,
        currentUserId,
        currentUserName,
        replyContent,
        parentComment.id
      );
      setReplyContent('');
      setIsReplying(false);
      onCommentUpdate();
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  }, [parentComment, currentUserId, currentUserName, replyContent, onCommentUpdate]);

  const handleEditComment = useCallback(
    (commentId: string) => {
      if (!editContent.trim()) return;

      try {
        commentsService.editComment(commentId, editContent);
        setEditingId(null);
        setEditContent('');
        onCommentUpdate();
      } catch (error) {
        console.error('Failed to edit comment:', error);
      }
    },
    [editContent, onCommentUpdate]
  );

  const handleDeleteComment = useCallback(
    (commentId: string) => {
      if (window.confirm('Delete this comment?')) {
        try {
          commentsService.deleteComment(commentId);
          onCommentUpdate();
        } catch (error) {
          console.error('Failed to delete comment:', error);
        }
      }
    },
    [onCommentUpdate]
  );

  const handleLikeComment = useCallback(
    (commentId: string) => {
      try {
        commentsService.likeComment(commentId);
        onCommentUpdate();
      } catch (error) {
        console.error('Failed to like comment:', error);
      }
    },
    [onCommentUpdate]
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
    return content.replace(/@(\w+)/g, '<span class="text-blue-400 font-semibold">@$1</span>');
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`p-3 rounded border transition ${
        isReply
          ? 'bg-gray-800 border-gray-700 ml-4'
          : 'bg-gray-800 border-gray-700'
      } hover:border-gray-600`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-white">{comment.userName}</p>
            {isReply && (
              <span className="text-xs px-2 py-0.5 bg-blue-900 text-blue-200 rounded">
                Reply
              </span>
            )}
          </div>
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
              className="text-xs text-blue-400 hover:text-blue-300 transition"
              title="Edit comment"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteComment(comment.id)}
              className="text-xs text-red-400 hover:text-red-300 transition"
              title="Delete comment"
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
            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none resize-none text-sm"
            rows={3}
            maxLength={5000}
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleEditComment(comment.id)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
            >
              Save
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p
          className="text-gray-200 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: highlightMentions(comment.content),
          }}
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
        <button
          onClick={() => handleLikeComment(comment.id)}
          className="hover:text-blue-400 transition flex items-center gap-1"
          title="Like this comment"
        >
          <span>👍</span>
          <span>{comment.likes}</span>
        </button>
        {!isReply && (
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="hover:text-blue-400 transition"
            title="Reply to this comment"
          >
            Reply
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Parent Comment */}
      {renderComment(parentComment, false)}

      {/* Reply Form */}
      {isReplying && (
        <div className="ml-4 p-3 bg-gray-800 rounded border border-gray-700 space-y-2">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply... (use @username to mention)"
            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none resize-none text-sm"
            rows={2}
            maxLength={5000}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {replyContent.length}/5000
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleAddReply}
                disabled={!replyContent.trim()}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Reply
              </button>
              <button
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent('');
                }}
                className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div className="space-y-2">
          {replies.map((reply) => renderComment(reply, true))}
        </div>
      )}

      {/* No Replies Message */}
      {!isReplying && replies.length === 0 && (
        <p className="text-xs text-gray-500 ml-4 italic">No replies yet</p>
      )}
    </div>
  );
};
