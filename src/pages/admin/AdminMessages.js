import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Mail, MailOpen, Trash2, RefreshCw, User, Clock, Inbox, Sparkles, Copy } from "lucide-react";
import { adminContactAPI, adminAiAPI } from "../../services/api";
import useConfirm from "../../components/ConfirmDialog";

const fmt = (d) => {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function AdminMessages() {
  const { confirm, confirmDialog } = useConfirm();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({}); // { [id]: { loading, text } }

  const draftReply = async (m) => {
    setDrafts((d) => ({ ...d, [m._id]: { loading: true, text: d[m._id]?.text || "" } }));
    try {
      const res = await adminAiAPI.draftReply({ name: m.name, subject: m.subject, message: m.message });
      const text = res?.data?.reply || "";
      setDrafts((d) => ({ ...d, [m._id]: { loading: false, text } }));
      if (!text) toast.error("Couldn't draft a reply — try again");
    } catch (e) {
      setDrafts((d) => ({ ...d, [m._id]: { loading: false, text: "" } }));
      toast.error(e?.message || "AI is unavailable right now");
    }
  };

  const copyDraft = (text) => {
    navigator.clipboard?.writeText(text).then(() => toast.success("Copied to clipboard")).catch(() => {});
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await adminContactAPI.getAll();
      setMessages(res?.data || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const toggleRead = async (m) => {
    const next = !m.isRead;
    setMessages((list) => list.map((x) => (x._id === m._id ? { ...x, isRead: next } : x)));
    try {
      await adminContactAPI.markRead(m._id, next);
    } catch (err) {
      toast.error("Failed to update");
      setMessages((list) => list.map((x) => (x._id === m._id ? { ...x, isRead: !next } : x)));
    }
  };

  const remove = async (m) => {
    if (!(await confirm({
      title: "Delete message?",
      message: `This message from ${m.name || "the customer"} will be permanently removed.`,
      confirmLabel: "Delete message",
    }))) return;
    const prev = messages;
    setMessages((list) => list.filter((x) => x._id !== m._id));
    try {
      await adminContactAPI.remove(m._id);
      toast.success("Message deleted");
    } catch (err) {
      toast.error("Failed to delete");
      setMessages(prev);
    }
  };

  const unread = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-6">
      {confirmDialog}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900">Customer Messages</h2>
          <p className="text-xs font-medium text-stone-500 mt-1">
            Enquiries submitted through the Contact page{unread > 0 ? ` · ${unread} unread` : ""}.
          </p>
        </div>
        <button
          onClick={fetchMessages}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-stone-200 text-[11px] font-black text-stone-600 hover:bg-stone-50 transition cursor-pointer shrink-0"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-center text-xs font-medium text-stone-400 py-12">Loading messages…</p>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-10 text-center">
          <Inbox size={28} className="mx-auto text-stone-300" />
          <p className="text-sm font-black text-stone-700 mt-3">No messages yet</p>
          <p className="text-xs font-medium text-stone-400 mt-1">Customer enquiries will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m._id}
              className={`bg-white rounded-2xl border shadow-sm p-4 sm:p-5 transition ${
                m.isRead ? "border-stone-200" : "border-emerald-300 ring-1 ring-emerald-100"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {!m.isRead && <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />}
                    <p className="text-sm font-black text-stone-900 truncate">{m.subject || "(No subject)"}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] font-bold text-stone-400 flex-wrap">
                    <span className="flex items-center gap-1 min-w-0">
                      <User size={11} className="shrink-0" />
                      <span className="truncate">{m.name}</span>
                    </span>
                    <a href={`mailto:${m.email}`} className="flex items-center gap-1 text-emerald-700 hover:underline min-w-0">
                      <Mail size={11} className="shrink-0" />
                      <span className="truncate">{m.email}</span>
                    </a>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {fmt(m.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleRead(m)}
                    title={m.isRead ? "Mark as unread" : "Mark as read"}
                    className="h-8 w-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition cursor-pointer"
                  >
                    {m.isRead ? <MailOpen size={14} /> : <Mail size={14} />}
                  </button>
                  <button
                    onClick={() => remove(m)}
                    title="Delete"
                    className="h-8 w-8 rounded-lg border border-stone-200 flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-xs font-medium text-stone-600 leading-relaxed mt-3 whitespace-pre-wrap break-words">{m.message}</p>

              <div className="mt-3">
                <button
                  onClick={() => draftReply(m)}
                  disabled={drafts[m._id]?.loading}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-stone-200 text-[11px] font-black text-[#153d2b] hover:bg-emerald-50 hover:border-emerald-200 transition cursor-pointer disabled:opacity-50"
                >
                  <Sparkles size={12} /> {drafts[m._id]?.loading ? "Drafting…" : "Draft reply with AI"}
                </button>
              </div>

              {drafts[m._id]?.text && (
                <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-1.5">Suggested reply</p>
                  <p className="text-xs font-medium text-stone-700 whitespace-pre-wrap leading-relaxed">{drafts[m._id].text}</p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      onClick={() => copyDraft(drafts[m._id].text)}
                      className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-white border border-stone-200 text-[10px] font-black text-stone-600 hover:bg-stone-50 transition cursor-pointer"
                    >
                      <Copy size={11} /> Copy
                    </button>
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (m.subject || "Your message"))}&body=${encodeURIComponent(drafts[m._id].text)}`}
                      className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-[#153d2b] text-white text-[10px] font-black hover:bg-emerald-800 transition"
                    >
                      <Mail size={11} /> Reply via email
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
