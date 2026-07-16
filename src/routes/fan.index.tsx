import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/portal-shell";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { askFanAssistant } from "@/lib/stadium-ai.functions";
import { useLiveStadium } from "@/lib/live-stadium";
import { LiveBadge } from "@/components/live-badge";

export const Route = createFileRoute("/fan/")({
  component: FanAssistant,
});

type Msg = { role: "user" | "ai"; text: string };

const suggestions = [
  "Where's the nearest halal food stand?",
  "How long is the queue at Gate C?",
  "Show me the fastest route to my seat 214-B",
  "I need wheelchair assistance",
];

function FanAssistant() {
  const ask = useServerFn(askFanAssistant);
  const live = useLiveStadium();
  const liveRef = useRef(live);
  liveRef.current = live;
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      text: "Hey! I'm your Stadium Brain concierge. I can see live gate loads, queues, and crowd density right now — ask me anything about the match.",
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || pending) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setPending(true);
    try {
      const s = liveRef.current;
      const { text: answer } = await ask({
        data: {
          question: q,
          stadium: {
            gateOccupancy: s.gateOccupancy,
            foodQueue: s.foodQueue,
            parkingOccupancy: s.parkingOccupancy,
            crowdDensity: s.crowdDensity,
            medicalAlerts: s.medicalAlerts,
          },
        },
      });
      setMessages((m) => [...m, { role: "ai", text: answer }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: "I couldn't reach the AI service just now. Please try again in a moment.",
        },
      ]);
      console.error(err);
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="AI Assistant"
        description="Your personal concierge for the match — powered by Stadium Brain."
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex min-h-[520px] flex-col rounded-2xl border border-border/60 bg-card shadow-card">
          <div className="flex items-center gap-3 border-b border-border/60 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Concierge · Online</div>
              <div className="text-xs text-muted-foreground">Gemini · grounded in live stadium data</div>
            </div>
            <LiveBadge />
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === "user"
                      ? "bg-gradient-primary text-primary-foreground"
                      : "border border-border/60 bg-secondary text-foreground"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {pending && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-secondary px-4 py-2.5 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing live stadium data…
                </div>
              </div>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2 border-t border-border/60 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about the match, food, seats…"
              className="flex-1 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-primary/60"
              disabled={pending}
            />
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent">
              <Sparkles className="h-4 w-4" /> Try asking
            </div>
            <ul className="mt-3 space-y-2">
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    onClick={() => send(s)}
                    className="w-full rounded-lg border border-border/60 bg-secondary/60 px-3 py-2 text-left text-sm transition hover:border-primary/40 hover:bg-secondary"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border/60 bg-primary/10 p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Your seat</div>
            <div className="mt-1 text-2xl font-bold">Section 214 · Row B · Seat 12</div>
            <div className="mt-2 text-sm text-muted-foreground">Gate B opens at 18:30 · 4 min walk from you</div>
          </div>
        </div>
      </div>
    </div>
  );
}