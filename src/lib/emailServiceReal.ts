// emailServiceReal.ts — EmailJS via REST API (clean rewrite)
// Using REST instead of SDK so delivery always goes to {{to_email}}

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || "service_yymun2b";
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_yvrf84o";
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || "G_jnv4A__NXXMfzII";

export interface EmailContact {
  name: string;
  email: string;
}

export interface StripEmailData {
  recipients: EmailContact[];
  message: string;
  imageUrl: string;
  qrCode?: string;
  photoMode?: string;
  frameStyle?: string;
  hashtag?: string;
  scheduledFor?: Date | null;
}

async function restSend(
  toName: string,
  toEmail: string,
  extra: Record<string, string>
): Promise<void> {
  
  // Validate required configuration
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    throw new Error("❌ EmailJS config missing: SERVICE_ID, TEMPLATE_ID, or PUBLIC_KEY not set in .env.local");
  }

  const payload = {
    service_id:  SERVICE_ID,
    template_id: TEMPLATE_ID,
    user_id:     PUBLIC_KEY,
    template_params: {
      to_name:   toName || "Friend",
      to_email:  toEmail,
      from_name: "PUFFSNAP Photobooth",
      reply_to:  "noreply@puffsnap.app",
      ...extra,
    },
  };

  console.log("📧 EmailJS REST payload →", { 
    service_id: SERVICE_ID, 
    template_id: TEMPLATE_ID, 
    to_email: toEmail,
    user_id: PUBLIC_KEY.substring(0, 6) + "..." 
  });

  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("❌ EmailJS error:", res.status, txt);
      
      // Provide more specific error messages
      if (res.status === 400) {
        throw new Error(`Bad Request: Check your EmailJS template settings or variables. Details: ${txt}`);
      } else if (res.status === 401) {
        throw new Error(`Unauthorized: Check your EmailJS Public Key (User ID) in .env.local`);
      } else if (res.status === 404) {
        throw new Error(`Not Found: Check your Service ID or Template ID in .env.local`);
      }
      
      throw new Error(`EmailJS ${res.status}: ${txt}`);
    }

    console.log("✅ Email delivered to", toEmail);
  } catch (fetchError) {
    console.error("❌ Network/fetch error:", fetchError);
    throw new Error(`Network error sending email: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
  }
}

export async function sendStripEmail(data: StripEmailData): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  usedMailto: boolean;
}> {
  let sent = 0;
  let failed = 0;

  const shared: Record<string, string> = {
    subject:         "🎞 Your PUFFSNAP Photo Strip is here!",
    message:         data.message || "Enjoy your photo strip! 📸",
    image_url:       data.imageUrl,
    qr_code:         data.qrCode || data.imageUrl,
    photo_mode:      data.photoMode  || "strip",
    frame_style:     data.frameStyle || "classic",
    hashtag:         data.hashtag    || "#PUFFSNAP",
    date:            new Date().toLocaleDateString(),
    attachment_note: "Tap the button below to download your photo strip!",
    download_link:   `<a href="${data.imageUrl}" target="_blank" style="color:#7c3aed;font-weight:bold">Download Photo Strip</a>`,
  };

  for (const contact of data.recipients) {
    try {
      await restSend(contact.name, contact.email, shared);
      sent++;
    } catch (err) {
      console.error("Failed to send to", contact.email, err);
      failed++;
    }
  }

  return { success: sent > 0, sent, failed, usedMailto: false };
}

/** Admin diagnostic — send a test email to verify delivery */
export async function sendTestEmail(toEmail: string): Promise<void> {
  await restSend("Test Recipient", toEmail, {
    subject:         "🧪 PUFFSNAP Email Delivery Test",
    message:         "🎉 If YOU received this (not the admin), email delivery is working!",
    image_url:       "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    qr_code:         "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    photo_mode:      "test",
    frame_style:     "test",
    hashtag:         "#PUFFSNAP",
    date:            new Date().toLocaleDateString(),
    attachment_note: "This is a test — no real photo strip.",
    download_link:   "<a href='#' style='color:#7c3aed'>Test link</a>",
  });
}