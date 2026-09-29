import { NextRequest, NextResponse } from 'next/server';
import { createMailTransport } from '@/lib/mail';
import { ContractSchema, ContractFormData } from '@/lib/schema';

export async function POST(req: NextRequest) {
  console.log('🚀 API Request received: HTML-to-PDF process starting...');

  try {
    const data = await req.json();
    console.log('📥 Received Body:', JSON.stringify(data));

    // Backend Validation: Ensure all required fields are present and valid
    const validation = ContractSchema.safeParse(data);
    if (!validation.success) {
      console.error('❌ Validation Error:', JSON.stringify(validation.error.format()));
      return NextResponse.json(
        { success: false, error: 'Ungültige Eingabedaten. Bitte prüfen Sie die Formularfelder.' },
        { status: 400 }
      );
    }

    const validatedData = validation.data;
    console.log('✅ Validated Data:', JSON.stringify(validatedData));

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <style>
        @page { size: A4; margin: 0; }
        body { margin: 0; padding: 0; background: white; }
        .page {
          width: 210mm;
          min-height: 297mm;
          padding: 20mm;
          box-sizing: border-box;
          position: relative;
          color: #000;
        }
        .sans { font-family: Arial, Helvetica, sans-serif; }
        .serif { font-family: 'Times New Roman', Times, serif; }

        .header { text-align: right; margin-bottom: 10px; }
        .logo-placeholder { font-weight: bold; font-size: 14pt; color: #ffcc00; }
        .divider { border: 0; border-top: 2px solid #000; margin: 10px 0 20px 0; }

        .title {
          text-align: center;
          font-size: 16pt;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 30px;
        }

        .section-title {
          font-size: 12pt;
          font-weight: bold;
          margin-top: 20px;
          margin-bottom: 10px;
          text-decoration: underline;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          table-layout: fixed;
        }
        .data-table td {
          padding: 8px 0;
          border-bottom: 1px solid #ccc;
          vertical-align: top;
          font-size: 10pt;
        }
        .label { font-weight: bold; width: 35%; color: #333; }
        .value { width: 65%; padding-left: 5px; }

        .investor-grid {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }
        .investor-col { width: 50%; }

        .legal-text {
          text-align: justify;
          font-size: 10pt;
          line-height: 1.4;
          margin-bottom: 20px;
        }

        .footer {
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
          font-size: 10pt;
        }
        .sig-box {
          width: 200px;
          border-top: 1px solid black;
          text-align: center;
          padding-top: 5px;
        }
        .page-break { page-break-after: always; }

        .agb-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 9pt;
        }
        .agb-table td {
          width: 50%;
          padding: 10px;
          border: 1px solid #eee;
          vertical-align: top;
          text-align: justify;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header sans">
          <div class="logo-placeholder">COMMERZBANK</div>
        </div>
        <hr class="divider">

        <div class="title sans">KONTOERÖFFNUNGSANTRAG FÜR EIN FESTGELDKONTO</div>

        <div class="section-title sans">Anlegerdaten</div>
        <div class="investor-grid sans">
          <div class="investor-col">
            <strong>Anleger/-in I</strong>
            <table class="data-table">
              <tr><td class="label">Vor- und Nachname:</td><td class="value">${validatedData.firstName} ${validatedData.lastName}</td></tr>
              <tr><td class="label">E-Mail:</td><td class="value">${validatedData.email}</td></tr>
              <tr><td class="label">Geburtsdatum:</td><td class="value">____________________</td></tr>
              <tr><td class="label">Geburtsort:</td><td class="value">____________________</td></tr>
              <tr><td class="label">Adresse:</td><td class="value">____________________</td></tr>
              <tr><td class="label">Staatsangehörigkeit:</td><td class="value">____________________</td></tr>
            </table>
          </div>
          <div class="investor-col">
            <strong>Anleger/-in II</strong>
            <table class="data-table">
              <tr><td class="label">Vor- und Nachname:</td><td class="value">____________________</td></tr>
              <tr><td class="label">E-Mail:</td><td class="value">____________________</td></tr>
              <tr><td class="label">Geburtsdatum:</td><td class="value">____________________</td></tr>
              <tr><td class="label">Geburtsort:</td><td class="value">____________________</td></tr>
              <tr><td class="label">Adresse:</td><td class="value">____________________</td></tr>
              <tr><td class="label">Staatsangehörigkeit:</td><td class="value">____________________</td></tr>
            </table>
          </div>
        </div>

        <div class="section-title sans">Vertragsdetails</div>
        <table class="data-table sans">
          <tr><td class="label">Anlagebetrag:</td><td class="value">${validatedData.amount} €</td></tr>
          <tr><td class="label">Zinssatz p.a.:</td><td class="value">${validatedData.returnRate}%</td></tr>
          <tr><td class="label">Laufzeit:</td><td class="value">${validatedData.term}</td></tr>
          <tr><td class="label">Willkommensbonus:</td><td class="value">${validatedData.bonus}</td></tr>
        </table>

        <div class="section-title sans">Referenzkonto</div>
        <table class="data-table sans">
          <tr><td class="label">Kontoinhaber:</td><td class="value">____________________</td></tr>
          <tr><td class="label">Bank Name:</td><td class="value">____________________</td></tr>
          <tr><td class="label">IBAN:</td><td class="value">____________________</td></tr>
          <tr><td class="label">BIC/Swift:</td><td class="value">____________________</td></tr>
        </table>

        <div class="legal-text serif">
          <p>Hiermit beantrage ich/wir die Eröffnung eines Festgeldkontos zu den oben genannten Konditionen. Ich bestätige die Richtigkeit der Angaben und erkläre mich mit den beigefügten Allgemeinen Geschäftsbedingungen einverstanden.</p>
          <p>Der Anleger bestätigt, dass die investierten Mittel aus legalen Quellen stammen und in Übereinstimmung mit den geltenden Geldwäschebestimmungen investiert werden.</p>
        </div>

        <div class="footer sans">
          <div>
            <p>Ort und Datum: <strong>${new Date().toLocaleDateString('de-DE')}</strong></p>
            <p>Laufzeitende: <strong>${validatedData.endDate}</strong></p>
          </div>
          <div class="sig-box">Unterschrift Anleger</div>
        </div>
      </div>

      <div class="page-break"></div>

      <div class="page">
        <div class="title sans">ALLGEMEINE GESCHÄFTSBEDINGUNGEN</div>

        <table class="agb-table serif">
          <tr>
            <td>
              <strong>§1 Vertragsschluss</strong><br>
              Der Vertrag kommt durch die Unterzeichnung des Antrags und die Annahme durch die Bank zustande. Die Bank behält sich das Recht vor, den Antrag abzulehnen.
              <br><br>
              <strong>§2 Wesentliche Merkmale</strong><br>
              Das Festgeldkonto ist ein verzinsliches Konto mit einer fest vereinbarten Laufzeit. Eine vorzeitige Verfügung über das Guthaben ist in der Regel nicht möglich.
            </td>
            <td>
              <strong>§3 Zinsen und Abrechnung</strong><br>
              Die Verzinsung erfolgt gemäß dem im Antrag angegebenen Zinssatz p.a. Die Zinsen werden am Ende der Laufzeit gutgeschrieben.
              <br><br>
              <strong>§4 Kündigung</strong><br>
              Eine ordentliche Kündigung vor Ablauf der Laufzeit ist ausgeschlossen, außer in gesetzlich vorgesehenen Ausnahmefällen.
            </td>
          </tr>
          <tr>
            <td>
              <strong>§5 Datenschutz</strong><br>
              Die Verarbeitung personenbezogener Daten erfolgt gemäß der DSGVO und den bankinternen Datenschutzrichtlinien zum Zweck der Vertragsabwicklung.
            </td>
            <td>
              <strong>§6 Schlussbestimmungen</strong><br>
              Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform. Es gilt das Recht der Bundesrepublik Deutschland.
            </td>
          </tr>
        </table>

        <div class="legal-text serif" style="margin-top: 30px;">
          <p>Diese Geschäftsbedingungen sind integraler Bestandteil des Investmentvertrages. Bitte bewahren Sie dieses Dokument sorgfältig auf.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    console.log('🌐 Requesting PDF from PDFShift...');
    const pdfResponse = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`:${process.env.PDFSHIFT_API_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: htmlContent,
      }),
    });

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text();
      console.error('❌ PDFShift API Error:', errorText);
      throw new Error(`PDF Generation failed: ${errorText}`);
    }

    const pdfBytes = await pdfResponse.arrayBuffer();
    console.log('📄 PDF received from API');

    const transport = await createMailTransport();

    const fromRaw = process.env.SMTP_FROM || 'contracts@lindenconcept.com';
    const fromEmail = fromRaw.includes('<')
      ? fromRaw.match(/<(.*?)>/)?.[1] || fromRaw
      : fromRaw;

    await transport.sendMail({
      from: fromRaw,
      to: validatedData.email,
      subject: `Ihr Investmentvertrag - ${validatedData.firstName} ${validatedData.lastName}`,
      text: `Sehr geehrte(r) ${validatedData.firstName} ${validatedData.lastName},\n\nanbei erhalten Sie Ihren Investmentvertrag.`,
      attachments: [{ filename: `Vertrag_${validatedData.lastName}.pdf`, content: Buffer.from(pdfBytes) }],
    });

    return NextResponse.json({ success: true, message: 'Vertrag erfolgreich erstellt und versendet!' });

  } catch (error: any) {
    console.error('❌ FINAL ERROR:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
