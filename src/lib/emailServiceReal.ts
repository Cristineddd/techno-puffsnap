// EmailJS integration for PUFFSNAP
import emailjs from 'emailjs-com';

// Initialize EmailJS with user ID
const EMAILJS_USER_ID = import.meta.env.VITE_EMAILJS_USER_ID || 'G_jnv4A__NXXMfzII';
emailjs.init(EMAILJS_USER_ID);

export interface EmailScheduleData {
  contacts: Array<{ id: string; name: string; email: string }>;
  subject: string;
  message: string;
  scheduledDate: string;
  scheduledTime: string;
}

export interface StripEmailData {
  stripImage: string;
  stripData: {
    mode: number;
    frame: string;
    hashtag: string;
    customMessage: string;
  };
}

// EmailJS configuration - get these from emailjs.com
export const emailJSConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_puffsnap',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_puffsnap',
  userId: import.meta.env.VITE_EMAILJS_USER_ID || 'user_puffsnap',
};

/**
 * Real EmailJS service for sending photo strips via email
 */
export class EmailService {
  /**
   * Send email with photo strip using EmailJS
   */
  static async scheduleEmail(
    emailData: EmailScheduleData, 
    stripData: StripEmailData
  ): Promise<{ success: boolean; scheduledId?: string; error?: string }> {
    try {
      console.log('📧 Sending email with EmailJS...', { emailData, stripData });
      
      // Check if EmailJS is configured
      if (!emailJSConfig.serviceId || emailJSConfig.serviceId === 'service_puffsnap') {
        return {
          success: false,
          error: 'EmailJS not configured. Please add your EmailJS credentials to environment variables.'
        };
      }
      
      // Prepare template parameters for EmailJS (without large image data)
      const templateParams: any = {
        // Recipients - EmailJS will handle multiple emails
        to_email: emailData.contacts[0]?.email || '',
        to_name: emailData.contacts[0]?.name || '',
        recipient_list: emailData.contacts.map(c => `${c.name} (${c.email})`).join(', '),
        
        // Email content
        subject: emailData.subject,
        message: emailData.message,
        
        // Strip data 
        custom_message: stripData.stripData.customMessage || 'No custom message',
        hashtag: stripData.stripData.hashtag || '#PUFFSNAP',
        
        // Event details
        photo_mode: `${stripData.stripData.mode}-shot ${stripData.stripData.mode === 6 ? 'grid' : 'strip'}`,
        frame_style: stripData.stripData.frame || 'classic',
        
        // Scheduling info
        scheduled_for: `${emailData.scheduledDate} at ${emailData.scheduledTime}`,
        date: new Date().toLocaleDateString(),
        
        // Sender info
        from_name: 'PUFFSNAP Photobooth',
        reply_to: 'noreply@puffsnap.com',
        
        // Note: Image will be sent as attachment, not in template
        attachment_note: 'Your PUFFSNAP photo strip is attached to this email!'
      };

      console.log('📤 Sending to EmailJS...', {
        serviceId: emailJSConfig.serviceId,
        templateId: emailJSConfig.templateId,
        recipients: emailData.contacts.length,
        imageUrl: stripData.stripImage.includes('cloudinary') ? 'Cloudinary URL' : 'Base64 data'
      });

      // Use Cloudinary URL if available, otherwise create download link
      let imageUrl = stripData.stripImage;
      if (stripData.stripImage.startsWith('data:')) {
        // If it's base64, we'll include a note about downloading
        templateParams.download_note = 'Right-click and save the image from the email attachment area.';
        // For now, we'll use the base64 but truncated for the email
        imageUrl = 'Please check your email attachments for the full photo strip!';
      } else {
        // It's already a Cloudinary URL, perfect!
        templateParams.image_url = imageUrl;
        templateParams.download_link = `<a href="${imageUrl}" download="puffsnap-strip.png">Download your photo strip</a>`;
      }

      // Send email using EmailJS - simple method without attachments
      const response = await emailjs.send(
        emailJSConfig.serviceId,
        emailJSConfig.templateId,
        templateParams
      );
      
      console.log('✅ Email sent successfully:', response);
      
      return {
        success: true,
        scheduledId: `emailjs_${response.text}_${Date.now()}`
      };
      
    } catch (error) {
      console.error('❌ EmailJS error:', error);
      
      // Handle specific EmailJS errors with user-friendly messages
      let errorMessage = 'Failed to send email';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid service ID') || error.message.includes('service')) {
          errorMessage = 'EmailJS service not found. Please check your Service ID.';
        } else if (error.message.includes('template') || error.message.includes('Template')) {
          errorMessage = 'Email template not found. Please check your Template ID.';
        } else if (error.message.includes('user') || error.message.includes('User')) {
          errorMessage = 'EmailJS user unauthorized. Please check your User ID.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Send to multiple recipients (EmailJS limitation workaround)
   */
  static async sendToMultipleRecipients(
    emailData: EmailScheduleData, 
    stripData: StripEmailData
  ): Promise<{ success: boolean; results: any[]; error?: string }> {
    const results = [];
    let successCount = 0;
    
    for (const contact of emailData.contacts) {
      try {
        const singleEmailData = {
          ...emailData,
          contacts: [contact]
        };
        
        const result = await this.scheduleEmail(singleEmailData, stripData);
        results.push({ contact: contact.email, result });
        
        if (result.success) successCount++;
        
        // Small delay between sends to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        results.push({ 
          contact: contact.email, 
          result: { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          } 
        });
      }
    }
    
    return {
      success: successCount > 0,
      results,
      error: successCount === 0 ? 'Failed to send to any recipients' : undefined
    };
  }

  /**
   * Test EmailJS configuration
   */
  static async testConfiguration(): Promise<{ success: boolean; error?: string }> {
    try {
      const testParams = {
        to_email: 'test@example.com',
        to_name: 'Test User',
        subject: 'PUFFSNAP Email Test',
        message: 'This is a test email from PUFFSNAP photobooth!',
        from_name: 'PUFFSNAP Test',
        custom_message: 'Test message',
        hashtag: '#PUFFSNAP',
      };

      await emailjs.send(
        emailJSConfig.serviceId,
        emailJSConfig.templateId,
        testParams,
        emailJSConfig.userId
      );
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Configuration test failed'
      };
    }
  }
}