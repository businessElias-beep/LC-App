import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { mailTransport } from '@/lib/mail';
import { ContractFormData } from '@/lib/schema';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const data: ContractFormData = await req.json();

    // 1. Load the base PDF template
    // In production on Vercel, this should be in /public or an S3 bucket
    const templatePath = path.join(process.cwd(), 'public', 'template.pdf');
    const existingPdfBytes = fs.readFileSync(templatePath);

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    // Helper to draw text at specific coordinates
    // Note: Coordinates in pdf-lib start from bottom-left (0,0)
    const drawText = (text: string, x: number, y: number, size: number = 12) => {
      firstPage.drawText(text, {
        x,
        y,
        size,
        color: rgb(0, 0, 0),
      });
    };

    /**
     * COORDINATE MAPPING (Based on Karina Tarsia.pdf analysis)
     * These coordinates are estimates and will be refined in the optimization loop
     */
    drawText(`${data.firstName} ${data.lastName}`, 150, 600, 12); // Customer Name
    drawText(data.email, 150, 580, 11); // Email
    drawText(data.amount, 300, 500, 12); // Investment Amount
    drawText(`${data.returnRate}%`, 300, 480, 12); // Return Rate
    drawText(data.term, 300, 460, 12); // Term
    drawText(data.endDate, 300, 440, 12); // End Date
    drawText(data.bonus, 300, 420, 12); // Bonus

    const pdfBytes = await pdfDoc.save();

    // 2. Send via SMTP
    await mailTransport.sendMail({
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

    return NextResponse.json({ success: true, message: 'Vertrag erfolgreich versendet!' });
  } catch (error: any) {
    console.error('Error generating contract:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
