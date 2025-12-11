"use client";

import { useEffect, useRef, useState, DragEvent, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import type { Comment } from "@/types";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

type Props = {
  postId: string;
  parentId?: string | null;
  onCreated: (comment: Comment) => void;
  onCancel?: () => void;
};

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CommentForm({ postId, parentId, onCreated, onCancel }: Props) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [gifs, setGifs] = useState<{ id: string; name: string; url: string }[]>([]);
  const [gifSearch, setGifSearch] = useState("");
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load GIFs once on mount
  useEffect(() => {
    fetch("/gifs.json")
      .then((r) => r.json())
      .then((data) => setGifs(data || []))
      .catch(() => setGifs([]));
  }, []);

  // Cleanup image preview URLs
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Memoize filtered GIFs to avoid recalculating on every render
  const filteredGifs = useMemo(() => {
    if (!gifSearch.trim()) return gifs;
    const searchLower = gifSearch.toLowerCase();
    return gifs.filter((g) => g.name.toLowerCase().includes(searchLower));
  }, [gifSearch, gifs]);

  const processFile = useCallback((f: File) => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setImageFile(f);
    setSelectedGif(null);
    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  }, [imagePreview]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (f && f.type.startsWith("image/")) {
      processFile(f);
    }
  }, [processFile]);

  const handlePickGif = useCallback((gifUrl: string) => {
    setSelectedGif(gifUrl);
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setShowGifPicker(false);
  }, [imagePreview]);

  const handleEmojiClick = useCallback((emojiData: any) => {
    // emoji-picker-react v4+ passes emoji directly in the emoji property
    const emoji = emojiData?.emoji || emojiData?.native || emojiData;
    if (emoji) {
      setText((t) => t + emoji);
    }
    setShowEmoji(false);
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() && !imageFile && !selectedGif) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      let imageBase64: string | undefined = undefined;
      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
      }

      const payload = {
        postId,
        parentId,
        text: text.trim() || undefined,
        image: imageBase64,
        gif: selectedGif || undefined,
      };

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Failed to post comment", await res.text());
        return;
      }

      const created: Comment = await res.json();
      onCreated(created);
      
      // Reset form
      setText("");
      setImageFile(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(null);
      setSelectedGif(null);
      setShowEmoji(false);
      setShowGifPicker(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onCancel?.();
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [text, imageFile, imagePreview, selectedGif, isSubmitting, postId, parentId, onCreated, onCancel]);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 backdrop-blur-lg p-4 shadow-md hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 animate-scale-in"
    >
      {/* Header */}
      {!parentId && (
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Add Comment
          </span>
        </div>
      )}
      {parentId && (
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Reply to Comment
          </span>
        </div>
      )}

      {/* Textarea with Drag & Drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed transition-all duration-200 ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
            : "border-transparent"
        }`}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={parentId ? "Write a reply..." : "Write a comment..."}
          className="w-full rounded-lg bg-gray-50 dark:bg-slate-900/50 p-3 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-gray-400 dark:placeholder:text-slate-500"
          rows={parentId ? 2 : 3}
        />
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50/90 dark:bg-blue-950/90 backdrop-blur-sm rounded-lg pointer-events-none">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Drop image here</p>
          </div>
        )}
      </div>

      {/* Preview area */}
      {(imagePreview || selectedGif) && (
        <div className="relative group animate-scale-in">
          <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
            <img
              src={imagePreview || selectedGif || ""}
              alt="preview"
              className="max-h-32 object-contain bg-gray-100 dark:bg-slate-900"
            />
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
                setSelectedGif(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="absolute top-1 right-1 p-1 rounded-md bg-red-500/90 hover:bg-red-600 text-white transition-all cursor-pointer"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <div className="relative z-50 animate-scale-in">
          <div className="absolute bottom-full left-0 mb-2">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        </div>
      )}

      {/* GIF picker with search */}
      {showGifPicker && (
        <div className="space-y-2 p-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 animate-scale-in">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={gifSearch}
              onChange={(e) => setGifSearch(e.target.value)}
              placeholder="Search GIFs..."
              className="flex-1 px-2 py-1 text-sm rounded-md bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            {gifSearch && (
              <button
                type="button"
                onClick={() => setGifSearch("")}
                className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2 max-h-40 overflow-auto">
            {filteredGifs.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => handlePickGif(g.url)}
                className={`relative rounded-lg border-2 p-1 hover:scale-105 transition-all cursor-pointer ${
                  selectedGif === g.url
                    ? "border-blue-500 ring-2 ring-blue-500/20"
                    : "border-gray-200 dark:border-slate-700"
                }`}
              >
                <img src={g.url} alt={g.name} className="h-16 w-full object-contain" />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"></div>
              </button>
            ))}
            {filteredGifs.length === 0 && (
              <div className="col-span-4 text-center py-4 text-xs text-gray-400">
                {gifSearch ? `No GIFs found for "${gifSearch}"` : "No GIFs available"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
            id={`comment-file-${postId}-${parentId || "root"}`}
          />
          <label
            htmlFor={`comment-file-${postId}-${parentId || "root"}`}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer group"
            title="Upload image"
          >
            <svg className="w-4 h-4 text-gray-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </label>
          
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors group cursor-pointer"
            title="Add emoji"
          >
            <svg className="w-4 h-4 text-gray-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          <button
            type="button"
            onClick={() => setShowGifPicker(!showGifPicker)}
            className="px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-xs font-semibold text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            title="Add GIF"
          >
            GIF
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="ml-2 px-3 py-1 text-xs rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || (!text.trim() && !imageFile && !selectedGif)}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:hover:scale-100 active:scale-95 shadow-md"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          ) : (
            parentId ? "Reply" : "Comment"
          )}
        </button>
      </div>
    </form>
  );
}
