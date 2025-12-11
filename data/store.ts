import { Post, Comment } from "@/types";

// In-memory storage
let posts: Post[] = [];
let comments: Comment[] = [];

// Post functions
export function getPosts(): Post[] {
  return posts;
}

export function addPost(post: Post): void {
  posts.unshift(post);
}

// Comment functions
export function getCommentsByPostId(postId: string): Comment[] {
  return comments.filter((c) => c.postId === postId);
}

export function addComment(comment: Comment): void {
  comments.push(comment);
  console.log("Comment added to store. Total comments:", comments.length);
  console.log("All comments in store:", comments);
}
