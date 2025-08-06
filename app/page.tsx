"use client";

import { useCallback, useEffect, useState } from "react";
import EditorToolbar from "@/components/EditorToolbar";
import PdfPreviewPanel from "@/components/PdfPreviewPanel";
import PhotosPanel from "@/components/PhotosPanel";
import ReportTemplate from "@/components/ReportTemplate";
import TemplateSelector from "@/components/TemplateSelector";
import { loadTemplate } from "@/lib/templates";

export default function Home() {
	const [draggedImage, setDraggedImage] = useState<string | null>(null);
	const [htmlContent, setHtmlContent] = useState<string>("");
	const [templateHtml, setTemplateHtml] = useState<string>("");
	const [currentTemplate, setCurrentTemplate] = useState<string>("");

	// Load default template on mount
	useEffect(() => {
		const loadDefaultTemplate = async () => {
			try {
				const defaultTemplateHtml = await loadTemplate("painting-company");
				setTemplateHtml(defaultTemplateHtml);
				setCurrentTemplate("Painting Company");
			} catch (error) {
				console.error("Failed to load default template:", error);
			}
		};

		loadDefaultTemplate();
	}, []);

	const handleDragStart = (imageData: string) => {
		console.log("Setting dragged image in main page");
		setDraggedImage(imageData);
	};

	const handleDragEnd = () => {
		console.log("Clearing dragged image in main page");
		setDraggedImage(null);
	};

	const handleContentChange = useCallback((html: string) => {
		setHtmlContent(html);
	}, []);

	const handleTemplateSelect = (
		newTemplateHtml: string,
		templateName: string,
	) => {
		setTemplateHtml(newTemplateHtml);
		setCurrentTemplate(templateName);
		// Clear existing content when switching templates
		setHtmlContent("");
	};

	return (
		<div className="app-container">
			{/* Left Panel - Photos */}
			<PhotosPanel onDragStart={handleDragStart} onDragEnd={handleDragEnd} />

			{/* Middle Panel - Editor */}
			<div className="editor-panel">
				<div className="editor-header">
					<div className="flex items-center gap-3">
						<svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
							<path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"/>
							<path d="M6 8h8v1H6V8zm0 2h8v1H6v-1zm0 2h5v1H6v-1z"/>
						</svg>
						<div className="editor-title">Report Designer</div>
					</div>
					<TemplateSelector
						onTemplateSelect={handleTemplateSelect}
						currentTemplate={currentTemplate}
					/>
					<button type="button" className="close-btn">
						&times;
					</button>
				</div>

				<EditorToolbar />

				<div className="editor-content">
					<ReportTemplate
						draggedImage={draggedImage}
						onContentChange={handleContentChange}
						templateHtml={templateHtml}
					/>
				</div>
			</div>

			{/* Right Panel - PDF Preview */}
			<PdfPreviewPanel htmlContent={htmlContent} />
		</div>
	);
}
