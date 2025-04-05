// InputBox.js
import React, { useState } from "react";

const InputBox = ({ onSend }) => {
  const [input, setInput] = useState("");

  const handleSendClick = () => {
    if (input.trim()) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <div className="mt-4 flex gap-2">
      <input
        className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring"
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSendClick()}
      />
      <button
        onClick={handleSendClick}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Send
      </button>
    </div>
  );
};

export default InputBox;
