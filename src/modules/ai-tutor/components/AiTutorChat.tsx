"use client";

import { useState } from "react";
import { MessageSquarePlus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CONVERSATION_TOPICS } from "@/modules/ai-tutor/ai-provider.service";

interface ChatMsg {
  id: string;
  role: string;
  content: string;
  providerName?: string | null;
}

interface ConversationItem {
  id: string;
  mode: string;
  topic?: string | null;
  title: string;
  messages: ChatMsg[];
}

export function AiTutorChat({
  initialConversations,
  defaultMode = "TUTOR_QA",
}: {
  initialConversations: ConversationItem[];
  defaultMode?: "TUTOR_QA" | "TOPIC_CONVERSATION";
}) {
  const [conversations, setConversations] = useState<ConversationItem[]>(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(initialConversations[0]?.id ?? null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const createConversation = async (mode: string, topic?: string, title?: string) => {
    try {
      const res = await fetch("/api/v1/ai/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, topic, title }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error();
      setConversations((prev) => [json.data, ...prev]);
      setActiveId(json.data.id);
    } catch {
      toast.error("Không thể tạo phiên trò chuyện mới.");
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/ai/conversations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      const remaining = conversations.filter((c) => c.id !== id);
      setConversations(remaining);
      if (activeId === id) {
        setActiveId(remaining[0]?.id ?? null);
      }
      toast.success("Đã xóa lịch sử trò chuyện.");
    } catch {
      toast.error("Không thể xóa cuộc trò chuyện.");
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    if (!navigator.onLine) {
      toast.error("Tính năng Gia sư AI yêu cầu kết nối mạng internet.");
      return;
    }

    let targetId = activeId;
    if (!targetId) {
      const res = await fetch("/api/v1/ai/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: defaultMode }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        toast.error("Không thể tạo phiên hỏi đáp.");
        return;
      }
      setConversations((prev) => [json.data, ...prev]);
      targetId = json.data.id;
      setActiveId(targetId);
    }

    const content = input.trim();
    setInput("");
    setSending(true);

    try {
      const res = await fetch(`/api/v1/ai/conversations/${targetId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        toast.error(json?.error?.message ?? "Gia sư AI tạm thời không phản hồi.");
        return;
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  json.data.userMessage,
                  json.data.assistantMessage,
                ],
              }
            : c
        )
      );
    } catch {
      toast.error("Lỗi kết nối khi gửi tin nhắn.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {defaultMode === "TOPIC_CONVERSATION" ? (
        <div className="flex flex-wrap gap-2">
          {CONVERSATION_TOPICS.map((t) => (
            <Button
              key={t.id}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => createConversation("TOPIC_CONVERSATION", t.id, `Hội thoại: ${t.labelVi}`)}
            >
              {t.labelVi}
            </Button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Conversation History Sidebar */}
        <Card className="lg:col-span-4">
          <CardContent className="space-y-3 p-4">
            <Button
              type="button"
              size="sm"
              className="w-full"
              onClick={() =>
                createConversation(
                  defaultMode,
                  defaultMode === "TOPIC_CONVERSATION" ? "greetings" : undefined
                )
              }
            >
              <MessageSquarePlus className="h-4 w-4" />
              Tạo cuộc trò chuyện mới
            </Button>

            <div className="max-h-[420px] space-y-1.5 overflow-y-auto">
              {conversations.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  Chưa có lịch sử trò chuyện. Hãy nhập câu hỏi hoặc chọn chủ đề hội thoại.
                </p>
              ) : (
                conversations.map((c) => (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-xs ${
                      c.id === activeId
                        ? "border-primary bg-accent text-accent-foreground font-medium"
                        : "border-border bg-background hover:bg-surface-muted"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveId(c.id)}
                      className="flex-1 truncate text-left cursor-pointer"
                    >
                      {c.title}
                    </button>
                    <button
                      type="button"
                      aria-label="Xóa cuộc trò chuyện"
                      onClick={() => deleteConversation(c.id)}
                      className="text-muted-foreground hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Chat Panel */}
        <Card className="flex flex-col lg:col-span-8">
          <CardContent className="flex min-h-[440px] flex-1 flex-col justify-between gap-4 p-4">
            <div className="max-h-[380px] space-y-3 overflow-y-auto pr-1">
              {!active || active.messages.length === 0 ? (
                <div className="rounded-md border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">
                    Gợi ý câu hỏi nhanh với Gia sư AI HanLearn:
                  </p>
                  <ul className="mt-2 space-y-1 text-xs">
                    <li>• Giải thích sự khác nhau giữa 想 (xiǎng) và 要 (yào) cho người mới học.</li>
                    <li>• Sửa giúp mình câu: 我是叫明安，我很高兴。</li>
                    <li>• Đặt 3 ví dụ đơn giản với từ 谢谢 (xièxie).</li>
                  </ul>
                </div>
              ) : (
                active.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-md border p-3 text-sm whitespace-pre-wrap ${
                      m.role === "user"
                        ? "ml-8 border-primary/30 bg-accent/50 text-foreground"
                        : "mr-8 border-border bg-background text-foreground"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-semibold">
                        {m.role === "user" ? "Bạn" : "Gia sư AI HanLearn"}
                      </span>
                      {m.providerName ? (
                        <Badge variant="outline">{m.providerName}</Badge>
                      ) : null}
                    </div>
                    {m.content}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendMessage} className="flex gap-2 border-t border-border pt-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu tiếng Trung cần sửa hoặc câu hỏi ngữ pháp bằng tiếng Việt..."
                className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm"
              />
              <Button type="submit" disabled={sending || !input.trim()}>
                <Send className="h-4 w-4" />
                {sending ? "Đang gửi..." : "Gửi"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
