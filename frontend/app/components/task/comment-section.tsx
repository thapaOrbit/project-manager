import type { Comment, User } from "@/types";
import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import EmojiPicker from "emoji-picker-react";
import {
  useAddCommentMutation,
  useGetCommentsByTaskIdQuery,
  useAddReactionMutation,
  useRemoveReactionMutation,
  useDeleteCommentMutation,
} from "@/hooks/use-task";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Loader } from "../loader";
import { Reply, Heart, MoreVertical, Trash2 } from "lucide-react";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { ConfirmationDialog } from "@/components/ui/confirm-dialog";

const parseCommentText = (text: string, mentions: any[] = []) => {
  if (!mentions || mentions.length === 0) {
    return <span>{text}</span>;
  }

  const elements = [];
  let lastIndex = 0;

  const sortedMentions = [...mentions].sort((a, b) => a.offset - b.offset);

  sortedMentions.forEach((mention, index) => {
    if (mention.offset > lastIndex) {
      elements.push(
        <span key={`text-${index}`}>
          {text.substring(lastIndex, mention.offset)}
        </span>
      );
    }

    elements.push(
      <span
        key={`mention-${index}`}
        className="bg-blue-100 text-blue-700 px-1 py-0.5 rounded-md font-medium mx-0.5"
        title={`Mentioned ${mention.user?.name || "user"}`}
      >
        @{mention.user?.name || "Unknown"}
      </span>
    );

    lastIndex = mention.offset + mention.length;
  });

  if (lastIndex < text.length) {
    elements.push(<span key="text-final">{text.substring(lastIndex)}</span>);
  }

  return <>{elements}</>;
};

