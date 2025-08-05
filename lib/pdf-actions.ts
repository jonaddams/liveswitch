'use server'

export interface ConvertToPdfResponse {
  success: boolean;
  pdfUrl?: string;
  error?: string;
}

export async function convertHtmlToPdf(htmlContent: string): Promise<ConvertToPdfResponse> {
  try {
    const BASE_URL = process.env.DOCUMENT_SDK_ENDPOINT || 'http://localhost:8585';
    const API_TOKEN = process.env.DOCUMENT_SDK_TOKEN || 'secret';
    
    console.log('Converting HTML to PDF via Nutrient Server...', {
      baseUrl: BASE_URL,
      hasToken: !!API_TOKEN
    });

    // Create complete HTML document with embedded CSS and images
    const completeHtml = createCompleteHtmlDocument(htmlContent);
    
    // Step 1: Create FormData and send HTML to generate document
    const formData = new FormData();
    
    // Add HTML content as a blob
    const htmlBlob = new Blob([completeHtml], { type: 'text/html' });
    formData.append('document.html', htmlBlob, 'document.html');
    
    // Add generation configuration
    const generation = {
      html: 'document.html',
      assets: []
    };
    formData.append('generation', JSON.stringify(generation));
    
    // Request document generation
    const generateResponse = await fetch(`${BASE_URL}/api/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Token token=${API_TOKEN}`,
      },
      body: formData
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      throw new Error(`Document generation failed: ${generateResponse.status} - ${errorText}`);
    }

    const generateResult = await generateResponse.json();
    console.log('Document generation response:', generateResult);

    if (!generateResult.data || !generateResult.data.document_id) {
      throw new Error('No document ID returned from generation');
    }

    const documentId = generateResult.data.document_id;
    console.log('Generated document ID:', documentId);

    // Step 2: Download the PDF
    const downloadResponse = await fetch(`${BASE_URL}/api/documents/${documentId}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Token token=${API_TOKEN}`,
      }
    });

    if (!downloadResponse.ok) {
      const errorText = await downloadResponse.text();
      throw new Error(`PDF download failed: ${downloadResponse.status} - ${errorText}`);
    }

    // Verify we got a PDF
    const contentType = downloadResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/pdf')) {
      throw new Error(`Expected PDF, got content-type: ${contentType}`);
    }

    // Convert response to base64 data URL for the PDF viewer
    const pdfBuffer = await downloadResponse.arrayBuffer();
    const pdfBytes = new Uint8Array(pdfBuffer);
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
    const pdfDataUrl = `data:application/pdf;base64,${pdfBase64}`;

    console.log('PDF generated successfully, size:', pdfBuffer.byteLength, 'bytes');

    return {
      success: true,
      pdfUrl: pdfDataUrl
    };
    
  } catch (error) {
    console.error('PDF conversion error:', error);
    
    // Check if it's a connection error (server not running)
    if (error instanceof Error && 'cause' in error && 
        (error as any).cause?.code === 'ECONNREFUSED') {
      console.log('Nutrient server not available, falling back to mock PDF...');
      
      try {
        // Fallback to mock PDF endpoint
        const mockResponse = await fetch('/api/mock-pdf');
        if (mockResponse.ok) {
          const mockPdfBuffer = await mockResponse.arrayBuffer();
          const mockPdfBytes = new Uint8Array(mockPdfBuffer);
          const mockPdfBase64 = Buffer.from(mockPdfBytes).toString('base64');
          const mockPdfDataUrl = `data:application/pdf;base64,${mockPdfBase64}`;
          
          return {
            success: true,
            pdfUrl: mockPdfDataUrl
          };
        }
      } catch (mockError) {
        console.error('Mock PDF fallback also failed:', mockError);
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to convert HTML to PDF'
    };
  }
}

function createCompleteHtmlDocument(bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Report - ${new Date().toLocaleDateString()}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .template-header {
            display: flex;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #eee;
        }
        
        .company-logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20px;
            flex-shrink: 0;
        }
        
        .company-logo svg {
            width: 40px;
            height: 40px;
            fill: white;
        }
        
        .company-info h1 {
            font-size: 28px;
            color: #333;
            margin-bottom: 5px;
        }
        
        .company-tagline {
            color: #666;
            font-size: 14px;
        }
        
        .service-details {
            margin-bottom: 30px;
        }
        
        .service-details h3 {
            font-size: 18px;
            color: #333;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
        }
        
        .service-details p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 10px;
        }
        
        .service-details ul {
            margin-left: 20px;
            margin-bottom: 15px;
        }
        
        .service-details li {
            color: #666;
            margin-bottom: 5px;
        }
        
        .photo-section {
            margin: 30px 0;
            page-break-inside: avoid;
        }
        
        .photo-section h3 {
            font-size: 16px;
            color: #333;
            margin-bottom: 15px;
        }
        
        .image-container {
            margin-bottom: 20px;
            text-align: center;
        }
        
        .dropped-image {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid #ddd;
        }
        
        .photo-placeholder {
            width: 100%;
            height: 200px;
            border: 2px dashed #ccc;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 16px;
            background-color: #fafafa;
        }
        
        /* Hide resize handles in PDF */
        .resize-handle {
            display: none !important;
        }
        
        @media print {
            body {
                padding: 20px;
            }
            
            .photo-section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    ${bodyContent}
</body>
</html>`;
}

export async function downloadPdf(pdfUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Implement actual PDF download logic
    // This might involve fetching the PDF and streaming it to the user
    console.log('Downloading PDF from:', pdfUrl);
    
    return { success: true };
  } catch (error) {
    console.error('PDF download error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to download PDF'
    };
  }
}