import { NextRequest, NextResponse } from "next/server";
import { addPost, getPosts } from "@/data/store";
import { Post } from "@/types";
import { randomUUID } from "crypto";

export async function GET() {
  const posts = getPosts();
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, fileUrl, fileName } = body as {
      text: string;
      fileUrl?: string;
      fileName?: string;
    };

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const newPost: Post = {
      id: randomUUID(),
      username: "demo_user", // static mock username
      text,
      fileUrl,
      fileName,
      createdAt: new Date().toISOString(),
    };

    addPost(newPost);

    return NextResponse.json(newPost, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
