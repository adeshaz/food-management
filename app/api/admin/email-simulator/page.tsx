'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Mail, Send, Eye, Copy } from 'lucide-react';

const emailTemplates = {
    bankTransferInstructions: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #10b981;">Bank Transfer Instructions</h2>
    <p>Hello [Customer Name],</p>
    
    <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #065f46;">Order #[OrderNumber]</h3>
        <p><strong>Total Amount:</strong> ₦[Amount]</p>
        <p><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">PENDING PAYMENT</span></p>
    </div>
    
    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px dashed #1e40af;">
        <h3 style="color: #1e40af;">📋 Bank Transfer Details</h3>
        <p><strong>Bank Name:</strong> Wema Bank</p>
        <p><strong>Account Name:</strong> OSOGBO FOODS DEMO</p>
        <p><strong>Account Number:</strong> 0123456789</p>
        <p><strong>Amount:</strong> ₦[Amount]</p>
        <p><strong>Reference:</strong> #[OrderNumber]</p>
    </div>
    
    <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0;">
        <h4 style="color: #d97706;">Important Instructions:</h4>
        <ol style="margin: 10px 0; padding-left: 20px;">
            <li>Transfer the exact amount: ₦[Amount]</li>
            <li>Use #[OrderNumber] as payment reference</li>
            <li>Take a screenshot of your payment confirmation</li>
            <li>Reply to this email with the screenshot</li>
            <li>Your order will be prepared once payment is confirmed</li>
        </ol>
    </div>
    
    <p>Thank you for ordering with Osogbo Foods!</p>
    <p>Questions? Reply to this email or call +2349037272637</p>
</div>
    `,

    paymentConfirmed: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #10b981;">Payment Confirmed! 🎉</h2>
    <p>Hello [Customer Name],</p>
    
    <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #065f46;">Order #[OrderNumber]</h3>
        <p><strong>Payment Method:</strong> Bank Transfer</p>
        <p><strong>Payment Status:</strong> <span style="color: #059669; font-weight: bold;">RECEIVED ✓</span></p>
        <p><strong>Amount Paid:</strong> ₦[Amount]</p>
        <p><strong>Transaction Date:</strong> [Date]</p>
        <p><strong>Note:</strong> Your bank transfer has been confirmed</p>
    </div>
    
    <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
        <h4 style="color: #1e40af;">Order Details</h4>
        <p><strong>Restaurant:</strong> [Restaurant]</p>
        <p><strong>Estimated Delivery:</strong> [Time]</p>
        <p><strong>Delivery Address:</strong> [Address]</p>
    </div>
    
    <p>Your order is now being prepared. You'll receive another notification when it's out for delivery.</p>
    <p>Thank you for ordering with Osogbo Foods!</p>
</div>
    `
};

export default function EmailSimulatorPage() {
    const [template, setTemplate] = useState('bankTransferInstructions');
    const [customerName, setCustomerName] = useState('John Doe');
    const [orderNumber, setOrderNumber] = useState('ORD-268180');
    const [amount, setAmount] = useState('25,000');
    const [restaurant, setRestaurant] = useState('Taste of Osogbo');
    const [deliveryTime, setDeliveryTime] = useState('30-45 mins');
    const [address, setAddress] = useState('123 Main Street, Osogbo');

    const generateEmail = () => {
        let html = emailTemplates[template as keyof typeof emailTemplates];

        html = html
            .replace(/\[Customer Name\]/g, customerName)
            .replace(/\[OrderNumber\]/g, orderNumber)
            .replace(/\[Amount\]/g, amount)
            .replace(/\[Restaurant\]/g, restaurant)
            .replace(/\[Time\]/g, deliveryTime)
            .replace(/\[Address\]/g, address)
            .replace(/\[Date\]/g, new Date().toLocaleString());

        return html;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateEmail());
        toast.success('Email HTML copied to clipboard!');
    };

    const sendTestEmail = async () => {
        try {
            const response = await fetch('/api/admin/send-test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    template,
                    customerName,
                    orderNumber,
                    amount,
                    restaurant,
                    deliveryTime,
                    address
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Test email sent! Check your inbox.');
            } else {
                toast.error(data.message || 'Failed to send email');
            }
        } catch (error) {
            toast.error('Failed to send test email');
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Email Simulator</h1>
                <p className="text-gray-600">Test and preview order emails</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Controls */}
                <Card>
                    <CardHeader>
                        <CardTitle>Email Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Template</label>
                            <select
                                className="w-full border rounded-lg p-2"
                                value={template}
                                onChange={(e) => setTemplate(e.target.value)}
                            >
                                <option value="bankTransferInstructions">Bank Transfer Instructions</option>
                                <option value="paymentConfirmed">Payment Confirmed</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Customer Name</label>
                            <Input
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Customer Name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Order Number</label>
                            <Input
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                placeholder="Order Number"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Amount (₦)</label>
                            <Input
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="25,000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Restaurant</label>
                            <Input
                                value={restaurant}
                                onChange={(e) => setRestaurant(e.target.value)}
                                placeholder="Restaurant Name"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={sendTestEmail} className="flex-1">
                                <Send className="h-4 w-4 mr-2" />
                                Send Test Email
                            </Button>
                            <Button onClick={copyToClipboard} variant="outline">
                                <Copy className="h-4 w-4 mr-2" />
                                Copy HTML
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Preview */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Email Preview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg p-4 bg-gray-50 h-[500px] overflow-auto">
                            <div
                                className="bg-white p-4 rounded shadow-sm"
                                dangerouslySetInnerHTML={{ __html: generateEmail() }}
                            />
                        </div>

                        <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                            <h3 className="font-semibold text-amber-800 mb-2">📧 Email Testing</h3>
                            <p className="text-sm text-amber-700">
                                In development mode, emails are logged to console.
                                Check your browser console to see the email content.
                            </p>
                            <p className="text-xs text-amber-600 mt-2">
                                Actual emails are sent to: hafizadegbite@gmail.com
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}