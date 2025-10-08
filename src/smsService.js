// utils/smsService.js
export const sendOrderSMS = async (orderData) => {
  try {
    // Admin phone numbers - you can add multiple numbers separated by commas
    const adminNumbers = ['+919993758368','+917000041821']; // Replace with actual admin numbers
    
    const message = `🛍️ NEW ORDER ALERT!
Order ID: #${orderData.orderId}
Items: ${orderData.totalItems}
Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
Check dashboard for details.`;

    console.log('📱 Sending SMS to admins:', adminNumbers);
    
    // Send to all admin numbers
    const results = await Promise.all(
      adminNumbers.map(async (phoneNumber) => {
        return await sendViaTwilio(phoneNumber, message);
      })
    );

    const successfulSends = results.filter(result => result.success).length;
    console.log(`✅ SMS sent to ${successfulSends}/${adminNumbers.length} admins`);
    
    return successfulSends > 0;
  } catch (error) {
    console.error('❌ Error sending order SMS:', error);
    return false;
  }
};

const sendViaTwilio = async (phoneNumber, message) => {
  try {
    // Use Vite environment variables
    const accountSid = import.meta.env.VITE_TWILIO_SID;
    const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
    const fromNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER;

    // Validate environment variables
    if (!accountSid || !authToken || !fromNumber) {
      console.error('❌ Twilio environment variables missing');
      console.log('SID:', !!accountSid, 'Token:', !!authToken, 'Phone:', !!fromNumber);
      return { success: false, error: 'Twilio configuration missing' };
    }

    console.log(`📤 Sending SMS to: ${phoneNumber}`);
    
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(accountSid + ':' + authToken),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phoneNumber,
        From: fromNumber,
        Body: message
      })
    });

    const data = await response.json();
    
    if (data.error_code) {
      console.error('❌ Twilio error:', data.error_message);
      return { success: false, error: data.error_message };
    }
    
    console.log('✅ SMS sent successfully to:', phoneNumber);
    return { success: true, sid: data.sid };
    
  } catch (error) {
    console.error('❌ Twilio API error:', error);
    return { success: false, error: error.message };
  }
};