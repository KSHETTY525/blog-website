"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Post = {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
};

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<File | null>(null);

  // 🔥 For delete modal
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);

  // Fetch posts
  const fetchPosts = async () => {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 🔥 Confirm Delete Function
  const confirmDelete = async () => {
    if (!deleteId) return;

    await fetch("/api/posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    });

    setDeleteId(null);
    fetchPosts();
  };

  // Submit post
  const handleSubmit = async () => {
    if (!title || !caption) return;

    try {
      if (editId) {
        console.log("Updating ID:", editId);

        const res = await fetch("/api/posts", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editId,
            title,
            caption,
          }),
        });

        const data = await res.json();
        console.log("Update response:", data);

        setEditId(null);
      } else {
        if (!image) return;

        const fileName = `${Date.now()}-${image.name}`;

        const { error: uploadError } = await supabase.storage
          .from("blog-images")
          .upload(fileName, image);

        if (uploadError) {
          console.error(uploadError);
          return;
        }

        const { data } = supabase.storage
          .from("blog-images")
          .getPublicUrl(fileName);

        const imageUrl = data.publicUrl;

        await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            caption,
            imageUrl,
          }),
        });
      }

      setTitle("");
      setCaption("");
      setImage(null);
      setShowForm(false);

      fetchPosts();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-500 rounded-full" />
          <div>
            <p className="font-bold">User Name</p>
            <p className="text-sm text-gray-400">Blog Profile</p>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 p-10">
        <div className="flex justify-center">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-black px-6 py-3 rounded-lg"
          >
            Create New Post
          </button>
        </div>

        {showForm && (
          <div className="mt-8 max-w-md mx-auto border border-gray-600 p-6 rounded-lg shadow">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-500 bg-black p-2 mb-4 rounded"
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files) {
                  setImage(e.target.files[0]);
                }
              }}
              className="w-full border border-gray-500 bg-black p-2 mb-4 rounded"
            />

            <textarea
              placeholder="Caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full border border-gray-500 bg-black p-2 mb-4 rounded"
            />

            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-4 py-2 rounded w-full"
            >
              {editId ? "Update Post" : "Post"}
            </button>
          </div>
        )}

        {/* Posts */}
        <div className="mt-10 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="border border-gray-700 p-4 rounded shadow"
            >
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-60 object-cover rounded mb-4"
              />
              <h2 className="text-xl font-bold">{post.title}</h2>
              <p className="text-gray-400">{post.caption}</p>

              <div className="flex justify-between mt-4">
                {/* 🔵 Edit Button */}
                <button
                  onClick={() => {
                    setEditId(post.id);
                    setTitle(post.title);
                    setCaption(post.caption);
                    setShowForm(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Edit
                </button>

                {/* 🔴 Delete Button */}
                <button
                  onClick={() => setDeleteId(post.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🔥 Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white text-black p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4 text-center">
              Are you sure you want to delete?
            </h2>

            <div className="flex justify-between">
              <button
                onClick={() => setDeleteId(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                No
              </button>

              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
