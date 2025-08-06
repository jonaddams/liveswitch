"use client";

import { useState } from "react";
import { loadTemplate, type Template, templates } from "@/lib/templates";

interface TemplateSelectorProps {
	onTemplateSelect: (templateHtml: string, templateName: string) => void;
	currentTemplate?: string;
}

export default function TemplateSelector({
	onTemplateSelect,
	currentTemplate,
}: TemplateSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleTemplateSelect = async (template: Template) => {
		setIsLoading(true);
		try {
			const templateHtml = await loadTemplate(template.id);
			onTemplateSelect(templateHtml, template.name);
			setIsOpen(false);
		} catch (error) {
			console.error("Failed to load template:", error);
			alert("Failed to load template. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const getCurrentTemplateName = () => {
		if (!currentTemplate) return "Select Template";
		const template = templates.find((t) => t.name === currentTemplate);
		return template ? template.name : currentTemplate;
	};

	return (
		<div className="template-selector">
			<button
				type="button"
				className="template-selector-btn"
				onClick={() => setIsOpen(!isOpen)}
				disabled={isLoading}
			>
				<span className="template-selector-icon">📋</span>
				<span className="template-selector-text">
					{isLoading ? "Loading..." : getCurrentTemplateName()}
				</span>
				<span className="template-selector-arrow">{isOpen ? "▲" : "▼"}</span>
			</button>

			{isOpen && (
				<div className="template-dropdown">
					<div className="template-dropdown-header">
						<h3>Choose Template</h3>
						<button
							type="button"
							className="template-dropdown-close"
							onClick={() => setIsOpen(false)}
						>
							✕
						</button>
					</div>

					<div className="template-grid">
						{templates.map((template) => (
							<button
								key={template.id}
								type="button"
								className={`template-card ${currentTemplate === template.name ? "active" : ""}`}
								onClick={() => handleTemplateSelect(template)}
							>
								<div className="template-card-icon">{template.icon}</div>
								<div className="template-card-content">
									<h4 className="template-card-title">{template.name}</h4>
									<p className="template-card-description">
										{template.description}
									</p>
									<span className="template-card-category">
										{template.category}
									</span>
								</div>
							</button>
						))}
					</div>
				</div>
			)}

			{isOpen && (
				<button
					type="button"
					className="template-overlay"
					onClick={() => setIsOpen(false)}
					onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
					aria-label="Close template selector"
				></button>
			)}
		</div>
	);
}
