import React, { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot } from "lucide-react";
import { adminAiAPI } from "../../services/api";
import { useProducts } from "../../context/ProductContext";

const QUICK_PROMPTS = [
  "Give me today's summary",
  "What needs my attention?",
  "Top selling products",
  "Which items are low on stock?",
];

export default function AdminCopilot() {
  const { refresh, fetchCategories } = useProducts();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
        "Hi! 🌿 I'm your Store Copilot. Ask about sales, orders, inventory or \"what needs my attention?\" — and I can also take actions for you, e.g. \"mark ORD202600001 as delivered\", \"set stock of Organic Honey to 50\", \"hide Bananas\", or \"create category Herbs\". I'll always show a preview to confirm first.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const send = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || isTyping) return;
    setMessages((prev) => [...prev, { sender: "user", text }]);
    if (!textToSend) setInput("");
    setIsTyping(true);
    try {
      const res = await adminAiAPI.chat(text);
      const reply = res?.data?.message || res?.message || "I couldn't process that right now.";
      const proposedAction = res?.data?.proposedAction || null;
      setMessages((prev) => [...prev, { sender: "bot", text: reply, proposedAction }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "I couldn't reach the AI service right now. Please try again in a moment." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Confirm & run a proposed action, then log/refresh.
  const confirmAction = async (idx) => {
    const msg = messages[idx];
    if (!msg?.proposedAction) return;
    setMessages((prev) => prev.map((m, i) => (i === idx ? { ...m, actionState: "running" } : m)));
    setIsTyping(true);
    try {
      const res = await adminAiAPI.execute(msg.proposedAction);
      const reply = res?.data?.message || "Done.";
      setMessages((prev) => prev.map((m, i) => (i === idx ? { ...m, actionState: "done" } : m)));
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
      try { refresh?.(); } catch { /* ignore */ }
      try { fetchCategories?.(); } catch { /* ignore */ }
    } catch (err) {
      setMessages((prev) => prev.map((m, i) => (i === idx ? { ...m, actionState: "error" } : m)));
      setMessages((prev) => [...prev, { sender: "bot", text: err?.message || "That action failed." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const cancelAction = (idx) => {
    setMessages((prev) => prev.map((m, i) => (i === idx ? { ...m, actionState: "cancelled" } : m)));
    setMessages((prev) => [...prev, { sender: "bot", text: "Okay, I won't do that. 👍" }]);
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-[60] font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#153d2b] text-white shadow-xl hover:bg-emerald-800 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Store Copilot"
        >
          <Sparkles size={22} className="text-lime-300" />
        </button>
      )}

      {isOpen && (
        <div className="w-[340px] sm:w-[400px] h-[540px] max-h-[80vh] rounded-3xl border border-stone-200 bg-white shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-[#153d2b] px-5 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                <Sparkles size={16} className="text-lime-300" />
              </span>
              <div>
                <h3 className="font-extrabold text-sm leading-none">Store Copilot</h3>
                <p className="text-[10px] text-emerald-200/80 font-bold mt-1">AI insights &amp; analytics</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fbfcf9]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-bold leading-relaxed whitespace-pre-line ${
                    msg.sender === "user" ? "bg-[#153d2b] text-white" : "bg-stone-100 text-stone-800"
                  }`}
                >
                  {msg.text}

                  {/* Confirm / cancel for a proposed action */}
                  {msg.proposedAction && (
                    msg.actionState ? (
                      <div className="mt-2 text-[10px] font-black text-stone-400">
                        {msg.actionState === "done"
                          ? "✓ Done"
                          : msg.actionState === "cancelled"
                          ? "Cancelled"
                          : msg.actionState === "running"
                          ? "Working…"
                          : "Failed"}
                      </div>
                    ) : (
                      <div className="mt-2.5 flex gap-2">
                        <button
                          onClick={() => confirmAction(i)}
                          className="bg-[#153d2b] hover:bg-emerald-800 text-white rounded-lg px-3 py-1.5 text-[10px] font-black transition cursor-pointer"
                        >
                          {msg.proposedAction.confirmLabel || "Confirm"}
                        </button>
                        <button
                          onClick={() => cancelAction(i)}
                          className="bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-lg px-3 py-1.5 text-[10px] font-black transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-stone-100 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick prompts */}
          <div className="p-3 bg-white border-t border-stone-100 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                disabled={isTyping}
                className="shrink-0 bg-stone-50 border border-stone-200 text-stone-600 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 rounded-lg px-2.5 py-1.5 text-[10px] font-black transition cursor-pointer disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="p-3 border-t border-stone-200 bg-white flex items-center gap-2"
          >
            <span className="h-10 w-10 flex items-center justify-center rounded-xl bg-stone-100 text-stone-500 shrink-0">
              <Bot size={16} />
            </span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about sales, orders, stock…"
              className="flex-1 min-h-10 px-4 rounded-xl border border-stone-200 bg-stone-50 outline-none text-xs font-bold transition focus:border-emerald-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={isTyping}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#153d2b] text-white hover:bg-emerald-800 transition active:scale-95 shrink-0 disabled:opacity-50"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
