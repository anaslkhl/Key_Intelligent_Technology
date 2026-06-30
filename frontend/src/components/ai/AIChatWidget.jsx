import { Bot, Send, X, Trash2, Minimize2, Maximize2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendMessage } from "../../api/ai";
import { useAuth } from "../../contexts/auth";

export default function AIChatWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const widgetRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [isOpen, isMinimized]);

  // Escape key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Click outside to close (desktop only)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        widgetRef.current &&
        !widgetRef.current.contains(e.target) &&
        window.innerWidth >= 768
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Prevent body scroll on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setError(null);
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendMessage(trimmed);

      if (response.type === "navigation") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.response,
          },
        ]);
        setTimeout(() => {
          navigate(`/${response.page}`);
          setIsOpen(false);
        }, 1000);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.response || "I couldn't process that request.",
          },
        ]);
      }
    } catch (err) {
      setError("Unable to get response. Please try again.");
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getWelcomeMessage = () => {
    if (messages.length === 0) {
      return "👋 Hello! I'm your AI assistant. I can answer questions about KIT Robotics, search for products, or navigate you to different pages. How can I help you today?";
    }
    return null;
  };

  return (
    <>
      {/* Chat Button with Pulse Animation */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:bottom-8 sm:right-8 ${
          !isOpen ? "animate-pulse" : ""
        }`}
        aria-label={isOpen ? "Close chat" : "Open AI Assistant"}
      >
        {isOpen ? (
          <X size={24} className="transition-transform duration-300 rotate-0" />
        ) : (
          <Bot size={24} className="transition-transform duration-300" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={widgetRef}
          className={`fixed z-50 bg-white shadow-2xl dark:bg-[#111111] transition-all duration-300 ${
            window.innerWidth < 768
              ? "inset-0 rounded-none"
              : isMinimized
              ? "bottom-24 right-6 h-16 w-[380px] rounded-2xl sm:w-[400px] lg:w-[420px]"
              : "bottom-24 right-6 h-[540px] w-[380px] rounded-2xl sm:w-[400px] lg:w-[420px]"
          }`}
          style={{
            animation: window.innerWidth < 768 ? "slideUp 0.3s ease-out" : "fadeScale 0.3s ease-out",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  AI Assistant
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {isLoading ? "Thinking..." : "Online"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-red-500 dark:hover:bg-zinc-800"
                aria-label="Clear chat"
                title="Clear chat"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={toggleMinimize}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-slate-300"
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                onClick={toggleChat}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-slate-300"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages (hidden when minimized) */}
          {!isMinimized && (
            <>
              <div className="flex h-[calc(100%-130px)] flex-col overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 p-5 text-blue-600 dark:from-blue-950/30 dark:to-blue-900/30 dark:text-blue-400">
                      <Bot size={36} />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-xs">
                      {getWelcomeMessage()}
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <button
                        onClick={() => {
                          setInput("What is OMNIE?");
                          setTimeout(() => handleSend(), 100);
                        }}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-blue-700"
                      >
                        What is OMNIE?
                      </button>
                      <button
                        onClick={() => {
                          setInput("go to robots page");
                          setTimeout(() => handleSend(), 100);
                        }}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-blue-700"
                      >
                        Show robots
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`mb-3 flex animate-fadeIn ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                            msg.role === "user"
                              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                              : "bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200"
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="mb-3 flex justify-start">
                        <div className="max-w-[85%] rounded-2xl bg-slate-100 px-4 py-3 dark:bg-zinc-800">
                          <div className="flex gap-1.5">
                            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0s]"></span>
                            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.15s]"></span>
                            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.3s]"></span>
                          </div>
                        </div>
                      </div>
                    )}
                    {error && (
                      <div className="mb-3 rounded-xl bg-red-50 p-4 text-center text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
                        <p>{error}</p>
                        <button
                          onClick={handleSend}
                          className="mt-2 font-semibold underline hover:no-underline"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-slate-200 p-3 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything..."
                    disabled={isLoading}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-[#111111] dark:text-white disabled:opacity-50"
                    aria-label="Type a message"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    aria-label="Send message"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <p className="mt-1.5 text-center text-[10px] text-slate-400 dark:text-zinc-500">
                  Powered by KIT Robotics AI
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Keyframe Animations */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeScale {
          from {
            transform: scale(0.9) translateY(10px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
} 