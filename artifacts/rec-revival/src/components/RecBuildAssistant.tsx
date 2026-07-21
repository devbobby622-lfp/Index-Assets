import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Bot, ChevronRight, RotateCcw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'wouter';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  actions?: Action[];
  timestamp: number;
}

interface Action {
  label: string;
  value: string;
}

// ── Response engine ───────────────────────────────────────────────────────────
interface ResponseRule {
  patterns: RegExp[];
  response: string | (() => string);
  actions?: Action[];
}

const RULES: ResponseRule[] = [
  // ── Lost authenticator / 2FA code ────────────────────────────────────────
  {
    patterns: [
      /lost.*(auth|2fa|code|authenticator|totp|app)/i,
      /can.?t.*(access|open|find|use).*(auth|2fa|authenticator)/i,
      /no.*(access|longer).*(auth|authenticator|2fa)/i,
      /forgot.*(auth|2fa|code)/i,
      /deleted.*(auth|authenticator)/i,
      /new (phone|device).*(auth|2fa)/i,
      /change.*(phone|device)/i,
      /lost my (phone|device)/i,
      /(phone|device).*(lost|broken|stolen|replaced)/i,
      /reset.*(2fa|auth|authenticator)/i,
      /remove.*(2fa|auth)/i,
      /disable.*(2fa|auth)/i,
    ],
    response:
      "Lost access to your authenticator app? No worries — here's how to get back in:\n\n" +
      "1️⃣ **Backup code** — If you saved your backup codes when setting up 2FA, use one of those on the 2FA screen.\n\n" +
      "2️⃣ **Email recovery** — On the 2FA screen, click *\"Lost access to your authenticator?\"* → then *\"I don't have any backup codes\"*. A one-time code will be sent to your registered email.\n\n" +
      "3️⃣ **No backup codes and no email access?** — Unfortunately there's no other automated way to recover your account. Contact a server admin on Discord for manual verification.",
    actions: [
      { label: 'Go to Sign In', value: '/sign-in' },
      { label: 'I have no backup codes either', value: 'no-backup' },
    ],
  },

  // ── No backup codes follow-up ─────────────────────────────────────────────
  {
    patterns: [
      /no.*(backup|back.?up).*(code)/i,
      /don.?t have.*(backup|back.?up)/i,
      /lost.*(backup|back.?up)/i,
      /forgot.*(backup|back.?up)/i,
      /no-backup/,
    ],
    response:
      "If you've lost both your authenticator and your backup codes, the **email recovery** option is your last self-service path:\n\n" +
      "• On the 2FA sign-in screen, click *\"Lost access to your authenticator?\"*\n" +
      "• Then click *\"I don't have any backup codes\"*\n" +
      "• A 6-digit recovery code will be sent to the email on your account\n\n" +
      "If you no longer have access to that email either, you'll need to reach out to a **server admin** directly via Discord — they can manually verify your identity and remove 2FA from your account.",
    actions: [
      { label: 'How do I contact an admin?', value: 'contact-admin' },
    ],
  },

  // ── Contact admin ─────────────────────────────────────────────────────────
  {
    patterns: [
      /contact.*(admin|owner|moderator|mod)/i,
      /reach.*(admin|owner|mod)/i,
      /talk.*(admin|owner|mod)/i,
      /contact-admin/,
      /discord/i,
    ],
    response:
      "To reach a server admin, join the **Rec Room Revival Discord** server. You can find the invite link on the home page or in the game client.\n\n" +
      "When you message an admin, have ready:\n" +
      "• Your username\n" +
      "• The email address on your account\n" +
      "• Any info that proves ownership (old screenshots, posts, etc.)\n\n" +
      "Admins can manually disable 2FA on verified accounts.",
    actions: [
      { label: 'Back to start', value: 'restart' },
    ],
  },

  // ── What is 2FA / how does it work ────────────────────────────────────────
  {
    patterns: [
      /what is 2fa/i,
      /what.*(two.?factor|2fa)/i,
      /how does 2fa work/i,
      /explain.*(2fa|two.?factor)/i,
    ],
    response:
      "**Two-factor authentication (2FA)** adds a second layer of security to your account.\n\n" +
      "After entering your password, you're asked for a 6-digit code that refreshes every 30 seconds in an authenticator app (like Google Authenticator or Authy).\n\n" +
      "Even if someone steals your password, they can't get in without your phone. You can enable it in **Settings → Security**.",
    actions: [
      { label: 'How do I enable 2FA?', value: 'enable-2fa' },
      { label: 'I lost my 2FA code', value: 'lost auth code' },
    ],
  },

  // ── How to enable 2FA ─────────────────────────────────────────────────────
  {
    patterns: [
      /how.*(enable|turn on|set up|setup|add|activate).*(2fa|two.?factor|auth)/i,
      /enable-2fa/,
    ],
    response:
      "Setting up 2FA is quick:\n\n" +
      "1. Go to **Settings → Security**\n" +
      "2. Click **Enable Two-Factor Authentication**\n" +
      "3. Scan the QR code with Google Authenticator, Authy, or any TOTP app\n" +
      "4. Enter the 6-digit code to confirm\n" +
      "5. **Save your backup codes** somewhere safe — you'll need them if you ever lose your phone!\n\n" +
      "That's it. Your account is now much more secure. 🛡️",
    actions: [
      { label: 'Open Settings', value: '/settings' },
    ],
  },

  // ── Backup codes ─────────────────────────────────────────────────────────
  {
    patterns: [
      /backup code/i,
      /back.?up code/i,
      /recovery code/i,
      /what are backup/i,
    ],
    response:
      "**Backup codes** are one-time-use codes generated when you set up 2FA. Each code can only be used once — after that it's gone.\n\n" +
      "They let you sign in if you've lost access to your authenticator app. Store them somewhere safe — a password manager, printed paper, or a secure note.\n\n" +
      "If you've used all your backup codes or can't find them, use the **email recovery** option on the 2FA sign-in screen instead.",
    actions: [
      { label: 'I lost my backup codes too', value: 'no-backup' },
    ],
  },

  // ── Can't sign in / login issues ─────────────────────────────────────────
  {
    patterns: [
      /can.?t.*(sign|log).?(in|into)/i,
      /won.?t.*(sign|log).?(in|into)/i,
      /trouble.*(sign|log).?(in|into)/i,
      /not.*(sign|log).?(in|into)/i,
      /sign.?in.*(not working|broken|issue|problem)/i,
      /login.*(not working|broken|issue|problem)/i,
    ],
    response:
      "Having trouble signing in? Here are some things to check:\n\n" +
      "• **Wrong password?** — Try the username and password you registered with. Passwords are case-sensitive.\n" +
      "• **Stuck on 2FA?** — If you've lost your authenticator, click *\"Lost access to your authenticator?\"* on that screen.\n" +
      "• **Account not found?** — Make sure you have an account — try signing up if you haven't.\n\n" +
      "Still stuck? Let me know more about what's happening.",
    actions: [
      { label: 'I lost my 2FA code', value: 'lost auth code' },
      { label: 'Go to Sign In', value: '/sign-in' },
    ],
  },

  // ── Password reset / forgot password ─────────────────────────────────────
  {
    patterns: [
      /forgot.*(password|pass)/i,
      /lost.*(password|pass)/i,
      /reset.*(password|pass)/i,
      /change.*(password|pass)/i,
    ],
    response:
      "You can change your password any time in **Settings → Security**.\n\n" +
      "If you're locked out and can't sign in at all, there's currently no self-service password reset — account data is stored locally on your device. Contact a server admin via Discord if you need manual help.",
    actions: [
      { label: 'Open Settings', value: '/settings' },
      { label: 'Contact an admin', value: 'contact-admin' },
    ],
  },

  // ── How to join / play ────────────────────────────────────────────────────
  {
    patterns: [
      /how.*(join|play|connect|get started)/i,
      /how.*(download|install)/i,
      /get.*(started|into|playing)/i,
      /set.*(up|down).*(client|game)/i,
    ],
    response:
      "To join Rec Room Revival:\n\n" +
      "1. **Create an account** on this site\n" +
      "2. **Download** the 2020 Rec Room client (see the Instructions page)\n" +
      "3. **Connect** the client to the Revival server\n\n" +
      "The Instructions page has a full step-by-step setup guide.",
    actions: [
      { label: 'View Instructions', value: '/instructions' },
      { label: 'Create Account', value: '/sign-up' },
    ],
  },

  // ── What is Rec Room Revival ──────────────────────────────────────────────
  {
    patterns: [
      /what is rec room revival/i,
      /what is this (site|server|project)/i,
      /about (this|rec room revival)/i,
      /tell me about/i,
    ],
    response:
      "**Rec Room Revival** is a fan-run project that brings back the 2020 version of Rec Room — before the major client overhauls. We host a server that lets you connect with the original 2020 client and experience the game as it was.\n\n" +
      "Not affiliated with Against Gravity. Just fans keeping the old build alive. 🎮",
    actions: [
      { label: 'How do I join?', value: 'how to join' },
    ],
  },

  // ── Hello / greeting ─────────────────────────────────────────────────────
  {
    patterns: [
      /^(hi|hey|hello|howdy|sup|yo|hiya|greetings)[\s!?.,]*$/i,
    ],
    response:
      "Hey! 👋 I'm the **RecBuild Assistant**. I can help with:\n\n" +
      "• Lost 2FA / authenticator codes\n" +
      "• Account recovery\n" +
      "• Setting up 2FA\n" +
      "• How to join the server\n\n" +
      "What do you need help with?",
    actions: [
      { label: 'I lost my 2FA code', value: 'lost auth code' },
      { label: 'How do I join?', value: 'how to join' },
      { label: 'What is this?', value: 'what is rec room revival' },
    ],
  },

  // ── Thank you ─────────────────────────────────────────────────────────────
  {
    patterns: [
      /^(thanks|thank you|ty|thx|thank)[\s!.]*$/i,
      /thanks? (so much|a lot|for (the )?help)/i,
    ],
    response: "Happy to help! Let me know if you run into anything else. 😊",
    actions: [],
  },
];

