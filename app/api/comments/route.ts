import { NextRequest, NextResponse } from "next/server";
import { addComment, getCommentsByPostId } from "@/data/store";
import { Comment } from "@/types";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return NextResponse.json(
      { error: "postId is required" },
      { status: 400 }
    );
  }

  const comments = getCommentsByPostId(postId);
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId, parentId, text, image, gif } = body as {
      postId: string;
      parentId?: string;
      text?: string;
      image?: string;
      gif?: string;
    };

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }

    if (!text && !image && !gif) {
      return NextResponse.json(
        { error: "At least one of text / image / gif is required" },
        { status: 400 }
      );
    }

    const newComment: Comment = {
      id: randomUUID(),
      postId,
      parentId,
      text,
      image,
      gif,
      createdAt: new Date().toISOString(),
    };

    addComment(newComment);
    return NextResponse.json(newComment, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