export const CommentSection = ({
  taskId,
  members,
  currentUser,
}: {
  taskId: string;
  members: User[];
  currentUser: User | undefined;
}) => {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

 
  const {
    isOpen,
    title,
    description,
    confirmText,
    cancelText,
    variant,
    showConfirmation,
    hideConfirmation,
    handleConfirm,
  } = useConfirmDialog();

  const { mutate: addComment, isPending } = useAddCommentMutation();
  const { mutate: deleteComment } = useDeleteCommentMutation();
  const { data: comments, isLoading } = useGetCommentsByTaskIdQuery(taskId) as {
    data: Comment[];
    isLoading: boolean;
  };

  // Handle delete from parent
  const handleDeleteComment = (commentId: string) => {
    showConfirmation(
      {
        title: "Delete Comment",
        description: "Are you sure you want to delete this comment? This action cannot be undone.",
        confirmText: "Delete Comment",
        variant: "destructive",
      },
      () => {
        deleteComment({ taskId, commentId });
      }
    );
  };

  // Build nested comment structure
  const buildCommentTree = (comments: Comment[] = []) => {
    const commentMap = new Map();
    const rootComments: Comment[] = [];

    comments.forEach(comment => {
      commentMap.set(comment._id, { ...comment, replies: [] });
    });

    comments.forEach(comment => {
      const commentNode = commentMap.get(comment._id);
      const parentId = comment.parentComment 
        ? (typeof comment.parentComment === 'string' ? comment.parentComment : comment.parentComment._id)
        : null;

      if (parentId && commentMap.has(parentId)) {
        commentMap.get(parentId).replies.push(commentNode);
      } else {
        rootComments.push(commentNode);
      }
    });

    return rootComments;
  };

  const commentTree = buildCommentTree(comments);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    addComment(
      { taskId, text: newComment },
      {
        onSuccess: () => {
          setNewComment("");
          setShowEmojiPicker(false);
          setShowMentions(false);
          toast.success("Comment added successfully");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to add comment");
        },
      }
    );
  };

  const handleAddReply = () => {
    if (!replyText.trim() || !replyingTo) return;

    addComment(
      { 
        taskId, 
        text: replyText,
        parentComment: replyingTo._id 
      },
      {
        onSuccess: () => {
          setReplyText("");
          setReplyingTo(null);
          toast.success("Reply added successfully");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to add reply");
        },
      }
    );
  };

  const handleAddEmoji = (emojiData: any) => {
    setNewComment((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    setTimeout(() => {
      textareaRef.current?.focus();
      if (textareaRef.current) {
        const length = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(length, length);
      }
    }, 0);
  };

  const handleAddMention = (member: User) => {
    const mention = `@${member.name} `;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = newComment.substring(0, cursorPosition);
    const textAfterCursor = newComment.substring(cursorPosition);

    const lastAtSymbol = textBeforeCursor.lastIndexOf("@");
    if (lastAtSymbol !== -1) {
      const newText =
        textBeforeCursor.substring(0, lastAtSymbol) + mention + textAfterCursor;
      setNewComment(newText);
      setShowMentions(false);
      setMentionQuery("");

      setTimeout(() => {
        const newCursorPos = lastAtSymbol + mention.length;
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewComment(value);

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);

    const atPattern = /@(\w*)$/;
    const match = textBeforeCursor.match(atPattern);

    if (match) {
      const query = match[1];
      setMentionQuery(query);
      setShowMentions(true);
      setShowEmojiPicker(false);
    } else {
      setShowMentions(false);
      setMentionQuery("");
    }
  };

  const filteredMembers = members.filter((member) =>
    member?.name?.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        textareaRef.current &&
        !textareaRef.current.contains(target) &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(target)
      ) {
        setShowMentions(false);
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading)
    return (
      <div>
        <Loader />
      </div>
    );

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-medium mb-4">Comments</h3>

      <ScrollArea className="h-[400px] mb-4">
        {commentTree.length > 0 ? (
          commentTree.map((comment) => (
            <CommentItem 
              key={comment._id} 
              comment={comment} 
              taskId={taskId}
              replyingTo={replyingTo}
              replyText={replyText}
              onReply={setReplyingTo}
              onReplyTextChange={setReplyText}
              onAddReply={handleAddReply}
              onCancelReply={() => setReplyingTo(null)}
              onDeleteComment={handleDeleteComment}
              currentUser={currentUser}
              level={0}
            />
          ))
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">No comments yet</p>
          </div>
        )}
      </ScrollArea>

      <Separator className="my-4" />

      <div className="mt-4 relative">
        <Textarea
          ref={textareaRef}
          placeholder="Add a comment..."
          value={newComment}
          onChange={handleTextChange}
          className="min-h-[80px] resize-none pr-10"
          disabled={isPending}
        />

        <button
          type="button"
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
            setShowMentions(false);
          }}
          className="absolute right-2 top-2 text-lg hover:bg-accent rounded p-1 transition-colors"
          disabled={isPending}
        >
          😊
        </button>

        {showMentions && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto z-50">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <button
                  key={member._id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2 transition-colors"
                  onClick={() => handleAddMention(member)}
                >
                  <Avatar className="size-6">
                    <AvatarImage src={member.profilePicture} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{member.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {member.email}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No members found for "@{mentionQuery}"
              </div>
            )}
          </div>
        )}

        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute right-0 bottom-full mb-2 z-50"
          >
            <EmojiPicker
              onEmojiClick={handleAddEmoji}
              width={300}
              height={400}
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Button
            disabled={!newComment.trim() || isPending}
            onClick={handleAddComment}
            size="sm"
          >
            {isPending ? (
              <>
                <Loader />
                Posting...
              </>
            ) : (
              "Post"
            )}
          </Button>
        </div>
      </div>

      {/* Single confirmation dialog for all comments */}
      <ConfirmationDialog
        open={isOpen}
        onOpenChange={hideConfirmation}
        onConfirm={handleConfirm}
        title={title}
        description={description}
        confirmText={confirmText}
        cancelText={cancelText}
        variant={variant}
      />
    </div>
  );
};

interface CommentItemProps {
  comment: Comment & { replies?: Comment[] };
  taskId: string;
  replyingTo: Comment | null;
  replyText: string;
  onReply: (comment: Comment) => void;
  onReplyTextChange: (text: string) => void;
  onAddReply: () => void;
  onCancelReply: () => void;
  onDeleteComment: (commentId: string) => void;
  currentUser?: User;
  level?: number;
}

