// // app/api/test-email/route.ts - TEST ENDPOINT
// import { NextResponse } from 'next/server';
// import { sendEmail } from '@/lib/email';

// export async function GET() {
//     try {
//         await sendEmail({
//             to: 'hafizadegbite@gmail.com',
//             subject: 'Test Email from Osogbo Foods',
//             html: '<h1>Test Email</h1><p>This is a test email from Osogbo Foods system.</p>'
//         });
        
//         return NextResponse.json({ success: true, message: 'Test email sent' });
//     } catch (error: any) {
//         return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//     }
// }


// app/api/test-email/route.ts - CREATE THIS FILE
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function GET() {
    try {
        console.log('📧 Testing email system...');
        
        const result = await sendEmail({
            to: 'hafizadegbite@gmail.com', // Your admin email
            subject: '✅ Osogbo Foods - Email Test',
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #10b981;">Email Test Successful!</h2>
                <p>Your Osogbo Foods email system is working correctly.</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>System:</strong> Order Notification System</p>
            </div>
            `
        });

        return NextResponse.json({
            success: true,
            message: 'Test email sent successfully!',
            data: result
        });

    } catch (error: any) {
        console.error('❌ Email test failed:', error);
        return NextResponse.json({
            success: false,
            message: 'Email test failed',
            error: error.message
        }, { status: 500 });
    }
}