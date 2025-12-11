"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import type { Comment } from "@/types";
import { buildCommentTree, CommentNode } from "@/lib/buildCommentTree";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

type Props = {
  postId: string;
  onCommentCountChange?: (count: number) => void;
};

export default function CommentSection({ postId, onCommentCountChange }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const onCommentCountChangeRef = useRef(onCommentCountChange);

  // Keep ref updated
  useEffect(() => {
    onCommentCountChangeRef.current = onCommentCountChange;
  }, [onCommentCountChange]);

  useEffect(() => {
    fetch(`/api/comments?postId=${postId}`)
      .then((res) => res.json())
      .then((data: Comment[]) => {
        setComments(data);
        onCommentCountChangeRef.current?.(data.length);
      })
      .catch((err) => console.error("Error fetching comments:", err));
  }, [postId]);

  const handleCommentCreated = useCallback((comment: Comment) => {
    setComments((prev) => {
      const newComments = [...prev, comment];
      onCommentCountChangeRef.current?.(newComments.length);
      return newComments;
    });
  }, []);

  // Memoize comment tree calculation
  const tree: CommentNode[] = useMemo(() => buildCommentTree(comments), [comments]);

  return (
    <section className="space-y-4">
      {/* Comment Form */}
      <CommentForm postId={postId} onCreated={handleCommentCreated} />

      {/* Comments List */}
      {tree.length > 0 && (
        <div className="space-y-2 mt-4">
          <div className="flex items-center gap-2 px-1 mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-slate-500">
              {comments.length} {comments.length === 1 ? "comment" : "comments"}
            </span>
          </div>
          {tree.map((node, index) => (
            <div key={node.id} style={{ animationDelay: `${index * 50}ms` }}>
              <CommentItem
                node={node}
                depth={0}
                onReplyCreated={handleCommentCreated}
                postId={postId}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
