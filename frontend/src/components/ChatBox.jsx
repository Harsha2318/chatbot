import React, { useState, useEffect, useRef } from "react";
import Message from "./Message";

const ChatBox = ({ chatHistory = [], setChatHistory, handleSend }) => {

  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newHistory = [...chatHistory, { role: "user", content: input }];
    setChatHistory(newHistory);
    handleSend(newHistory);
    setInput("");
  };

  const handleEditMessage = async (index, newContent) => {
    const updatedHistory = [...chatHistory];
    updatedHistory[index].content = newContent;

    const trimmedHistory = updatedHistory.slice(0, index + 1);
    setChatHistory(trimmedHistory);
    handleSend(trimmedHistory);
  };

  const handleRetry = (index) => {
    const trimmedHistory = chatHistory.slice(0, index);
    setChatHistory(trimmedHistory);
    handleSend(trimmedHistory);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg, index) => (
          <Message
            key={index}
            role={msg.role}
            content={msg.content}
            onEdit={
              msg.role === "user"
                ? (newContent) => handleEditMessage(index, newContent)
                : undefined
            }
            onRetry={
              msg.role === "assistant" && index === chatHistory.length - 1
                ? () => handleRetry(index)
                : undefined
            }
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 border-t flex items-center bg-white dark:bg-zinc-900"
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 focus:outline-none"
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
