import { useState } from "react";
import { ArrowLeft, Mail, Plus, X, Send, Clock, User, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

interface EmailContact {
  id: string;
  name: string;
  email: string;
}

interface EmailScheduleData {
  contacts: EmailContact[];
  subject: string;
  message: string;
  scheduledTime: string;
  scheduledDate: string;
}

interface EmailSchedulingProps {
  stripImage: string;
  onScheduleEmail: (emailData: EmailScheduleData) => void;
  onCancel: () => void;
}

const EmailScheduling = ({ stripImage, onScheduleEmail, onCancel }: EmailSchedulingProps) => {
  const [contacts, setContacts] = useState<EmailContact[]>([]);
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [message, setMessage] = useState("Hey! Check out our PUFFSNAP photo strip! 📸✨");
  const [isSending, setIsSending] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [showMessageEdit, setShowMessageEdit] = useState(false);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const addContact = () => {
    const name = newContactName.trim();
    const email = newContactEmail.trim();
    if (!email || !isValidEmail(email)) return;
    setContacts([...contacts, {
      id: Date.now().toString(),
      name: name || email.split("@")[0],
      email,
    }]);
    setNewContactName("");
    setNewContactEmail("");
  };

  const removeContact = (id: string) => setContacts(contacts.filter(c => c.id !== id));

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentTime = now.toTimeString().slice(0, 5);

  // When "Send Now" — set date/time to now
  const handleSend = async () => {
    if (contacts.length === 0) return;
    setIsSending(true);

    const finalDate = showSchedule && scheduledDate ? scheduledDate : today;
    const finalTime = showSchedule && scheduledTime ? scheduledTime : currentTime;

    try {
      await onScheduleEmail({
        contacts,
        subject: `📸 Your PUFFSNAP Photo Strip!`,
        message,
        scheduledDate: finalDate,
        scheduledTime: finalTime,
      });
    } catch {
      alert("Failed to send. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const canSend = contacts.length > 0 && (!showSchedule || (scheduledDate && scheduledTime));

  return (
    <div className="min-h-[100dvh] halftone flex flex-col">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <button onClick={onCancel} className="comic-button flex items-center gap-1.5 bg-muted px-3 py-1.5 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          BACK
        </button>
        <h2 className="font-display text-lg text-foreground flex items-center gap-1.5">
          <Mail className="h-4 w-4 text-primary" />
          SEND VIA EMAIL
        </h2>
        <div className="w-16" />
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col px-4 py-5 gap-4 max-w-md mx-auto w-full">

        {/* ── Strip preview (small) ── */}
        <div className="flex justify-center">
          <div className="comic-card overflow-hidden bg-card p-2 inline-block">
            <img
              src={stripImage}
              alt="Photo Strip"
              className="h-36 w-auto rounded-xl object-contain border-2 border-foreground"
            />
          </div>
        </div>

        {/* ── Add recipients ── */}
        <div className="comic-card bg-card p-4">
          <p className="font-display text-sm text-foreground mb-3 flex items-center gap-1.5">
            <User className="h-4 w-4 text-primary" />
            SEND TO
          </p>

          {/* Contact input — stacked for mobile */}
          <div className="flex flex-col gap-2 mb-3">
            <input
              className="w-full rounded-xl border-2 border-border bg-background px-3 py-2.5 text-sm font-medium placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
              placeholder="Name (optional)"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addContact()}
            />
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-xl border-2 border-border bg-background px-3 py-2.5 text-sm font-medium placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
                placeholder="email@example.com"
                type="email"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addContact()}
              />
              <button
                onClick={addContact}
                disabled={!newContactEmail.trim() || !isValidEmail(newContactEmail)}
                className="comic-button bg-primary text-primary-foreground px-3 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Contact chips */}
          {contacts.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full pl-3 pr-1.5 py-1 group"
                >
                  <div className="flex flex-col leading-tight">
                    <span className="text-xs font-bold text-foreground">{c.name}</span>
                    <span className="text-[10px] text-muted-foreground">{c.email}</span>
                  </div>
                  <button
                    onClick={() => removeContact(c.id)}
                    className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-destructive/20 transition-colors"
                  >
                    <X className="h-3 w-3 text-muted-foreground group-hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              Add at least one email address above ☝️
            </p>
          )}
        </div>

        {/* ── Message (collapsible) ── */}
        <div className="comic-card bg-card p-4">
          <button
            onClick={() => setShowMessageEdit(!showMessageEdit)}
            className="w-full flex items-center justify-between"
          >
            <p className="font-display text-sm text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-accent" />
              MESSAGE
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {showMessageEdit ? "collapse" : "edit"}
              {showMessageEdit ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </div>
          </button>

          {showMessageEdit ? (
            <textarea
              className="mt-3 w-full rounded-xl border-2 border-border bg-background px-3 py-2.5 text-sm font-medium placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none resize-none transition-colors"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message…"
            />
          ) : (
            <p className="mt-2 text-xs text-muted-foreground italic line-clamp-2">"{message}"</p>
          )}
        </div>

        {/* ── Send Later toggle ── */}
        <div className="comic-card bg-card p-4">
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="w-full flex items-center justify-between"
          >
            <p className="font-display text-sm text-foreground flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-secondary" />
              SEND LATER?
            </p>
            <div
              className={`relative w-10 h-5 rounded-full transition-colors ${
                showSchedule ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white border border-border shadow transition-transform ${
                  showSchedule ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </div>
          </button>

          {showSchedule && (
            <div className="mt-3 flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Date</label>
                <input
                  type="date"
                  className="w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none transition-colors"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={today}
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Time</label>
                <input
                  type="time"
                  className="w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none transition-colors"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  min={scheduledDate === today ? currentTime : "00:00"}
                />
              </div>
            </div>
          )}

          {!showSchedule && (
            <p className="mt-1.5 text-[10px] text-muted-foreground">Email will be sent right away</p>
          )}
        </div>

        {/* ── Send button ── */}
        <button
          onClick={handleSend}
          disabled={!canSend || isSending}
          className="btn-primary-pop w-full flex items-center justify-center gap-3 text-xl mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <>
              <Mail className="h-6 w-6 animate-pulse" />
              SENDING…
            </>
          ) : (
            <>
              <Send className="h-6 w-6" />
              {showSchedule && scheduledDate ? "SCHEDULE SEND" : "SEND NOW"} 🚀
            </>
          )}
        </button>

        {/* Summary */}
        {canSend && (
          <p className="text-center text-xs text-muted-foreground -mt-2 pb-4">
            {showSchedule && scheduledDate && scheduledTime
              ? `📅 Will be sent on ${new Date(scheduledDate + "T" + scheduledTime).toLocaleString()} to ${contacts.length} recipient${contacts.length > 1 ? "s" : ""}`
              : `📧 Sending to ${contacts.length} recipient${contacts.length > 1 ? "s" : ""} instantly`}
          </p>
        )}
      </div>
    </div>
  );
};

export default EmailScheduling;