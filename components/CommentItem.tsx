"use client";

import { useState } from "react";
import type { Comment } from "@/types";
import CommentForm from "./CommentForm";
import { formatDistanceToNow } from "date-fns";

type CommentNode = Comment & { children?: CommentNode[] };

type Props = {
  node: CommentNode;
  depth?: number;
  postId: string;
  onReplyCreated: (comment: Comment) => void;
};

export default function CommentItem({ node, depth = 0, postId, onReplyCreated }: Props) {
  const [showReply, setShowReply] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div
      style={{ marginLeft: depth * 20 }}
      className="border-l-2 border-gray-200 dark:border-slate-700 pl-4 animate-in"
    >
      <div className="group rounded-xl bg-gray-50/50 dark:bg-slate-800/30 p-3 hover:bg-gray-100/50 dark:hover:bg-slate-800/50 transition-all duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
              U
            </div>
            <div>
              <span className="font-medium text-sm text-gray-900 dark:text-slate-100">@user</span>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDistanceToNow(new Date(node.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>

          {hasChildren && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={isCollapsed ? "Expand thread" : "Collapse thread"}
            >
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>

        {!isCollapsed && (
          <>
            {/* Content */}
            {node.text && (
              <div className="text-sm text-gray-800 dark:text-slate-200 whitespace-pre-wrap mb-2">
                {node.text}
              </div>
            )}

            {/* Media */}
            {node.image && (
              <div className="mt-2 mb-2 animate-scale-in">
                <img
                  src={node.image}
                  alt="comment-image"
                  className="max-h-48 rounded-lg border border-gray-200 dark:border-slate-700 object-cover shadow-md"
                />
              </div>
            )}

            {node.gif && (
              <div className="mt-2 mb-2 animate-scale-in">
                <img
                  src={node.gif}
                  alt="comment-gif"
                  className="max-h-48 rounded-lg border border-gray-200 dark:border-slate-700 object-contain shadow-md"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setShowReply(!showReply)}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Reply
              </button>
              {hasChildren && (
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  {node.children!.length} {node.children!.length === 1 ? "reply" : "replies"}
                </span>
              )}
            </div>

            {/* Reply Form */}
            {showReply && (
              <div className="mt-3 animate-scale-in">
                <CommentForm
                  postId={postId}
                  parentId={node.id}
                  onCreated={(c) => {
                    onReplyCreated(c);
                    setShowReply(false);
                  }}
                  onCancel={() => setShowReply(false)}
                />
              </div>
            )}
          </>
        )}

        {isCollapsed && hasChildren && (
          <div className="text-xs text-gray-500 dark:text-slate-400 italic">
            {node.children!.length} {node.children!.length === 1 ? "reply" : "replies"} hidden
          </div>
        )}
      </div>

      {/* Children */}
      {!isCollapsed && hasChildren && (
        <div className="mt-2 space-y-2">
          {node.children!.map((child) => (
            <CommentItem
              key={child.id}
              node={child}
              depth={depth + 1}
              postId={postId}
              onReplyCreated={onReplyCreated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