const FALLBACK_RESPONSE =
  "I'm not sure about that one. Here's what I can help with:\n\n" +
  "• **Lost 2FA / authenticator codes** — type *\"lost auth code\"*\n" +
  "• **Account recovery** — type *\"can't sign in\"*\n" +
  "• **Setting up 2FA** — type *\"how do I enable 2FA\"*\n" +
  "• **How to join** — type *\"how to join\"*\n\n" +
  "For anything else, reach out to an admin on Discord.";

const GREETING: Message = {
  id: 'greeting',
  role: 'assistant',
  text:
    "Hi! I'm **RecBuild**, your Rec Room Revival assistant. 🎮\n\n" +
    "I can help with account issues, 2FA, and getting started. What do you need?",
  actions: [
    { label: 'I lost my 2FA code', value: 'lost auth code' },
    { label: 'No backup codes either', value: 'no-backup' },
    { label: 'How do I join?', value: 'how to join' },
  ],
  timestamp: Date.now(),
};

function getResponse(input: string): { text: string; actions?: Action[] } {
  const trimmed = input.trim();
  for (const rule of RULES) {
    if (rule.patterns.some(p => p.test(trimmed))) {
      const text = typeof rule.response === 'function' ? rule.response() : rule.response;
      return { text, actions: rule.actions };
    }
  }
  return { text: FALLBACK_RESPONSE };
}

