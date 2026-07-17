import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addCommentThunk, deleteCommentThunk } from '@/store/slices/postSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trash2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const PostComments = ({ postId, comments = [], postAuthorId }) => {
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    await dispatch(addCommentThunk({ postId, content: commentText }));
    setCommentText('');
    setSubmitting(false);
  };

  const handleDelete = async (commentId) => {
    await dispatch(deleteCommentThunk({ postId, commentId }));
  };

  return (
    <div className="mt-4 pt-4 border-t border-border/60 space-y-4 animate-in fade-in duration-200">
      {/* Comments List */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">No comments yet. Be the first to start the conversation!</p>
        ) : (
          comments.map((comment) => {
            const isCommentAuthor = user && comment.author && comment.author._id === user._id;
            const isPostAuthor = user && postAuthorId === user._id;
            const canDelete = isCommentAuthor || isPostAuthor;

            return (
              <div key={comment._id} className="flex space-x-2 bg-muted/40 p-2.5 rounded-lg text-sm">
                <Link to={`/user/${comment.author?._id || ''}`}>
                  <Avatar className="w-7 h-7 mt-0.5">
                    <AvatarImage src={comment.author?.profilePicture} alt={comment.author?.name} />
                    <AvatarFallback>{comment.author?.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <Link to={`/user/${comment.author?._id || ''}`} className="font-medium text-xs hover:underline text-foreground">
                      {comment.author?.name || 'Anonymous Developer'}
                    </Link>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-muted-foreground">
                        {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'just now'}
                      </span>
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(comment._id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-1 break-words text-xs leading-relaxed">{comment.content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Comment Input */}
      {user && (
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 pt-1">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-background border border-input rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!commentText.trim() || submitting}
            className="h-8 px-3"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            <span className="text-xs">Post</span>
          </Button>
        </form>
      )}
    </div>
  );
};

export default PostComments;
