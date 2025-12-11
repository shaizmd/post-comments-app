"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import PostForm from "@/components/PostForm";
import PostView from "@/components/PostView";
import CommentSection from "@/components/CommentSection";
import type { Post } from "@/types";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [isDark, setIsDark] = useState(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    
    setIsDark(initialDark);
    
    if (initialDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Handle dark mode toggle - memoized
  const toggleDarkMode = useCallback(() => {
    setIsDark((prev) => {
      const newDarkMode = !prev;
      
      if (newDarkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      
      return newDarkMode;
    });
  }, []);

  // Load posts on mount
  useEffect(() => {
    fetch("/api/post")
      .then((res) => res.json())
      .then((data: Post[]) => {
        setPosts(data);
        if (data.length > 0) setSelectedPostId(data[0].id);
      })
      .catch((err) => console.error(err));
  }, []);

  // Memoized handlers
  const handlePostCreated = useCallback((post: Post) => {
    setPosts((prev) => [post, ...prev]);
    setSelectedPostId(post.id);
    setCommentCounts((prev) => ({ ...prev, [post.id]: 0 }));
  }, []);

  const handleCommentCountChange = useCallback((postId: string, count: number) => {
    setCommentCounts((prev) => ({ ...prev, [postId]: count }));
  }, []);

  // Memoize selected post lookup
  const selectedPost = useMemo(
    () => posts.find((p) => p.id === selectedPostId) || null,
    [posts, selectedPostId]
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-gray-900 dark:text-slate-100 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header with Dark Mode Toggle */}
        <div className="flex items-center justify-between animate-fade-in mb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Post + Comments
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Share your thoughts and engage in conversations
            </p>
          </div>
          
          <button
            onClick={toggleDarkMode}
            className="group relative p-3 rounded-2xl bg-white dark:bg-slate-800 backdrop-blur-sm border-2 border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-2xl active:scale-95 cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <svg className="w-5 h-5 text-yellow-500 group-hover:rotate-180 transition-transform duration-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-slate-700 group-hover:-rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>

        <div className="animate-scale-in">
          <PostForm onPostCreated={handlePostCreated} />
        </div>

        {/* Posts Feed */}
        {posts.length > 0 && (
          <div className="space-y-3 animate-fade-in">
            {posts.length > 1 && (
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wider">
                  Feed • {posts.length} posts
                </p>
              </div>
            )}
            
            <div className="space-y-6">
              {posts.map((post) => {
                const isExpanded = selectedPostId === post.id;
                const postDate = new Date(post.createdAt);
                const timeAgo = formatDistanceToNow(postDate, { addSuffix: true });
                const commentCount = commentCounts[post.id] || 0;
                
                return (
                  <div
                    key={post.id}
                    className="group rounded-2xl border border-gray-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-sm hover:shadow-2xl hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-300 overflow-hidden hover:-translate-y-1"
                  >
                    {/* Post Content */}
                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ee0979] to-[#ff6a00] flex items-center justify-center shadow-md">
                            <span className="text-xs font-bold text-white">
                              {post.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                              {post.username}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-slate-500">
                              {timeAgo}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <p className="text-sm leading-relaxed text-gray-800 dark:text-slate-200 mb-4">
                        {post.text}
                      </p>
                      
                      {/* Image */}
                      {post.fileUrl && post.fileUrl.startsWith("data:image") && (
                        <div className="mb-4 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
                          <img 
                            src={post.fileUrl} 
                            alt="Post attachment" 
                            className="w-full h-auto max-h-96 object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Interaction Bar */}
                      <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-slate-700/50">
                        <button
                          onClick={() => {
                            setSelectedPostId(isExpanded ? null : post.id);
                          }}
                          className={`group/btn flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                            isExpanded
                              ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                              : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
                          }`}
                        >
                          <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="text-xs font-semibold">
                            {commentCount > 0 ? `${commentCount} ${commentCount === 1 ? 'comment' : 'comments'}` : "Add comment"}
                          </span>
                          {isExpanded && (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Comments Section - Integrated */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 dark:border-slate-700/50 bg-gray-50/50 dark:bg-slate-900/30">
                        <div className="p-5">
                          <CommentSection 
                            postId={post.id} 
                            onCommentCountChange={(count) => handleCommentCountChange(post.id, count)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!selectedPost && posts.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-2">No posts yet</h3>
            <p className="text-gray-500 dark:text-slate-400">Be the first to share something!</p>
          </div>
        )}
      </div>
    </main>
  );
}
