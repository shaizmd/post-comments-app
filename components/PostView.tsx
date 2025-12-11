import type { Post } from "@/types";
import { formatDistanceToNow } from "date-fns";

type Props = {
  post: Post;
  commentCount: number;
};

export default function PostView({ post, commentCount }: Props) {
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  const isImage = post.fileUrl && post.fileUrl.startsWith("data:image");

  return (
    <article className="group rounded-2xl border border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 animate-scale-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
          {post.username[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-slate-100">@{post.username}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
              Author
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {timeAgo}
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed mb-4">
        {post.text}
      </p>

      {/* Media */}
      {post.fileUrl && (
        <div className="mt-4 animate-fade-in">
          {isImage ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-md group-hover:shadow-xl transition-shadow">
              <img
                src={post.fileUrl}
                alt={post.fileName ?? "attachment"}
                className="w-full max-h-96 object-cover"
              />
            </div>
          ) : (
            <a
              href={post.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200 group/link"
            >
              <div className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                  {post.fileName ?? "View attachment"}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Click to download</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-6 pt-4 mt-4 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <span className="font-medium">
            {commentCount} {commentCount === 1 ? "comment" : "comments"}
          </span>
        </div>
      </div>
    </article>
  );
}
