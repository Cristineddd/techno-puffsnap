# 🚀 EmailJS Setup Guide for PUFFSNAP

## ✨ What You Get:
- **Real email sending** to any Gmail/email address
- **200 FREE emails per month**
- **Photo strip attachments** 
- **Professional email templates**
- **15 minutes setup time**

---

## 📋 Quick Setup Steps:

### 1. **Create EmailJS Account**
- Go to [emailjs.com](https://emailjs.com)
- Click "Sign Up" 
- Choose **FREE plan** (200 emails/month)

### 2. **Add Email Service**
- Dashboard → "Email Services" → "Add New Service"
- Choose **Gmail** (easiest) or Outlook
- Connect your email account
- Copy the **Service ID** (e.g., `service_abc123`)

### 3. **Create Email Template**
- Dashboard → "Email Templates" → "Create New Template"
- **Template Name**: `PUFFSNAP Photo Strip`
- **Template Content**:

```html
Subject: {{subject}}

Hi {{to_name}},

{{message}}

📸 Photo Details:
- Mode: {{photo_mode}}
- Frame: {{frame_style}}  
- Custom Message: {{custom_message}}
- Hashtag: {{hashtag}}

🎉 Your PUFFSNAP photo strip is attached!

---
Sent from PUFFSNAP Photobooth
```

- Copy the **Template ID** (e.g., `template_xyz789`)

### 4. **Get User ID**
- Dashboard → "Account" → Copy **User ID** (e.g., `user_def456`)

### 5. **Add to Your App**
- Create file: `.env.local` in your project root
- Add your credentials:

```bash
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_USER_ID=user_def456
```

### 6. **Restart & Test**
```bash
npm run dev
```
- Take photos → Add custom message → Schedule email
- **Real emails will be sent!** 🎉

---

## 📧 Email Template Variables:

Your EmailJS template can use these variables from PUFFSNAP:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{to_email}}` | Recipient email | john@gmail.com |
| `{{to_name}}` | Recipient name | John Doe |
| `{{subject}}` | Email subject | Check out our photo strip! |
| `{{message}}` | Custom message | Had amazing time at the party! |
| `{{custom_message}}` | Strip message | Happy Birthday Sarah! |
| `{{hashtag}}` | Photo hashtag | #PUFFSNAP |
| `{{photo_mode}}` | Strip layout | 3-shot strip |
| `{{frame_style}}` | Frame type | purple |
| `{{strip_image}}` | Photo strip | (base64 image) |
| `{{from_name}}` | Sender name | PUFFSNAP Photobooth |

---

## 🎯 Advanced Template (HTML):

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .strip-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📸 PUFFSNAP Photo Strip</h1>
    </div>
    
    <div class="content">
        <h2>Hey {{to_name}}! 👋</h2>
        
        <p>{{message}}</p>
        
        <div class="strip-info">
            <h3>📋 Photo Strip Details:</h3>
            <ul>
                <li><strong>Layout:</strong> {{photo_mode}}</li>
                <li><strong>Frame Style:</strong> {{frame_style}}</li>
                <li><strong>Custom Message:</strong> "{{custom_message}}"</li>
                <li><strong>Hashtag:</strong> {{hashtag}}</li>
            </ul>
        </div>
        
        <p>🎉 Your photo strip is ready! Check the attachment or view it below:</p>
        
        <!-- Photo strip will be embedded here -->
        <img src="{{strip_image}}" alt="PUFFSNAP Photo Strip" style="max-width: 100%; border: 3px solid #ff6b6b; border-radius: 10px;">
    </div>
    
    <div class="footer">
        <p>📧 Sent from {{from_name}}</p>
        <p>Made with ❤️ by PUFFSNAP Photobooth</p>
    </div>
</body>
</html>
```

---

## 🔧 Testing Your Setup:

1. **Add test contact**: your-email@gmail.com
2. **Schedule for now**: Today's date + current time  
3. **Click "Schedule"**
4. **Check your inbox** (and spam folder)
5. **Look for**: Photo strip attachment or embedded image

---

## 📊 EmailJS Free Plan Limits:

- ✅ **200 emails/month** 
- ✅ **Unlimited templates**
- ✅ **All email services** (Gmail, Outlook, etc.)
- ✅ **No setup fees**
- ⚠️ **EmailJS branding** in emails
- ⚠️ **No scheduling** (sends immediately)

**Upgrade to paid plan** for:
- More emails (up to 100K/month)
- Remove EmailJS branding
- Priority support

---

## 🚨 Troubleshooting:

**"Email not configured" error:**
- Check your `.env.local` file exists
- Verify all 3 variables are set
- Restart your dev server

**"Service not found" error:**
- Double-check your Service ID
- Make sure Gmail service is connected

**"Template not found" error:**
- Verify your Template ID  
- Check template is published (not draft)

**Emails going to spam:**
- Use your own Gmail address as sender
- Add professional subject lines
- Recipients should whitelist your email

---

## 🎉 You're All Set!

Once configured, your PUFFSNAP app will send **real emails** with photo strips to any email address! 

**Perfect for:**
- Birthday parties 🎂
- Weddings 💒  
- Corporate events 🏢
- Graduations 🎓
- Any celebration! 🎉