// lib/email.ts - COMPLETE FIXED VERSION
import nodemailer from 'nodemailer';

// Configure transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER, //hafizadegbite@gmail.com
        pass: process.env.SMTP_PASSWORD //lvazrojlwpycxwdi
    }
});

// Base sendEmail function (THIS WAS MISSING)
export async function sendEmail(options: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    from?: string;
}) {
    try {
        const mailOptions = {
            from: options.from || process.env.SMTP_FROM || 'Osogbo Foods <hafizadegbite@gmail.com>',
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text || options.html.replace(/<[^>]*>/g, '')
        };
         console.log('📧 Attempting to send email to:', options.to);
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
     } catch (error: any) {
        console.error('❌ Email sending failed:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
}
  
   

// Your existing functions (they will now work)
export async function sendPaymentConfirmationEmail(
    email: string,
    orderNumber: string,
    customerName: string,
    amount: number,
    paymentMethod: string,
    transactionId: string
) {
    const subject = `Payment Confirmed - Order #${orderNumber}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .payment-details {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border: 2px solid #10b981;
            }
            .payment-success {
                color: #10b981;
                font-weight: bold;
            }
        </style>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 class="payment-success">✅ Payment Successful!</h2>
        <p>Hello ${customerName},</p>
        
        <div class="payment-details">
            <h3>Payment Information</h3>
            <p><strong>Order:</strong> #${orderNumber}</p>
            <p><strong>Amount:</strong> ₦${amount.toLocaleString()}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <p>Your order is now confirmed and being prepared.</p>
        <p>You will receive another email when your order is on the way.</p>
    </body>
    </html>
    `;

    return sendEmail({
        to: email,
        subject,
        html
    });
}
// Add this function to your email library:

export async function sendPaymentReceivedEmail(
    email: string,
    customerName: string,
    orderNumber: string,
    amount: number,
    paymentMethod: string
) {
    const subject = `✅ Payment Received - Order #${orderNumber}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #10b981;">Payment Confirmed! 🎉</h2>
        <p>Hello ${customerName},</p>
        
        <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #065f46;">Payment Details</h3>
            <p><strong>Order #:</strong> ${orderNumber}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">RECEIVED ✓</span></p>
            <p><strong>Amount:</strong> ₦${amount.toLocaleString()}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <p>Your order is now being prepared. We'll notify you when it's out for delivery.</p>
        <p>Thank you for your payment!</p>
    </body>
    </html>
    `;

    return sendEmail({
        to: email,
        subject,
        html
    });
}
export async function sendBankTransferInstructions(
    email: string,
    customerName: string,
    orderNumber: string,
    amount: number,
    bankDetails: {
        accountNumber: string;
        accountName: string;
        bankName: string;
    }
) {
    const subject = `Bank Transfer Instructions - Order #${orderNumber}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e40af;">🏦 Bank Transfer Instructions</h2>
        <p>Hello ${customerName},</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #3b82f6;">
            <h3 style="color: #1e40af;">Transfer Details for Order #${orderNumber}</h3>
            
            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <p><strong>Bank Name:</strong> ${bankDetails.bankName}</p>
                <p><strong>Account Number:</strong> ${bankDetails.accountNumber}</p>
                <p><strong>Account Name:</strong> ${bankDetails.accountName}</p>
                <p><strong>Amount to Transfer:</strong> ₦${amount.toLocaleString()}</p>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <h4 style="color: #92400e;">Important:</h4>
                <ul>
                    <li>Transfer the EXACT amount shown above</li>
                    <li>Use your order number (${orderNumber}) as payment reference</li>
                    <li>Send payment proof to payments@osogbofoods.com</li>
                    <li>Your order will be processed after payment confirmation</li>
                </ul>
            </div>
        </div>
        
        <p>Once payment is confirmed, you'll receive an order confirmation email.</p>
    </body>
    </html>
    `;

    return sendEmail({
        to: email,
        subject,
        html
    });
}

// Add this function to your lib/email.ts - AFTER sendBankTransferInstructions
export async function sendOrderConfirmation(
    email: string,
    orderNumber: string,
    customerName: string,
    restaurantName: string,
    amount: number,
    deliveryAddress: string
) {
    const subject = `✅ Order Confirmed - #${orderNumber}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #10b981;">Order Confirmed! 🎉</h2>
        <p>Hello ${customerName},</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #3b82f6;">
            <h3 style="color: #1e40af;">Order #${orderNumber}</h3>
            <p><strong>Restaurant:</strong> ${restaurantName}</p>
            <p><strong>Total Amount:</strong> ₦${amount.toLocaleString()}</p>
            <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
            <p><strong>Estimated Delivery:</strong> 30-45 minutes</p>
        </div>
        
        <p>Your order is now being prepared. We'll notify you when it's out for delivery.</p>
        <p>Thank you for ordering with Osogbo Foods!</p>
    </body>
    </html>
    `;

    return sendEmail({
        to: email,
        subject,
        html
    });
}