import { useState } from "react";
import { Calendar, Clock, Mail, Plus, X, Users, Send } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

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
  const [subject, setSubject] = useState("Check out our PUFFSNAP photo strip! 📸");
  const [message, setMessage] = useState("Hey! We had an amazing time at the photobooth and wanted to share this cool photo strip with you! Hope you love it as much as we do! 😊");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  const addContact = () => {
    if (newContactName.trim() && newContactEmail.trim() && isValidEmail(newContactEmail)) {
      const newContact: EmailContact = {
        id: Date.now().toString(),
        name: newContactName.trim(),
        email: newContactEmail.trim(),
      };
      setContacts([...contacts, newContact]);
      setNewContactName("");
      setNewContactEmail("");
    }
  };

  const removeContact = (id: string) => {
    setContacts(contacts.filter(contact => contact.id !== id));
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleScheduleEmail = async () => {
    if (contacts.length === 0 || !scheduledDate || !scheduledTime) {
      alert("Please add at least one contact and set a date/time!");
      return;
    }

    setIsScheduling(true);
    
    const emailData: EmailScheduleData = {
      contacts,
      subject,
      message,
      scheduledDate,
      scheduledTime,
    };

    try {
      await onScheduleEmail(emailData);
    } catch (error) {
      console.error("Error scheduling email:", error);
      alert("Failed to schedule email. Please try again.");
    } finally {
      setIsScheduling(false);
    }
  };

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().slice(0, 5);

  return (
    <div className="min-h-screen px-4 py-8 halftone">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="comic-button flex items-center gap-2 bg-muted px-4 py-2 text-muted-foreground"
          >
            <X className="h-5 w-5" />
            CANCEL
          </button>
          <h2 className="font-display text-2xl text-foreground">📧 SCHEDULE EMAIL SHARING</h2>
          <button
            onClick={handleScheduleEmail}
            disabled={isScheduling || contacts.length === 0 || !scheduledDate || !scheduledTime}
            className="btn-primary-pop flex items-center gap-2 disabled:opacity-50"
          >
            {isScheduling ? (
              <>SCHEDULING...</>
            ) : (
              <>
                <Send className="h-5 w-5" />
                SCHEDULE
              </>
            )}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📸 Your Photo Strip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <img 
                  src={stripImage} 
                  alt="Photo Strip" 
                  className="max-w-full h-auto border-4 border-primary/20 rounded-lg shadow-lg"
                  style={{ maxHeight: "400px" }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recipients ({contacts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Name"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addContact()}
                  />
                  <div className="flex gap-1">
                    <Input
                      placeholder="email@gmail.com"
                      value={newContactEmail}
                      onChange={(e) => setNewContactEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addContact()}
                      type="email"
                    />
                    <Button onClick={addContact} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <div className="font-medium text-sm">{contact.name}</div>
                        <div className="text-xs text-muted-foreground">{contact.email}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContact(contact.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {contacts.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-4">
                    No recipients added yet. Add some contacts above!
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Your message to accompany the photo strip"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Schedule Delivery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Date
                    </label>
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={today}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Time
                    </label>
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      min={scheduledDate === today ? currentTime : "00:00"}
                    />
                  </div>
                </div>

                {scheduledDate && scheduledTime && (
                  <div className="bg-accent/10 p-3 rounded border border-accent/20">
                    <div className="text-sm">
                      <strong>Scheduled for:</strong> {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Your photo strip will be sent to {contacts.length} recipient{contacts.length !== 1 ? 's' : ''} at this time.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailScheduling;