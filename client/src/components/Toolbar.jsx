// src/components/Toolbar.jsx
import React from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";

export default function Toolbar({ editor }) {
  if (!editor) return null;

  const addImage = () => {
    const url = prompt("Enter image URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    const url = prompt("Enter link URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="flex items-center space-x-2 mb-3 bg-gray-200 p-2 rounded-md">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded ${editor.isActive("bold") ? "bg-gray-300" : ""}`}
      >
        <Bold size={18} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded ${editor.isActive("italic") ? "bg-gray-300" : ""}`}
      >
        <Italic size={18} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-2 rounded ${editor.isActive("strike") ? "bg-gray-300" : ""}`}
      >
        <Strikethrough size={18} />
      </button>

      <button onClick={addLink} className="p-2 rounded hover:bg-gray-300">
        <LinkIcon size={18} />
      </button>

      <button onClick={addImage} className="p-2 rounded hover:bg-gray-300">
        <ImageIcon size={18} />
      </button>
    </div>
  );
}
