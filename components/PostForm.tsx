"use client";

import { useState, ChangeEvent, FormEvent, DragEvent, useRef, useCallback, useEffect } from "react";
import type { Post } from "@/types";

type Props = {
  onPostCreated: (post: Post) => void;
};

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PostForm({ onPostCreated }: Props) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs on unmount or file change
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const processFile = useCallback((f: File) => {
    // Revoke previous object URL to prevent memory leaks
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    
    setFile(f);
    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setFilePreview(url);
    } else {
      setFilePreview(null);
    }
  }, [filePreview]);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  }, [processFile]);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  }, [processFile]);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);

    let fileUrl: string | undefined;
    let fileName: string | undefined;

    if (file) {
      fileUrl = await fileToBase64(file);
      fileName = file.name;
    }

    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, fileUrl, fileName }),
      });

      if (!res.ok) {
        console.error(await res.json());
        return;
      }

      const created: Post = await res.json();
      onPostCreated(created);
      
      // Reset form
      setText("");
      setFile(null);
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
      setFilePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [text, file, filePreview, isSubmitting, onPostCreated]);

  return (
    <form
      onSubmit={handleSubmit}
      className="group space-y-4 rounded-2xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 backdrop-blur-xl p-6 shadow-lg hover:shadow-2xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600 shadow-sm group-hover:shadow-md transition-shadow">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
            Create New Post
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-500">Share something with the community</p>
        </div>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-[1.02]"
            : "border-gray-300 dark:border-slate-600"
        }`}
      >
        <textarea
          className="w-full rounded-xl bg-transparent p-4 text-sm outline-none resize-none placeholder:text-gray-400 dark:placeholder:text-slate-500"
          rows={4}
          placeholder="What's on your mind? Share your thoughts..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50/90 dark:bg-blue-950/90 backdrop-blur-sm rounded-xl pointer-events-none">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Drop your file here</p>
            </div>
          </div>
        )}
      </div>

      {filePreview && (
        <div className="relative group animate-scale-in">
          <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
            <img
              src={filePreview}
              alt="Preview"
              className="w-full max-h-64 object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setFilePreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/90 hover:bg-red-600 text-white backdrop-blur-sm transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">{file?.name}</p>
        </div>
      )}

      {!filePreview && file && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 animate-scale-in">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm flex-1 truncate">{file.name}</span>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
          id="post-file-input"
        />
        <label
          htmlFor="post-file-input"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-sm font-medium cursor-pointer transition-all duration-200 hover:scale-105"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Image
        </label>

        <button
          type="submit"
          disabled={!text.trim() || isSubmitting}
          className="group/submit inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 hover:shadow-xl shadow-md disabled:hover:scale-100 disabled:hover:shadow-none active:scale-95"
        >
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Posting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 group-hover/submit:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Post
            </>
          )}
        </button>
      </div>
    </form>
  );
}
