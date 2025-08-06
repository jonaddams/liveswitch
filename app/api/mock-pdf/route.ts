import { type NextRequest, NextResponse } from "next/server";

// Mock PDF endpoint for POC demonstration
export async function GET(_request: NextRequest) {
	// For demo purposes, redirect to a sample PDF
	// In production, this would return the actual PDF from your SDK conversion

	// You can replace this with a local sample PDF or generate one
	const samplePdfUrl =
		"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

	try {
		// Proxy the sample PDF to avoid CORS issues
		const response = await fetch(samplePdfUrl);
		if (!response.ok) {
			throw new Error("Failed to fetch sample PDF");
		}

		const pdfBuffer = await response.arrayBuffer();

		return new NextResponse(pdfBuffer, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": 'inline; filename="report-preview.pdf"',
				"Cache-Control": "no-cache",
			},
		});
	} catch (_error) {
		// Fallback to a simple PDF if external fetch fails
		const mockPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 120
>>
stream
BT
/F1 18 Tf
100 700 Td
(Report Preview) Tj
0 -30 Td
/F1 12 Tf
(This is a mock PDF for testing.) Tj
0 -20 Td
(In production, your SDK will generate) Tj
0 -20 Td
(the actual report PDF here.) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000500 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
570
%%EOF`;

		return new NextResponse(mockPdfContent, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": 'inline; filename="mock-report.pdf"',
				"Cache-Control": "no-cache",
			},
		});
	}
}
