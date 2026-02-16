import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Log to console in development
        console.log('📧 TEST EMAIL GENERATED:');
        console.log('To:', 'hafizadegbite@gmail.com');
        console.log('Subject:', `Test: ${body.template === 'bankTransferInstructions' ? 'Bank Transfer Instructions' : 'Payment Confirmed'}`);
        console.log('Body:', body);

        // Send actual email in production
        if (process.env.NODE_ENV === 'production') {
            let html = '';
            if (body.template === 'bankTransferInstructions') {
                html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #10b981;">Bank Transfer Instructions</h2>
                    <p>Hello ${body.customerName},</p>
                    
                    <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #065f46;">Order #${body.orderNumber}</h3>
                        <p><strong>Total Amount:</strong> ₦${body.amount}</p>
                        <p><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">PENDING PAYMENT</span></p>
                    </div>
                    
                    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px dashed #1e40af;">
                        <h3 style="color: #1e40af;">📋 Bank Transfer Details</h3>
                        <p><strong>Bank Name:</strong> Wema Bank</p>
                        <p><strong>Account Name:</strong> OSOGBO FOODS DEMO</p>
                        <p><strong>Account Number:</strong> 0123456789</p>
                        <p><strong>Amount:</strong> ₦${body.amount}</p>
                        <p><strong>Reference:</strong> #${body.orderNumber}</p>
                    </div>
                    
                    <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0;">
                        <h4 style="color: #d97706;">Important Instructions:</h4>
                        <ol style="margin: 10px 0; padding-left: 20px;">
                            <li>Transfer the exact amount: ₦${body.amount}</li>
                            <li>Use #${body.orderNumber} as payment reference</li>
                            <li>Take a screenshot of your payment confirmation</li>
                            <li>Reply to this email with the screenshot</li>
                            <li>Your order will be prepared once payment is confirmed</li>
                        </ol>
                    </div>
                    
                    <p>Thank you for ordering with Osogbo Foods!</p>
                </div>
                `;
            } else {
                html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #10b981;">Payment Confirmed! 🎉</h2>
                    <p>Hello ${body.customerName},</p>
                    
                    <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #065f46;">Order #${body.orderNumber}</h3>
                        <p><strong>Payment Method:</strong> Bank Transfer</p>
                        <p><strong>Payment Status:</strong> <span style="color: #059669; font-weight: bold;">RECEIVED ✓</span></p>
                        <p><strong>Amount Paid:</strong> ₦${body.amount}</p>
                        <p><strong>Transaction Date:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Note:</strong> Your bank transfer has been confirmed</p>
                    </div>
                    
                    <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
                        <h4 style="color: #1e40af;">Order Details</h4>
                        <p><strong>Restaurant:</strong> ${body.restaurant}</p>
                        <p><strong>Estimated Delivery:</strong> ${body.deliveryTime}</p>
                        <p><strong>Delivery Address:</strong> ${body.address}</p>
                    </div>
                    
                    <p>Your order is now being prepared. You'll receive another notification when it's out for delivery.</p>
                    <p>Thank you for ordering with Osogbo Foods!</p>
                </div>
                `;
            }

            await sendEmail({
                to: 'hafizadegbite@gmail.com',
                subject: `Test: ${body.template === 'bankTransferInstructions' ? 'Bank Transfer Instructions' : 'Payment Confirmed'}`,
                html: html
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Test email generated successfully',
            data: body
        });

    } catch (error: any) {
        console.error('Error sending test email:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to send test email' },
            { status: 500 }
        );
    }
}