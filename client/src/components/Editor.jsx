import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Type,
} from "lucide-react";

export default function Editor({ username, room, onLeave }) {
  const socketRef = useRef(null);

  // Initialize TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-lg my-2",
        },
      }),
      Placeholder.configure({
        placeholder: "Start typing or paste text...",
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: "doc-update",
            content: html,
            from: username,
          })
        );
      }
    },
  });

  //  WebSocket connection
  useEffect(() => {
    socketRef.current = new WebSocket("ws://localhost:8080");

    socketRef.current.onopen = () => {
      console.log("Connected to WebSocket");
      socketRef.current.send(
        JSON.stringify({ type: "join-room", room, name: username })
      );
    };

    socketRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "init") {
        editor?.commands.setContent(msg.content);
      }

      if (msg.type === "doc-update" && msg.from !== username) {
        editor?.commands.setContent(msg.content);
      }

      if (msg.type === "info") {
        console.log("hey", msg.text);
      }
    };

    socketRef.current.onclose = () => {
      console.log("Disconnected from WebSocket");
    };

    return () => socketRef.current?.close();
  }, [username, room, editor]);

  // Helper: add image via URL prompt
  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // Helper: add link
  const addLink = () => {
    const url = window.prompt("Enter link URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) return null;

  return (
    <div className="h-screen bg-gray-50 p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">
          Room: {room} | User: {username}
        </h2>
        <button
          onClick={onLeave}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Leave Room
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4 bg-white p-2 border rounded-lg shadow-sm">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor.isActive("bold") ? "bg-gray-200" : ""}`}
        >
          <Bold size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor.isActive("italic") ? "bg-gray-200" : ""}`}
        >
          <Italic size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded ${editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""}`}
        >
          <Type size={18} />
        </button>

        <button onClick={addLink} className="p-2 rounded hover:bg-gray-100">
          <LinkIcon size={18} />
        </button>

        <button onClick={addImage} className="p-2 rounded hover:bg-gray-100">
          <ImageIcon size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded hover:bg-gray-100"
        >
          <Undo2 size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded hover:bg-gray-100"
        >
          <Redo2 size={18} />
        </button>
      </div>

      {/* Editor Content */}
      <div className="bg-white border rounded-lg p-4 shadow-md h-[80vh] overflow-y-auto">
        <EditorContent editor={editor} className="prose max-w-none" />
      </div>
    </div>
  );
}