const CommentItem = ({
  comment,
  taskId,
  replyingTo,
  replyText,
  onReply,
  onReplyTextChange,
  onAddReply,
  onCancelReply,
  onDeleteComment,
  currentUser,
  level = 0
}: CommentItemProps) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const reactionPickerRef = useRef<HTMLDivElement>(null);
  const deleteMenuRef = useRef<HTMLDivElement>(null);

  const { mutate: addReaction } = useAddReactionMutation();
  const { mutate: removeReaction } = useRemoveReactionMutation();

  const canDelete = currentUser && comment.author && currentUser._id === comment.author._id;

  const handleDelete = () => {
    onDeleteComment(comment._id);
    setShowDeleteMenu(false);
  };

  const handleAddReaction = (emojiData: any) => {
    addReaction(
      { taskId, commentId: comment._id, emoji: emojiData.emoji },
      {
        onSuccess: () => {
          setShowReactionPicker(false);
        },
        onError: (error: any) => {
          toast.error("Failed to add reaction");
        },
      }
    );
  };

  const handleRemoveReaction = (emoji: string) => {
    removeReaction(
      { taskId, commentId: comment._id, emoji },
      {
        onError: (error: any) => {
          toast.error("Failed to remove reaction");
        },
      }
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        reactionPickerRef.current &&
        !reactionPickerRef.current.contains(event.target as Node) &&
        deleteMenuRef.current &&
        !deleteMenuRef.current.contains(event.target as Node)
      ) {
        setShowReactionPicker(false);
        setShowDeleteMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasUserReacted = (emoji: string) => {
    return false;
  };

  const marginLeft = level * 20;
  const isReplying = replyingTo?._id === comment._id;

  return (
    <div className="py-3" style={{ marginLeft: `${marginLeft}px` }}>
      <div className="flex gap-3 group">
        <Avatar className="size-8 flex-shrink-0">
          <AvatarImage src={comment.author.profilePicture} />
          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            
            {canDelete && (
              <div className="relative" ref={deleteMenuRef}>
                <button
                  onClick={() => setShowDeleteMenu(!showDeleteMenu)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
                >
                  <MoreVertical className="size-3" />
                </button>
                
                {showDeleteMenu && (
                  <div className="absolute right-0 top-6 bg-background border rounded-md shadow-lg z-10 min-w-[120px]">
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="size-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-sm text-foreground whitespace-pre-wrap mb-2">
            {parseCommentText(comment.text, comment.mentions)}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <Heart className="size-3" />
              Like
            </button>

            <button
              onClick={() => onReply(comment)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <Reply className="size-3" />
              Reply
            </button>

            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showReplies ? 'Hide' : 'View'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>

          {comment.reactions && comment.reactions.length > 0 && (
            <div className="flex gap-1 mt-2">
              {Array.from(new Set(comment.reactions.map((r) => r.emoji))).map(
                (emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleRemoveReaction(emoji)}
                    className={`text-xs px-2 py-1 rounded cursor-pointer transition-colors ${
                      hasUserReacted(emoji)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                    title={`${comment.reactions?.filter((r) => r.emoji === emoji).length} reactions`}
                  >
                    {emoji}{" "}
                    {comment.reactions?.filter((r) => r.emoji === emoji).length}
                  </button>
                )
              )}
            </div>
          )}

          {showReactionPicker && (
            <div ref={reactionPickerRef} className="mt-2">
              <EmojiPicker
                onEmojiClick={handleAddReaction}
                width={300}
                height={350}
              />
            </div>
          )}

          {isReplying && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder={`Reply to ${comment.author.name}...`}
                value={replyText}
                onChange={(e) => onReplyTextChange(e.target.value)}
                className="min-h-[60px] resize-none text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancelReply}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={onAddReply}
                  disabled={!replyText.trim()}
                >
                  Reply
                </Button>
              </div>
            </div>
          )}

          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  taskId={taskId}
                  replyingTo={replyingTo}
                  replyText={replyText}
                  onReply={onReply}
                  onReplyTextChange={onReplyTextChange}
                  onAddReply={onAddReply}
                  onCancelReply={onCancelReply}
                  onDeleteComment={onDeleteComment}
                  currentUser={currentUser}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};