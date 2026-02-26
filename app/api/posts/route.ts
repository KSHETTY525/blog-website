import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching posts " },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { title, caption, imageUrl } = body;

    if (!title || !caption || !imageUrl) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const newPost = await prisma.post.create({
      data: {
        title,
        caption,
        imageUrl,
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return Response.json({ error: "Post ID required" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.post.delete({
      where: { id },
    });

    return Response.json({ message: "Post deleted" });
  } catch (error) {
    return Response.json({ error: "Delete failed" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, caption } = body;

    if (!id || !title || !caption) {
      return Response.json({ error: "All fields required" }, { status: 400 });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        caption,
      },
    });

    return Response.json(updatedPost);
  } catch (error) {
    return Response.json({ error: "Update failed" }, { status: 500 });
  }
}
