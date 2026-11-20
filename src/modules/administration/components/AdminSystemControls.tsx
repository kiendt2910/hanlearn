"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminUserRoleSelect({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);

  const updateRole = async (nextRole: string) => {
    setRole(nextRole);
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleCode: nextRole }),
      });
      if (!res.ok) throw new Error();
      toast.success("Đã cập nhật vai trò người dùng.");
      router.refresh();
    } catch {
      setRole(currentRole);
      toast.error("Không thể cập nhật vai trò.");
    }
  };

  return (
    <select
      value={role}
      onChange={(e) => updateRole(e.target.value)}
      className="h-8 rounded-md border border-border bg-surface px-2 text-xs font-medium"
    >
      <option value="LEARNER">LEARNER</option>
      <option value="CONTENT_EDITOR">CONTENT_EDITOR</option>
      <option value="ADMIN">ADMIN</option>
    </select>
  );
}

export function AdminAiConfigForm({
  initial,
}: {
  initial: {
    provider: string;
    baseUrl: string;
    model: string;
    dailyUserLimit: number;
    hasApiKeyConfigured: boolean;
  };
}) {
  const router = useRouter();
  const [provider, setProvider] = useState(initial.provider);
  const [baseUrl, setBaseUrl] = useState(initial.baseUrl);
  const [model, setModel] = useState(initial.model);
  const [apiKey, setApiKey] = useState("");
  const [dailyUserLimit, setDailyUserLimit] = useState(initial.dailyUserLimit);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/ai-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          baseUrl,
          model,
          apiKey: apiKey || undefined,
          dailyUserLimit,
        }),
      });
      if (!res.ok) throw new Error();
      setApiKey("");
      toast.success("Đã lưu cấu hình AI phía máy chủ.");
      router.refresh();
    } catch {
      toast.error("Không thể lưu cấu hình AI.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Nhà cung cấp AI</Label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm"
          >
            <option value="openai-compatible">OpenAI-Compatible (OpenAI / OpenRouter / Ollama)</option>
            <option value="gemini">Google Gemini REST API</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Tên Model</Label>
          <Input
            placeholder="VD: gemini-2.5-flash hoặc gpt-4o-mini"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>API Base URL (OpenAI-Compatible)</Label>
          <Input
            placeholder="https://api.openai.com/v1"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Giới hạn tin nhắn/ngày mỗi học viên</Label>
          <Input
            type="number"
            min={1}
            max={500}
            value={dailyUserLimit}
            onChange={(e) => setDailyUserLimit(Number(e.target.value) || 30)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>
          API Key mới (Chỉ ghi phía máy chủ —{" "}
          {initial.hasApiKeyConfigured ? "Đã có khóa cấu hình" : "Chưa có khóa"})
        </Label>
        <Input
          type="password"
          placeholder="Để trống nếu giữ nguyên khóa hiện tại"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? "Đang lưu..." : "Lưu cấu hình AI"}
      </Button>
    </form>
  );
}
