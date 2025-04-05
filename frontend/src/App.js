// App.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  FaPlus,
  FaShareAlt,
  FaRobot,
  FaEdit,
  FaTrash,
  FaVolumeUp,
  FaPencilAlt,
} from "react-icons/fa";
// import localStorage useEffects
import {
  createChat,
  saveMessage,
  loadChat,
  loadChats,
  renameChat,
  deleteChat,
  db,
} from "./db";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";


import ProtectedRoute from './components/ProtectedRoute';
import Chatbot from './pages/Chatbot';
import AuthLayout from './layouts/AuthLayout';


import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
// import ProtectedRoute from './components/ProtectedRoute';
// import Chatbot from "./pages/Chatbot"; // AI Chatbot page
// import AuthLayout from "./layouts/AuthLayout"; // Layout for Auth Pages

import { exportChatToPDF } from "./utils/exportPdf";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function App() {
  const [input, setInput] = useState("");
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState("default");
  const [chatHistory, setChatHistory] = useState({});
  const [model, setModel] = useState("LLaMA3");
  const [darkMode, setDarkMode] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [chatTitles, setChatTitles] = useState({});
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  useEffect(() => {
    const storedHistory = localStorage.getItem("chatHistory");
    const storedTitles = localStorage.getItem("chatTitles");
    if (storedHistory) setChatHistory(JSON.parse(storedHistory));
    if (storedTitles) setChatTitles(JSON.parse(storedTitles));
  }, []);

  useEffect(() => {
    (async () => {
      const storedHistory = await loadChats();
      // const storedTitles = await loadTitles();
      if (storedHistory) setChatHistory(storedHistory);
      // if (storedTitles) setChatTitles(storedTitles);
    })();
  }, []);

  useEffect(() => {
    // saveChats(chatHistory);
  }, [chatHistory]);

  useEffect(() => {
    // saveTitles(chatTitles);
  }, [chatTitles]);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem("chatTitles", JSON.stringify(chatTitles));
  }, [chatTitles]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const updatedChat = [...chats, userMessage];
    setChats(updatedChat);
    setInput("");

    const placeholder = { role: "bot", content: "" };
    const newChats = [...updatedChat, placeholder];
    setChats(newChats);

    if (!chatTitles[currentChatId]) {
      const words = input.trim().split(" ");
      const autoTitle =
        words.slice(0, 5).join(" ") + (words.length > 5 ? "..." : "");
      const formattedTitle =
        autoTitle.charAt(0).toUpperCase() + autoTitle.slice(1);
      setChatTitles((prev) => ({ ...prev, [currentChatId]: formattedTitle }));
    }

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, model }),
      });
      const data = await res.json();
      const fullReply = data.reply;

      let i = 0;
      const interval = setInterval(() => {
        if (i <= fullReply.length) {
          const streamingContent = fullReply.slice(0, i);
          const updated = newChats.map((msg, idx) =>
            idx === newChats.length - 1
              ? { ...msg, content: streamingContent }
              : msg
          );
          setChats(updated);
          i++;
        } else {
          clearInterval(interval);
          setChatHistory((prev) => ({ ...prev, [currentChatId]: newChats }));
        }
      }, 20);
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to fetch response!");
    }
  };

  const handleUpdateEditedMessage = async () => {
    const updatedChats = [...chats];
    updatedChats[editingIndex].content = input;
    setChats(updatedChats);
    setEditingIndex(null);
    setInput("");

    // If edited message is a user message (even index), regenerate the next bot reply
    if (
      updatedChats[editingIndex].role === "user" &&
      updatedChats[editingIndex + 1]?.role === "bot"
    ) {
      const placeholder = { role: "bot", content: "" };
      updatedChats[editingIndex + 1] = placeholder;
      setChats([...updatedChats]);

      try {
        const res = await fetch("http://localhost:5000/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: updatedChats[editingIndex].content,
            model,
          }),
        });
        const data = await res.json();
        const fullReply = data.reply;

        let i = 0;
        const interval = setInterval(() => {
          if (i <= fullReply.length) {
            const streamingContent = fullReply.slice(0, i);
            const regenerated = [...updatedChats];
            regenerated[editingIndex + 1] = {
              ...placeholder,
              content: streamingContent,
            };
            setChats(regenerated);
            i++;
          } else {
            clearInterval(interval);
            setChatHistory((prev) => ({
              ...prev,
              [currentChatId]: updatedChats,
            }));
          }
        }, 20);
      } catch (err) {
        console.error("Error:", err);
        toast.error("Failed to regenerate reply!");
      }
    } else {
      // No regeneration needed, just update chat
      setChatHistory((prev) => ({ ...prev, [currentChatId]: updatedChats }));
    }
  };

  const handleExportPDF = async () => {
    const chatElement = document.getElementById("chat-content");
    if (!chatElement) return;

    const canvas = await html2canvas(chatElement);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("chat.pdf");
  };

  const handleNewChat = () => {
    const newId = `chat-${Date.now()}`;
    setCurrentChatId(newId);
    setChats([]);
    const newTitles = {
      ...chatTitles,
      [newId]: `Chat ${Object.keys(chatTitles).length + 1}`,
    };
    setChatTitles(newTitles);
  };

  const handleSelectChat = (id) => {
    setCurrentChatId(id);
    setChats(chatHistory[id] || []);
  };

  const handleShare = () => {
    const text = chats.map((c) => `${c.role}: ${c.content}`).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      toast.info("Chat copied to clipboard!");
    });
  };

  const createChat = async (title) => {
    const id = await db.chats.add({
      title,
      createdAt: new Date().toISOString(),
    });
    return id;
  };

  const saveMessage = async (chatId, role, content) => {
    await db.messages.add({
      chatId,
      role,
      content,
      timestamp: new Date().toISOString(),
    });
  };

  const loadChat = async (chatId) => {
    const chat = await db.chats.get(chatId);
    const messages = await db.messages.where({ chatId }).sortBy("timestamp");
    return { chat, messages };
  };

  const deleteChat = async (chatId) => {
    await db.messages.where({ chatId }).delete();
    await db.chats.delete(chatId);
  };

  const renameChat = async (chatId, newTitle) => {
    await db.chats.update(chatId, { title: newTitle });
  };

  const handleModelChange = (e) => setModel(e.target.value);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      toast.error("Voice recognition not supported!");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      toast.success("Voice input captured!");
    };

    recognition.onerror = () => {
      toast.error("Voice input failed!");
    };

    recognition.start();
  };

  const handleDeleteMessage = (idx) => {
    if (window.confirm("Delete this message?")) {
      const newChats = chats.filter((_, i) => i !== idx);
      setChats(newChats);
      setChatHistory((prev) => ({ ...prev, [currentChatId]: newChats }));
    }
  };

  const handleEditMessage = (idx) => {
    setEditingIndex(idx);
    setInput(chats[idx].content);
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const handleRenameChat = (id) => {
    setEditingTitleId(id);
    setNewTitle(chatTitles[id]);
  };

  const saveRenamedChat = (id) => {
    const updatedTitles = { ...chatTitles, [id]: newTitle };
    setChatTitles(updatedTitles);
    setEditingTitleId(null);
  };

  const handleDeleteChat = (id) => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      const updatedHistory = { ...chatHistory };
      const updatedTitles = { ...chatTitles };
      delete updatedHistory[id];
      delete updatedTitles[id];
      setChatHistory(updatedHistory);
      setChatTitles(updatedTitles);
      if (currentChatId === id) {
        setCurrentChatId("default");
        setChats([]);
      }
    }
  };

  return (
    <>
      <Router>
        <Routes>
          {/* Authentication Pages inside a separate layout */}
          <Route path="/" element={<AuthLayout />}>
            <Route path="signup" element={<Signup />} />
            <Route path="login" element={<Login />} />
          </Route>

          {/* Protected Routes for logged-in users */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/chat" element={<Chatbot />} /> {/* AI Chatbot */}
          </Route>

          {/* Redirect any unknown route to login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>

      <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white transition-all duration-500">
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-gray-900 dark:bg-gray-800 text-white p-4 flex flex-col">
            <button
              onClick={handleNewChat}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-4"
            >
              + New Chat
            </button>
            <div className="mb-4">
              <label className="text-sm block mb-1">Model</label>
              <select
                value={model}
                onChange={handleModelChange}
                className="w-full p-2 rounded bg-gray-800 text-white"
              >
                <option>LLaMA3</option>
                <option>LLaMA2</option>
              </select>
            </div>

            <h2 className="text-sm mt-4 mb-2">Chat History</h2>
            <div className="flex-1 overflow-y-auto space-y-2">
              {Object.keys(chatHistory).map((id) => (
                <div
                  key={id}
                  className="flex items-center gap-1 animate-fadeIn"
                >
                  {editingTitleId === id ? (
                    <input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onBlur={() => saveRenamedChat(id)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && saveRenamedChat(id)
                      }
                      className="w-full p-1 rounded text-black"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => handleSelectChat(id)}
                      className={`flex-1 text-left px-2 py-1 rounded ${
                        id === currentChatId
                          ? "bg-gray-700"
                          : "hover:bg-gray-800"
                      }`}
                    >
                      {chatTitles[id] || id}
                    </button>
                  )}
                  <button
                    onClick={() => handleRenameChat(id)}
                    className="text-yellow-400 hover:text-yellow-600"
                  >
                    <FaPencilAlt size={12} />
                  </button>
                  <button
                    onClick={() => handleDeleteChat(id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleShare}
              className="bg-green-600 hover:bg-green-700 mt-4 px-4 py-2 rounded"
            >
              Share
            </button>
            <button
              onClick={toggleDarkMode}
              className="mt-4 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
            >
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>

            <button
              className="ml-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
              onClick={() => exportChatToPDF(chats)}
            >
              Export PDF
            </button>
          </div>

          {/* Chat UI */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 transition-all duration-300">
              {chats.map((msg, idx) => (
                <div
                  key={idx}
                  className={`group flex items-start gap-2 relative transition-opacity duration-300 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-xl px-4 py-3 max-w-2xl whitespace-pre-wrap leading-relaxed shadow-md relative ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  {msg.role === "bot" && (
                    <button
                      onClick={() => speakText(msg.content)}
                      className="text-green-500 hover:text-green-700"
                    >
                      <FaVolumeUp />
                    </button>
                  )}
                  <div className="absolute -top-1 -right-8 hidden group-hover:flex gap-2">
                    <button
                      onClick={() => handleEditMessage(idx)}
                      className="text-sm text-yellow-500 hover:text-yellow-700"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(idx)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white dark:bg-gray-800 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                className="flex-1 p-2 border rounded text-black dark:text-white bg-white dark:bg-gray-700"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message... ✍️ Try /help or 😊"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    editingIndex !== null
                      ? handleUpdateEditedMessage()
                      : handleSend();
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleVoiceInput}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                >
                  🎤
                </button>
                <button
                  onClick={
                    editingIndex !== null
                      ? handleUpdateEditedMessage
                      : handleSend
                  }
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editingIndex !== null ? "Update" : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </>
  );
}

export default App;
