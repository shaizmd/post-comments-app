import { Comment } from "@/types";

export type CommentNode = Comment & { children: CommentNode[] };

export function buildCommentTree(comments: Comment[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  comments.forEach((c) => {
    map.set(c.id, { ...c, children: [] });
  });

  map.forEach((node) => {
    if (node.parentId) {
      const parent = map.get(node.parentId);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}
