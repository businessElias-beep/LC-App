import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb } from 'pdf-lib';
import { createMailTransport } from '@/lib/mail';
import { ContractFormData } from '@/lib/schema';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  console.log('🚀 API Request received: Starting contract generation...');

  try {
    const data: ContractFormData = await req.json();
    console.log('📝 Data received for email:', data.email);

    const templatePath = path.join(process.cwd(), 'public', 'template.pdf');
    if (!fs.existsSync(templatePath)) {
      console.error('❌ ERROR: template.pdf not found at', templatePath);
      return NextResponse.json({ success: false, error: 'Template file missing' }, { status: 500 });
    }

    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    const drawText = (text: string, x: number, y: number, size: number = 12) => {
      firstPage.drawText(text, { x, y, size, color: rgb(0, 0, 0) });
    };

    drawText(`${data.firstName} ${data.lastName}`, 150, 600, 12);
    drawText(data.email, 150, 580, 11);
    drawText(data.amount, 300, 500, 12);
    drawText(`${data.returnRate}%`, 300, 480, 12);
    drawText(data.term, 300, 460, 12);
    drawText(data.endDate, 300, 440, 12);
    drawText(data.bonus, 300, 420, 12);

    const pdfBytes = await pdfDoc.save();
    console.log('📄 PDF generated successfully');

    // --- SMTP SECTION ---
    console.log('📧 Initializing SMTP Transport...');
    const transport = await createMailTransport();

    // Force a connection check before sending
    console.log('📡 Verifying SMTP connection to host...');
    await transport.verify();
    console.log('✅ SMTP Connection verified successfully!');

    const mailInfo = await transport.sendMail({
      from: process.env.SMTP_FROM || '"Investment Firma" <noreply@firm.de>',
      to: data.email,
      subject: `Ihr Investmentvertrag - ${data.firstName} ${data.lastName}`,
      text: `Sehr geehrte(r) ${data.firstName} ${data.lastName},\n\nanbei erhalten Sie Ihren Investmentvertrag.\n\nMit freundlichen Grüßen,\nIhr Investment-Team`,
      attachments: [
        {
          filename: `Vertrag_${data.lastName}.pdf`,
          content: Buffer.from(pdfBytes),
        },
      ],
    });

    console.log('✅ Email sent successfully! MessageID:', mailInfo.messageId);
    return NextResponse.json({ success: true, message: 'Vertrag erfolgreich versendet!' });

  } catch (error: any) {
    console.error('❌ CRITICAL ERROR:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
