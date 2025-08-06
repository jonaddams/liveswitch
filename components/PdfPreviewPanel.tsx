"use client";

import { useState } from "react";
import PDFViewer from "@/components/PDFViewer";
import { convertHtmlToPdf } from "@/lib/pdf-actions";

interface PdfPreviewPanelProps {
	htmlContent: string;
}

export default function PdfPreviewPanel({ htmlContent }: PdfPreviewPanelProps) {
	const [isGenerating, setIsGenerating] = useState(false);
	const [pdfUrl, setPdfUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleGeneratePdf = async () => {
		if (!htmlContent.trim()) {
			setError("No content to convert");
			return;
		}

		setIsGenerating(true);
		setError(null);

		try {
			// Clean up HTML for PDF generation - convert editor elements to presentation elements
			const cleanHtmlForPdf = (html: string): string => {
				const parser = new DOMParser();
				const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");

				// Remove contenteditable attributes
				doc.querySelectorAll("[contenteditable]").forEach((element) => {
					element.removeAttribute("contenteditable");
				});

				// Track photo sections for page break logic
				const photoSections: Element[] = [];

				// Convert photo placeholders to clean images or remove empty ones
				doc.querySelectorAll(".photo-placeholder").forEach((placeholder) => {
					const imageContainer = placeholder.querySelector(".image-container");
					const image = placeholder.querySelector(".dropped-image");

					if (image && imageContainer) {
						// Replace placeholder with a clean div containing just the image
						const cleanDiv = doc.createElement("div");
						cleanDiv.className = "photo-section";

						const cleanImage = doc.createElement("img");
						cleanImage.src = image.getAttribute("src") || "";
						cleanImage.alt = "Project photo";
						cleanImage.style.cssText =
							"max-width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 6px;";

						cleanDiv.appendChild(cleanImage);
						placeholder.parentNode?.replaceChild(cleanDiv, placeholder);
						photoSections.push(cleanDiv);
					} else {
						// Remove empty placeholder
						placeholder.remove();
					}
				});

				// Remove resize handles
				doc
					.querySelectorAll(".resize-handle")
					.forEach((handle) => handle.remove());

				// Remove any editor-specific classes and attributes
				doc.querySelectorAll(".has-image").forEach((element) => {
					element.classList.remove("has-image");
				});

				doc.querySelectorAll(".drag-over").forEach((element) => {
					element.classList.remove("drag-over");
				});

				// Add page breaks for better PDF organization
				// Page 1: Content up to "Before Photos" heading
				// Page 2: Photo sections
				// Page 3: Remaining content after photos

				// Look for "Before Photos" heading to place page break before it
				const beforePhotosHeading = Array.from(doc.querySelectorAll("h3")).find(
					(h3) => h3.textContent?.trim() === "Before Photos",
				);

				if (beforePhotosHeading) {
					// Add page break before "Before Photos" heading
					const pageBreakBefore = doc.createElement("div");
					pageBreakBefore.style.cssText = "page-break-after: always;";
					beforePhotosHeading.parentNode?.insertBefore(
						pageBreakBefore,
						beforePhotosHeading,
					);
				}

				if (photoSections.length > 0) {
					// Add page break after the last photo section
					const lastPhotoSection = photoSections[photoSections.length - 1];
					const pageBreakAfter = doc.createElement("div");
					pageBreakAfter.style.cssText = "page-break-after: always;";

					// Insert after the last photo section
					if (lastPhotoSection.nextSibling) {
						lastPhotoSection.parentNode?.insertBefore(
							pageBreakAfter,
							lastPhotoSection.nextSibling,
						);
					} else {
						lastPhotoSection.parentNode?.appendChild(pageBreakAfter);
					}
				}

				return doc.body.innerHTML;
			};

			const cleanedHtml = cleanHtmlForPdf(htmlContent);

			// Create complete HTML document for conversion
			const completeHtml = `
<!DOCTYPE html>
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
            background: #f5f5f5;
            padding: 20px;
        }
        
        .report-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }
        
        .template-header {
            display: flex;
            align-items: center;
            margin-bottom: 30px;
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
            font-size: 16px;
            color: #333;
            margin-bottom: 10px;
        }
        
        .service-details p {
            color: #666;
            line-height: 1.5;
            margin-bottom: 8px;
        }
        
        .photo-section {
            margin: 30px 0;
        }
        
        .image-container {
            margin-bottom: 15px;
        }
        
        .dropped-image {
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            display: block;
        }
        
        .resize-handle {
            display: none;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .report-container {
                box-shadow: none;
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="report-container">
        ${cleanedHtml}
    </div>
</body>
</html>`;

			const result = await convertHtmlToPdf(completeHtml);

			if (result.success && result.pdfUrl) {
				setPdfUrl(result.pdfUrl);
				setError(null);
			} else {
				setError(result.error || "Failed to generate PDF");
				setPdfUrl(null);
			}
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "An unexpected error occurred",
			);
			setPdfUrl(null);
		} finally {
			setIsGenerating(false);
		}
	};

	const _handleDownloadHtml = () => {
		// Clean HTML for download as well
		const cleanHtmlForPdf = (html: string): string => {
			const parser = new DOMParser();
			const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");

			// Remove contenteditable attributes
			doc.querySelectorAll("[contenteditable]").forEach((element) => {
				element.removeAttribute("contenteditable");
			});

			// Track photo sections for page break logic
			const photoSections: Element[] = [];

			// Convert photo placeholders to clean images or remove empty ones
			doc.querySelectorAll(".photo-placeholder").forEach((placeholder) => {
				const imageContainer = placeholder.querySelector(".image-container");
				const image = placeholder.querySelector(".dropped-image");

				if (image && imageContainer) {
					// Replace placeholder with a clean div containing just the image
					const cleanDiv = doc.createElement("div");
					cleanDiv.className = "photo-section";

					const cleanImage = doc.createElement("img");
					cleanImage.src = image.getAttribute("src") || "";
					cleanImage.alt = "Project photo";
					cleanImage.style.cssText =
						"max-width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 6px;";

					cleanDiv.appendChild(cleanImage);
					placeholder.parentNode?.replaceChild(cleanDiv, placeholder);
					photoSections.push(cleanDiv);
				} else {
					// Remove empty placeholder
					placeholder.remove();
				}
			});

			// Remove resize handles
			doc
				.querySelectorAll(".resize-handle")
				.forEach((handle) => handle.remove());

			// Remove any editor-specific classes and attributes
			doc.querySelectorAll(".has-image").forEach((element) => {
				element.classList.remove("has-image");
			});

			doc.querySelectorAll(".drag-over").forEach((element) => {
				element.classList.remove("drag-over");
			});

			// Add page breaks for better PDF organization
			// Look for "Before Photos" heading to place page break before it
			const beforePhotosHeading = Array.from(doc.querySelectorAll("h3")).find(
				(h3) => h3.textContent?.trim() === "Before Photos",
			);

			if (beforePhotosHeading) {
				// Add page break before "Before Photos" heading
				const pageBreakBefore = doc.createElement("div");
				pageBreakBefore.style.cssText = "page-break-after: always;";
				beforePhotosHeading.parentNode?.insertBefore(
					pageBreakBefore,
					beforePhotosHeading,
				);
			}

			if (photoSections.length > 0) {
				// Add page break after the last photo section
				const lastPhotoSection = photoSections[photoSections.length - 1];
				const pageBreakAfter = doc.createElement("div");
				pageBreakAfter.style.cssText = "page-break-after: always;";

				// Insert after the last photo section
				if (lastPhotoSection.nextSibling) {
					lastPhotoSection.parentNode?.insertBefore(
						pageBreakAfter,
						lastPhotoSection.nextSibling,
					);
				} else {
					lastPhotoSection.parentNode?.appendChild(pageBreakAfter);
				}
			}

			return doc.body.innerHTML;
		};

		const cleanedHtml = cleanHtmlForPdf(htmlContent);

		const completeHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Report - ${new Date().toLocaleDateString()}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; padding: 20px; }
        .report-container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); border-radius: 8px; }
        .template-header { display: flex; align-items: center; margin-bottom: 30px; }
        .company-logo { width: 80px; height: 80px; background: linear-gradient(135deg, #ff6b35, #f7931e); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 20px; }
        .company-logo svg { width: 40px; height: 40px; fill: white; }
        .company-info h1 { font-size: 28px; color: #333; margin-bottom: 5px; }
        .company-tagline { color: #666; font-size: 14px; }
        .service-details { margin-bottom: 30px; }
        .service-details h3 { font-size: 16px; color: #333; margin-bottom: 10px; }
        .service-details p { color: #666; line-height: 1.5; margin-bottom: 8px; }
        .photo-section { margin: 20px 0; text-align: center; }
        .photo-section img { max-width: 100%; height: auto; border-radius: 6px; display: block; margin: 0 auto; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid #ddd; }
        .photo-placeholder, .image-container, .resize-handle, .has-image, .drag-over { display: none !important; }
        @media print { body { background: white; padding: 0; } .report-container { box-shadow: none; padding: 20px; } }
    </style>
</head>
<body>
    <div class="report-container">
        ${cleanedHtml}
    </div>
</body>
</html>`;

		const blob = new Blob([completeHtml], { type: "text/html" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `report-${new Date().toISOString().split("T")[0]}.html`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	return (
		<div className="preview-panel">
			<div className="preview-header">
				<div className="preview-title">PDF Preview</div>
			</div>

			<div className="preview-controls">
				<button
					type="button"
					className={`generate-pdf-btn ${isGenerating ? 'generating' : ''}`}
					onClick={handleGeneratePdf}
					disabled={isGenerating || !htmlContent.trim()}
				>
					{isGenerating ? "Generating" : "Generate PDF"}
				</button>

				<a
					href="https://signing-demo-baseline-one.vercel.app/"
					target="_blank"
					rel="noopener noreferrer"
					className="send-signatures-btn"
				>
					Send for Signatures
				</a>
			</div>

			<div className="preview-content">
				{error && <div className="error-message">{error}</div>}

				<PDFViewer
					pdfUrl={pdfUrl || undefined}
					className="preview-pdf-viewer"
				/>

				{isGenerating && (
					<div className="pdf-generating-overlay">
						<div className="generating-content">
							<div className="loading-spinner"></div>
							<div>Generating PDF...</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
