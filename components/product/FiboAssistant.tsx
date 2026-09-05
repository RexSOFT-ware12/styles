"use client";

import { Button } from "@/components/ui/button";
import { askFibo, type FiboChatTurn, type FiboSuggestion } from "@/lib/products";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { Scissors, Send, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface FiboAssistantProps {
  product: Product;
}

interface Message {
  role: "user" | "assistant";
  text: string;
  suggestions?: FiboSuggestion[];
  isError?: boolean;
}

export default function FiboAssistant({ product }: FiboAssistantProps) {
  const [open, setOpen] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fabricLabel = product.fabric || "this fabric";

  useEffect(() => {
    if (open && !hasOpenedOnce) {
      setHasOpenedOnce(true);
      setMessages([
        {
          role: "assistant",
          text: `Hi, I'm Fibo \u2014 FabricNow's fabric guide. Ask me anything about the ${fabricLabel.toLowerCase()} in "${product.name}": how it feels, how to care for it, what it's best suited for, or how it compares to other options we carry.`,
        },
      ]);
    }
  }, [open, hasOpenedOnce, fabricLabel, product.name]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isThinking) return;

    const history: FiboChatTurn[] = messages
      .filter((m) => !m.isError)
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setIsThinking(true);

    try {
      const { reply, suggestions } = await askFibo(product.id, question, history);
      setMessages((prev) => [...prev, { role: "assistant", text: reply, suggestions }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          isError: true,
          text:
            err instanceof Error
              ? err.message
              : "Sorry, I couldn't reach the fabric desk just now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[30rem] w-[22rem] sm:w-96 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/15">
                <Scissors className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Fibo</p>
                <p className="text-xs opacity-80">Fabric assistant</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close Fibo"
              className="rounded-full p-1 opacity-80 transition hover:bg-primary-foreground/15 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/30 px-3 py-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex flex-col gap-2", m.role === "user" ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : m.isError
                      ? "rounded-bl-sm bg-destructive/10 text-destructive"
                      : "rounded-bl-sm bg-card text-foreground border border-border"
                  )}
                >
                  {m.text}
                </div>

                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="flex w-[90%] flex-col gap-2">
                    {m.suggestions.map((s) => (
                      <Link
                        key={s.id}
                        href={`/product/${s.id}`}
                        className="flex items-center gap-3 rounded-xl border border-border bg-card p-2 transition hover:border-primary/50 hover:shadow-sm"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image src={s.image} alt={s.name} fill className="object-cover" sizes="48px" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-foreground">{s.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.fabric ? `${s.fabric} \u00b7 ` : ""}${s.price.toFixed(2)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex items-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border bg-card px-3 py-2">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-border bg-card p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask about ${fabricLabel.toLowerCase()}...`}
              className="flex-1 rounded-full border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full"
              onClick={handleSend}
              disabled={isThinking || !input.trim()}
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90"
        >
          <Scissors className="h-4 w-4" />
          Ask Fibo about this fabric
        </button>
      )}
    </div>
  );
}