// ── Markdown-ish renderer (bold + newlines only) ──────────────────────────────
function Markdown({ text }: { text: string }) {
  const parts = text.split('\n');
  return (
    <span>
      {parts.map((line, i) => {
        const segments = line.split(/\*\*(.+?)\*\*/g);
        return (
          <span key={i}>
            {segments.map((seg, j) =>
              j % 2 === 1
                ? <strong key={j} className="font-black text-foreground">{seg}</strong>
                : <span key={j}>{seg.replace(/\*(.*?)\*/g, '$1')}</span>
            )}
            {i < parts.length - 1 && <br />}
          </span>
        );
      })}
    </span>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────
export default function RecBuildAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const pushAssistant = useCallback((text: string, actions?: Action[]) => {
    setTyping(true);
    const delay = Math.min(600 + text.length * 8, 1800);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', text, actions, timestamp: Date.now() },
      ]);
    }, delay);
  }, []);

  const handleSend = useCallback((raw: string) => {
    const text = raw.trim();
    if (!text) return;
    setInput('');

    if (text === 'restart') {
      setMessages([GREETING]);
      return;
    }

    setMessages(prev => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', text, timestamp: Date.now() },
    ]);

    const { text: reply, actions } = getResponse(text);
    pushAssistant(reply, actions);
  }, [pushAssistant]);

  const handleAction = useCallback((action: Action) => {
    // Navigate actions (start with /)
    if (action.value.startsWith('/')) {
      setOpen(false);
      navigate(action.value);
      return;
    }
    handleSend(action.value);
  }, [handleSend]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  return (
    <>
      {/* ── Chat panel ──────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed bottom-20 right-4 z-50 w-80 sm:w-96 flex flex-col rounded-3xl border border-border overflow-hidden"
          style={{
            background: 'hsl(var(--card))',
            boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px hsl(var(--border))',
            maxHeight: 'calc(100vh - 120px)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)/0.12), hsl(var(--primary)/0.04))' }}>
            <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0"
              style={{ boxShadow: '0 4px 12px hsl(var(--primary)/0.4)' }}>
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-sm">RecBuild Assistant</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: '0 0 4px #4ade80' }} />
                <span className="text-[10px] text-muted-foreground">Online · Always here to help</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => { setMessages([GREETING]); }} title="Restart conversation"
                className="w-7 h-7 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-2`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-start gap-2 w-full">
                    <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="bg-muted/60 border border-border rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed text-muted-foreground"
                      >
                        <Markdown text={msg.text} />
                      </div>
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {msg.actions.map((a, i) => (
                            <button
                              key={i}
                              onClick={() => handleAction(a)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                            >
                              {a.label} <ChevronRight className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {msg.role === 'user' && (
                  <div
                    className="max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm font-medium text-white"
                    style={{ background: 'hsl(var(--primary))', boxShadow: '0 4px 12px hsl(var(--primary)/0.25)' }}
                  >
                    {msg.text}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-muted/60 border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  {[0, 150, 300].map(delay => (
                    <span
                      key={delay}
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60"
                      style={{ animation: `bounce 1s ${delay}ms infinite` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 border-t border-border p-3">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything…"
                disabled={typing}
                className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={typing || !input.trim()}
                className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:opacity-90 transition-opacity"
                style={{ boxShadow: '0 4px 12px hsl(var(--primary)/0.3)' }}
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── FAB ──────────────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{
          background: open ? 'hsl(var(--card))' : 'hsl(var(--primary))',
          border: open ? '1px solid hsl(var(--border))' : 'none',
          boxShadow: open
            ? '0 8px 24px rgba(0,0,0,0.3)'
            : '0 8px 24px hsl(var(--primary)/0.45), 0 0 0 4px hsl(var(--primary)/0.12)',
        }}
        aria-label="Open RecBuild Assistant"
      >
        {open
          ? <X className="w-5 h-5 text-foreground" />
          : <Bot className="w-6 h-6 text-white" />
        }
      </button>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}
