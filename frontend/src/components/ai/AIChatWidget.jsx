import { Bot, Send, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendMessage } from "../../api/ai";
import { useAuth } from "../../contexts/auth";

export default function AIChatWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

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
    }
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
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
        aria-label={isOpen ? "Close chat" : "Open AI Assistant"}
      >
        {isOpen ? <X size={20} className="sm:size-6" /> : <Bot size={20} className="sm:size-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={widgetRef}
          className={`fixed z-50 bg-white shadow-2xl dark:bg-[#111111] ${
            window.innerWidth < 768
              ? "inset-0 rounded-none"
              : "bottom-20 right-4 h-[500px] w-[380px] rounded-2xl sm:right-6 sm:w-[400px] lg:w-[420px]"
          }`}
          style={{
            animation: window.innerWidth < 768 ? "slideUp 0.3s ease-out" : "fadeScale 0.3s ease-out",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  AI Assistant
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Powered by KIT Robotics
                </p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-slate-300"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex h-[calc(100%-130px)] flex-col overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-3 rounded-full bg-blue-50 p-4 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  <Bot size={32} />
                </div>
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  {getWelcomeMessage()}
                </p>
                <p className="mt-2 text-xs text-slate-400 dark:text-zinc-500">
                  Ask me anything about KIT Robotics
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-2 ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="mb-3 flex justify-start">
                    <div className="max-w-[85%] rounded-xl bg-slate-100 px-4 py-3 dark:bg-zinc-800">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0.15s]"></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0.3s]"></span>
                      </div>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="mb-3 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                    <button
                      onClick={handleSend}
                      className="ml-2 font-semibold underline hover:no-underline"
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
                className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-[#111111] dark:text-white disabled:opacity-50"
                aria-label="Type a message"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-50"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
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
      `}</style>
    </>
  );
}