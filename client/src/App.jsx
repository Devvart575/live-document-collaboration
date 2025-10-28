import React, { useState, useEffect } from "react";
import Editor from "./components/Editor";

export default function App() {
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");
  const [room, setRoom] = useState(() => localStorage.getItem("room") || "");
  const [joined, setJoined] = useState(() => {
    return !!(localStorage.getItem("username") && localStorage.getItem("room"));
  });

  const handleJoin = () => {
    if (username.trim() && room.trim()) {
      localStorage.setItem("username", username);
      localStorage.setItem("room", room);
      setJoined(true);
    }
  };

  const handleLeave = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("room");
    setJoined(false);
  };

  if (!joined) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-3xl font-bold mb-6">Live Collaboration</h1>

        <input
          type="text"
          placeholder="Enter your name"
          className="p-2 border rounded mb-3 w-60"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter room name"
          className="p-2 border rounded mb-3 w-60"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />

        <button
          onClick={handleJoin}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Join Room
        </button>
      </div>
    );
  }

  return <Editor username={username} room={room} onLeave={handleLeave} />;
}
