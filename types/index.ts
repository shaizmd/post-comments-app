export type Post = {
  id: string;
  username: string;
  text: string;
  fileUrl?: string;       // base64 or blob URL
  fileName?: string;
  createdAt: string;      // ISO string
};

export type Comment = {
  id: string;
  postId: string;
  parentId?: string;
  text?: string;
  image?: string;         // base64 or blob URL
  gif?: string;           // key or URL from gifs.json
  createdAt: string;
};
