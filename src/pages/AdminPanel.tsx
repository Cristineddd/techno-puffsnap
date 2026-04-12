import { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  collection,
  query,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";
import { Users, Ticket, Clock, ChevronRight, RotateCcw, Zap, Mail, AlertTriangle, CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { sendTestEmail } from "../lib/emailServiceReal";

interface QueueState {
  lastNumber: number;
  currentNumber: number;
}

interface TicketDoc {
  id: string;
  name?: string;
  ticketNumber?: number;
  createdAt?: { seconds: number };
}

const AdminPanel = () => {
  // EmailJS config from env
  const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  const [queueState, setQueueState] = useState<QueueState | null>(null);
  const [ticketCount, setTicketCount] = useState<number>(0);
  const [recentTickets, setRecentTickets] = useState<TicketDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "warn" } | null>(null);

  // Email diagnostic state
  const [testEmail, setTestEmail] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: string } | null>(null);
  const [showEmailDiag, setShowEmailDiag] = useState(false);

  const showToast = (msg: string, type: "success" | "error" | "warn" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Real-time listener for queue/main
  useEffect(() => {
    const queueDocRef = doc(db, "queue", "main");
    const unsubscribe = onSnapshot(queueDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as QueueState;
        setQueueState({
          lastNumber: data.lastNumber ?? 0,
          currentNumber: data.currentNumber ?? 0,
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const q = query(collection(db, "tickets"), orderBy("createdAt", "desc"), limit(5));
        const snap = await getDocs(q);
        setTicketCount(snap.size);
        setRecentTickets(snap.docs.map(d => ({ id: d.id, ...d.data() } as TicketDoc)));
      } catch {
        // orderBy may fail if no index — fallback
        const q2 = query(collection(db, "tickets"));
        const snap2 = await getDocs(q2);
        setTicketCount(snap2.size);
      }
    };
    fetchTickets();
  }, [queueState]);

  const handleNextGuest = async () => {
    if (!queueState) return;
    if (queueState.lastNumber === 0) {
      showToast("⚠️ Wala pang naka-pila!", "warn"); return;
    }
    if (queueState.currentNumber >= queueState.lastNumber) {
      showToast("⚠️ Lahat ay naserbisyuhan na!", "warn"); return;
    }
    setLoading(true);
    try {
      const nextNumber = queueState.currentNumber + 1;
      await updateDoc(doc(db, "queue", "main"), { currentNumber: nextNumber });
      showToast(`🎉 Now calling #${nextNumber}!`);
    } catch {
      showToast("❌ Error. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset the entire queue back to 0?")) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "queue", "main"), { lastNumber: 0, currentNumber: 0 });
      showToast("🔄 Queue has been reset!");
    } catch {
      showToast("❌ Error resetting queue.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Email diagnostic test ──
  const handleTestEmail = async () => {
    if (!testEmail) return;
    setTestSending(true);
    setTestResult(null);
    try {
      await sendTestEmail(testEmail);
      setTestResult({ success: true, message: `✅ Sent to ${testEmail}! Check their inbox (not yours).` });
    } catch (err) {
      setTestResult({ success: false, message: `❌ Failed: ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      setTestSending(false);
    }
  };

  const waitingCount = queueState
    ? Math.max(0, queueState.lastNumber - queueState.currentNumber)
    : 0;

  const toastColors: Record<string, string> = {
    success: "bg-green-400 text-black",
    error:   "bg-red-400 text-white",
    warn:    "bg-yellow-400 text-black",
  };

  return (
    <div className="min-h-screen halftone bg-background flex flex-col">

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-20 border-b-4 border-foreground bg-primary px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl leading-none">🎛️</span>
          <div>
            <h1 className="font-display text-3xl text-primary-foreground leading-none tracking-wide">PUFFSNAP</h1>
            <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-primary-foreground/15 border-2 border-primary-foreground/30 rounded-2xl px-4 py-2">
          <Zap className="h-4 w-4 text-yellow-300" />
          <span className="text-primary-foreground text-sm font-bold">LIVE</span>
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
        </div>
      </header>

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 ${toastColors[toast.type]} font-bold text-sm px-6 py-3 rounded-2xl border-4 border-foreground shadow-[4px_4px_0px_hsl(280_80%_15%)] transition-all animate-bounce`}>
          {toast.msg}
        </div>
      )}

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8">

        {/* ── Stat Cards ── */}
        <section>
          <p className="font-display text-lg text-muted-foreground mb-4 tracking-widest">QUEUE OVERVIEW</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* NOW SERVING */}
            <div className="comic-card-lg bg-card p-6 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-green-400 rounded-t-3xl" />
              <div className="bg-green-100 border-4 border-green-400 rounded-2xl p-3 mb-1">
                <ChevronRight className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Now Serving</p>
              <p className="font-display text-7xl text-green-500 leading-none">
                {queueState?.currentNumber ?? <span className="text-muted-foreground">—</span>}
              </p>
            </div>

            {/* LAST TICKET */}
            <div className="comic-card-lg bg-card p-6 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-blue-400 rounded-t-3xl" />
              <div className="bg-blue-100 border-4 border-blue-400 rounded-2xl p-3 mb-1">
                <Ticket className="h-6 w-6 text-blue-600" />
              </div>
              <p className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Last Ticket</p>
              <p className="font-display text-7xl text-blue-500 leading-none">
                {queueState?.lastNumber ?? <span className="text-muted-foreground">—</span>}
              </p>
            </div>

            {/* WAITING */}
            <div className={`comic-card-lg bg-card p-6 flex flex-col items-center justify-center gap-2 relative overflow-hidden`}>
              <div className={`absolute top-0 left-0 right-0 h-2 rounded-t-3xl ${waitingCount > 0 ? "bg-yellow-400" : "bg-muted"}`} />
              <div className={`border-4 rounded-2xl p-3 mb-1 ${waitingCount > 0 ? "bg-yellow-100 border-yellow-400" : "bg-muted border-border"}`}>
                <Users className={`h-6 w-6 ${waitingCount > 0 ? "text-yellow-600" : "text-muted-foreground"}`} />
              </div>
              <p className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Waiting</p>
              <p className={`font-display text-7xl leading-none ${waitingCount > 0 ? "text-yellow-500" : "text-muted-foreground"}`}>
                {waitingCount}
              </p>
            </div>

          </div>
        </section>

        {/* ── Action Buttons ── */}
        <section className="comic-card bg-card p-6 space-y-4">
          <p className="font-display text-xl text-foreground tracking-widest">QUEUE ACTIONS</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleNextGuest}
              disabled={loading}
              className="comic-button flex-1 flex items-center justify-center gap-3 bg-green-400 text-black py-5 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-pulse font-display tracking-widest">CALLING...</span>
              ) : (
                <>
                  <ChevronRight className="h-6 w-6" />
                  <span className="font-display tracking-widest">NEXT GUEST</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              disabled={loading}
              className="comic-button flex items-center justify-center gap-3 bg-red-100 text-red-600 border-red-400 px-8 py-5 text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-200"
            >
              <RotateCcw className="h-5 w-5" />
              <span className="font-display tracking-widest">RESET</span>
            </button>
          </div>

          {/* Progress bar */}
          {queueState && queueState.lastNumber > 0 && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>PROGRESS</span>
                <span>{queueState.currentNumber} / {queueState.lastNumber} served</span>
              </div>
              <div className="h-4 rounded-full border-4 border-foreground bg-muted overflow-hidden">
                <div
                  className="h-full bg-green-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, (queueState.currentNumber / queueState.lastNumber) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </section>

        {/* ── Recent Tickets ── */}
        {recentTickets.length > 0 && (
          <section className="comic-card bg-card p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <p className="font-display text-xl text-foreground tracking-widest">RECENT TICKETS</p>
            </div>
            <div className="space-y-2">
              {recentTickets.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-2xl border-2 border-border bg-muted/40 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-2xl text-primary">#{t.ticketNumber ?? "?"}</span>
                    <span className="text-sm font-bold text-foreground">{t.name ?? "Guest"}</span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border-2 ${
                    (t.ticketNumber ?? 0) <= (queueState?.currentNumber ?? 0)
                      ? "bg-green-100 text-green-700 border-green-400"
                      : "bg-yellow-100 text-yellow-700 border-yellow-400"
                  }`}>
                    {(t.ticketNumber ?? 0) <= (queueState?.currentNumber ?? 0) ? "✓ Served" : "Waiting"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            ── EMAIL DIAGNOSTIC TOOL ──
            ═══════════════════════════════════════════════════════════════ */}
        <section className="comic-card bg-card p-6 space-y-4 border-2 border-primary/30">
          <button
            onClick={() => setShowEmailDiag(!showEmailDiag)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 border-4 border-purple-400 rounded-2xl p-2">
                <Mail className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-display text-xl text-foreground tracking-widest">EMAIL DIAGNOSTIC</p>
                <p className="text-xs text-muted-foreground">Test & fix EmailJS email delivery</p>
              </div>
            </div>
            <span className="text-sm font-bold text-muted-foreground">{showEmailDiag ? "▲" : "▼"}</span>
          </button>

          {showEmailDiag && (
            <div className="space-y-5 pt-2">

              {/* Config status */}
              <div className="rounded-2xl border-2 border-border bg-muted/40 p-4 space-y-2">
                <p className="font-bold text-sm text-foreground">📋 Current EmailJS Config:</p>
                <div className="grid grid-cols-1 gap-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service ID:</span>
                    <span className={`font-bold ${SERVICE_ID ? 'text-green-600' : 'text-red-500'}`}>
                      {SERVICE_ID || '❌ NOT SET'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Template ID:</span>
                    <span className={`font-bold ${TEMPLATE_ID ? 'text-green-600' : 'text-red-500'}`}>
                      {TEMPLATE_ID || '❌ NOT SET'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Public Key:</span>
                    <span className={`font-bold ${PUBLIC_KEY ? 'text-green-600' : 'text-red-500'}`}>
                      {PUBLIC_KEY ? `${PUBLIC_KEY.slice(0, 6)}…` : '❌ NOT SET'}
                    </span>
                  </div>
                </div>

                {/* No longer showing delivery template warning since we're using REST API */}
              </div>

              {/* Test email sender */}
              <div className="space-y-3">
                <p className="font-bold text-sm text-foreground">🧪 Send a Test Email:</p>
                <p className="text-xs text-muted-foreground">
                  Enter an email that is <strong>NOT</strong> yours. If the delivery template is set,
                  it'll send via EmailJS. If not, it'll open your mail app as fallback.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="friend@example.com"
                    className="flex-1 rounded-xl border-2 border-border bg-background px-3 py-2.5 text-sm font-medium placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleTestEmail()}
                  />
                  <button
                    onClick={handleTestEmail}
                    disabled={testSending}
                    className="comic-button bg-primary text-primary-foreground px-5 py-2.5 disabled:opacity-50"
                  >
                    {testSending ? "⏳" : "SEND TEST"}
                  </button>
                </div>

                {testResult && (
                  <div className={`rounded-2xl border-2 p-4 ${testResult.success ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}>
                    <p className={`font-bold text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                      {testResult.message}
                    </p>
                    {testResult.details && (
                      <p className="text-xs mt-2 text-foreground/70 whitespace-pre-wrap">{testResult.details}</p>
                    )}
                  </div>
                )}
              </div>

              {/* ── CREATE A NEW DELIVERY TEMPLATE (step by step) ── */}
              <div className="rounded-2xl border-2 border-purple-400 bg-purple-50 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <Mail className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-purple-800">
                      🛠️ How to create the "Delivery" template (one-time setup)
                    </p>
                    <p className="text-xs text-purple-700 mt-1">
                      Your current template (<code className="font-mono text-xs">template_puffsnap</code>) has your email
                      hardcoded in "To Email", so every email goes to YOU.
                      Create a <strong>new</strong> template that sends to the recipient:
                    </p>
                  </div>
                </div>

                <ol className="list-decimal list-inside space-y-3 text-xs text-purple-900 pl-2">
                  <li>
                    <a
                      href="https://dashboard.emailjs.com/admin/templates/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 underline font-bold"
                    >
                      Click here to create a new template <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    In the <strong>"Settings"</strong> tab, set:<br/>
                    <div className="ml-4 mt-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-purple-700">To Email:</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText("{{to_email}}");
                            showToast("📋 Copied!", "success");
                          }}
                          className="inline-flex items-center gap-1 bg-white border border-purple-300 rounded px-2 py-0.5 font-mono font-bold text-purple-700 hover:bg-purple-100 transition-colors"
                        >
                          {"{{to_email}}"} <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-purple-700">From Name:</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText("{{from_name}}");
                            showToast("📋 Copied!", "success");
                          }}
                          className="inline-flex items-center gap-1 bg-white border border-purple-300 rounded px-2 py-0.5 font-mono font-bold text-purple-700 hover:bg-purple-100 transition-colors"
                        >
                          {"{{from_name}}"} <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-purple-700">Reply To:</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText("{{reply_to}}");
                            showToast("📋 Copied!", "success");
                          }}
                          className="inline-flex items-center gap-1 bg-white border border-purple-300 rounded px-2 py-0.5 font-mono font-bold text-purple-700 hover:bg-purple-100 transition-colors"
                        >
                          {"{{reply_to}}"} <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </li>
                  <li>
                    In the <strong>"Content"</strong> tab, set Subject to:{" "}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("{{subject}}");
                        showToast("📋 Copied!", "success");
                      }}
                      className="inline-flex items-center gap-1 bg-white border border-purple-300 rounded px-2 py-0.5 font-mono font-bold text-purple-700 hover:bg-purple-100 transition-colors"
                    >
                      {"{{subject}}"} <Copy className="h-3 w-3" />
                    </button>
                    <br/>
                    And paste this as the body (HTML):
                    <button
                      onClick={() => {
                        const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#faf5ff;border-radius:16px;">
  <h1 style="color:#7c3aed;text-align:center;">📸 PUFFSNAP</h1>
  <p style="font-size:16px;">Hey {{to_name}},</p>
  <p style="font-size:14px;">{{message}}</p>
  <div style="text-align:center;margin:20px 0;">
    {{download_link}}
  </div>
  <p style="font-size:12px;color:#6b7280;">{{attachment_note}}</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;"/>
  <p style="font-size:11px;color:#9ca3af;text-align:center;">
    {{hashtag}} • {{date}}<br/>Sent with 💜 from PUFFSNAP Photobooth
  </p>
</div>`;
                        navigator.clipboard.writeText(html);
                        showToast("📋 Template HTML copied!", "success");
                      }}
                      className="mt-1 comic-button bg-purple-600 text-white text-[11px] px-3 py-1.5"
                    >
                      📋 COPY TEMPLATE HTML
                    </button>
                  </li>
                  <li>Click <strong>Save</strong> — copy the new template ID (e.g. <code className="font-mono">template_abc123</code>)</li>
                  <li>
                    Add it to your <code className="font-mono">.env.local</code> file as:
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("VITE_EMAILJS_DELIVERY_TEMPLATE_ID=template_PASTE_YOUR_ID_HERE");
                        showToast("📋 Copied!", "success");
                      }}
                      className="mt-1 block bg-white border border-purple-300 rounded px-2 py-1 font-mono font-bold text-purple-700 hover:bg-purple-100 transition-colors text-[10px]"
                    >
                      VITE_EMAILJS_DELIVERY_TEMPLATE_ID=template_PASTE_YOUR_ID_HERE <Copy className="inline h-3 w-3 ml-1" />
                    </button>
                  </li>
                  <li>Rebuild & deploy — emails will now go to the <strong>actual recipient</strong>! ✅</li>
                </ol>
              </div>

              {/* Quick-fix: just edit existing template */}
              <div className="rounded-2xl border-2 border-yellow-400 bg-yellow-50 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-yellow-800">
                      ⚡ Quick-fix alternative: Edit your existing template
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Instead of creating a new template, you can just fix the existing one:
                    </p>
                  </div>
                </div>

                <ol className="list-decimal list-inside space-y-2 text-xs text-yellow-900 pl-2">
                  <li>
                    <a
                      href={`https://dashboard.emailjs.com/admin/templates/template_puffsnap`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 underline font-bold"
                    >
                      Open your template <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>Click the <strong>"Settings"</strong> tab</li>
                  <li>
                    Change <strong>"To Email"</strong> from your email to:{" "}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("{{to_email}}");
                        showToast("📋 Copied!", "success");
                      }}
                      className="inline-flex items-center gap-1 bg-white border border-yellow-400 rounded px-1.5 py-0.5 font-mono font-bold text-purple-700 hover:bg-yellow-100 transition-colors"
                    >
                      {"{{to_email}}"} <Copy className="h-3 w-3" />
                    </button>
                  </li>
                  <li>Click <strong>Save</strong></li>
                  <li>No code changes needed — test again!</li>
                </ol>
              </div>

              {/* Current status */}
              <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-green-800">
                      Current fallback: mailto: link
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Until the delivery template is set up, emails will open the user's
                      mail app pre-filled with the photo strip link. The email will
                      <strong> always go to the right person</strong> because the user sends it themselves.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </section>

        {/* ── Footer info ── */}
        <p className="text-center text-xs text-muted-foreground font-bold pb-4">
          Total tickets issued today: <span className="text-foreground">{ticketCount}</span>
        </p>
      </main>
    </div>
  );
};

export default AdminPanel;
