import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, MessageCircle, Share, Trash2, X } from 'lucide-react';
import api from '../../lib/axios';
import { Post } from '../../types';
import Avatar from '../atoms/Avatar';
import useAuthStore from '../../store/useAuthStore';

interface PostCardProps {
  post: Post;
  onPostUpdate?: (updatedPost: any) => void;
}

const PostCard = ({ post, onPostUpdate }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(
    post.likes.some(
      (l: any) =>
        l._id === useAuthStore.getState().user?._id ||
        l === useAuthStore.getState().user?._id
    )
  );
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const likePostMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/posts/${post._id}/like`);
      return response.data;
    },
    onSuccess: (data) => {
      setIsLiked(true);
      onPostUpdate?.(data);
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });

  const unlikePostMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/posts/${post._id}/like`);
      return response.data;
    },
    onSuccess: (data) => {
      setIsLiked(false);
      onPostUpdate?.(data);
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });

  const commentPostMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/posts/${post._id}/comment`, {
        text: commentText
      });
      return response.data;
    },
    onSuccess: (data) => {
      setCommentText('');
      onPostUpdate?.(data);
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await api.delete(
        `/posts/${post._id}/comment/${commentId}`
      );
      return response.data;
    },
    onSuccess: (data) => {
      onPostUpdate?.(data);
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });

  const handleLikeToggle = () => {
    if (isLiked) {
      unlikePostMutation.mutate();
    } else {
      likePostMutation.mutate();
    }
  };

  const handleComment = () => {
    if (commentText.trim()) {
      commentPostMutation.mutate();
    }
  };

  const handleShare = () => {
    const shareText = `Check this out: "${post.content.substring(0, 100)}..."`;
    if (navigator.share) {
      navigator.share({
        title: 'CareerConnect',
        text: shareText,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <article className="neon-border space-y-3 rounded-lg bg-surface/80 p-4 backdrop-blur-md hover:bg-surface/90 transition-colors">
      {/* Post Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Avatar
            src={post.author.profilePicture ?? post.author.googlePhotoUrl}
            alt={post.author.name}
          />
          <div>
            <p className="text-sm font-semibold">{post.author.name}</p>
            <p className="text-xs text-muted">
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-sm text-white/90">{post.content}</p>
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post attachment"
          className="max-h-72 w-full rounded-lg object-cover"
        />
      )}

      {/* Engagement Stats */}
      <div className="flex items-center justify-between text-xs text-muted border-t border-slate-700/30 pt-2">
        <span className="text-cyan-400">{post.likes.length} likes</span>
        <span className="text-blue-400">{post.comments.length} comments</span>
      </div>

      {/* Engagement Buttons */}
      <div className="flex items-center justify-around border-t border-b border-slate-700/30 py-2">
        <button
          onClick={handleLikeToggle}
          disabled={likePostMutation.isPending || unlikePostMutation.isPending}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all text-sm ${
            isLiked
              ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
          } disabled:opacity-50`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          {isLiked ? 'Liked' : 'Like'}
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-slate-400 hover:text-slate-300 hover:bg-slate-700/30 transition-all text-sm"
        >
          <MessageCircle className="w-4 h-4" />
          Comment
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-slate-400 hover:text-slate-300 hover:bg-slate-700/30 transition-all text-sm"
        >
          <Share className="w-4 h-4" />
          Share
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-3 border-t border-slate-700/30 pt-3">
          {/* Comment Input */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                className="w-full bg-slate-700/30 rounded-lg px-3 py-2 text-sm placeholder-slate-500 border border-slate-600/30 focus:outline-none focus:border-cyan-500/50 text-white"
              />
            </div>
            <button
              onClick={handleComment}
              disabled={!commentText.trim() || commentPostMutation.isPending}
              className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-all"
            >
              {commentPostMutation.isPending ? '...' : 'Post'}
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {post.comments.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No comments yet</p>
            ) : (
              post.comments.map((comment: any) => (
                <div
                  key={comment._id}
                  className="bg-slate-800/30 rounded-lg p-2 flex gap-2 items-start"
                >
                  <div className="flex-shrink-0">
                    <Avatar
                      src={
                        comment.user.profilePicture ??
                        comment.user.googlePhotoUrl
                      }
                      alt={comment.user.name}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-white">
                        {comment.user.name}
                      </p>
                      {(user?._id === comment.user._id ||
                        user?.role === 'admin') && (
                        <button
                          onClick={() =>
                            deleteCommentMutation.mutate(comment._id)
                          }
                          disabled={deleteCommentMutation.isPending}
                          className="text-red-400 hover:text-red-300 opacity-0 hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 break-words">
                      {comment.text}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCard;
