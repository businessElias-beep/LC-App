import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { createMailTransport } from '@/lib/mail';
import { ContractFormData } from '@/lib/schema';

export async function POST(req: NextRequest) {
  console.log('🚀 API Request received...');

  try {
    const data: ContractFormData = await req.json();

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Times New Roman', serif; margin: 0; padding: 0; background: white; }
        .page { width: 210mm; min-height: 297mm; padding: 25mm; margin: auto; box-sizing: border-box; position: relative; line-height: 1.5; font-size: 12pt; color: #000; }
        .header { text-align: right; margin-bottom: 50px; }
        .title { text-align: center; font-size: 18pt; font-weight: bold; text-decoration: underline; margin-bottom: 30px; }
        .section { margin-bottom: 20px; }
        .field-row { display: flex; margin-bottom: 10px; }
        .label { font-weight: bold; width: 200px; }
        .value { border-bottom: 1px solid black; flex: 1; padding-left: 5px; }
        .footer { margin-top: 100px; display: flex; justify-content: space-between; }
        .sig-box { width: 200px; border-top: 1px solid black; text-align: center; padding-top: 5px; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header"><p>Datum: ${new Date().toLocaleDateString('de-DE')}</p></div>
        <div class="title">Investmentvertrag</div>
        <div class="section">
          <p>Zwischen</p>
          <div class="field-row"><span class="label">Name:</span><span class="value">${data.firstName} ${data.lastName}</span></div>
          <div class="field-row"><span class="label">E-Mail:</span><span class="value">${data.email}</span></div>
        </div>
        <div class="section">
          <p><strong>Vertragsdetails:</strong></p>
          <div class="field-row"><span class="label">Anlagesumme:</span><span class="value">${data.amount}</span></div>
          <div class="field-row"><span class="label">Rendite p.a.:</span><span class="value">${data.returnRate}%</span></div>
          <div class="field-row"><span class="label">Laufzeit:</span><span class="value">${data.term}</span></div>
          <div class="field-row"><span class="label">Laufzeitende:</span><span class="value">${data.endDate}</span></div>
          <div class="field-row"><span class="label">Willkommensbonus:</span><span class="value">${data.bonus}</span></div>
        </div>
        <div class="section" style="margin-top: 40px;">
          <p>Hiermit wird vereinbart, dass die oben genannten Summen gemäß den Richtlinien der Firma investiert werden. Der Anleger bestätigt die Richtigkeit der Angaben.</p>
        </div>
        <div class="footer">
          <div class="sig-box">Unterschrift Kunde</div>
          <div class="sig-box">Unterschrift Firma</div>
        </div>
      </div>
    </body>
    </html>
    `;

    const browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

    const pdfBytes = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    });

    await browser.close();

    const transport = await createMailTransport();
    await transport.sendMail({
      from: process.env.SMTP_FROM || '"Investment Firma" <noreply@firm.de>',
      to: data.email,
      subject: `Ihr Investmentvertrag - ${data.firstName} ${data.lastName}`,
      text: `Sehr geehrte(r) ${data.firstName} ${data.lastName},\n\nanbei erhalten Sie Ihren Investmentvertrag.`,
      attachments: [{ filename: `Vertrag_${data.lastName}.pdf`, content: Buffer.from(pdfBytes) }],
    });

    return NextResponse.json({ success: true, message: 'Vertrag erfolgreich versendet!' });

  } catch (error: any) {
    console.error('❌ HTML-PDF ERROR:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
