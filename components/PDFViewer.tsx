"use client";

import { useEffect, useRef, useState } from "react";

// Import types from global definitions
type NutrientViewerInstance = {
	unload: () => Promise<void>;
};

interface PDFViewerProps {
	pdfUrl?: string;
	className?: string;
}

export default function PDFViewer({ pdfUrl, className = "" }: PDFViewerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const viewerInstanceRef = useRef<NutrientViewerInstance | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [containerKey, setContainerKey] = useState(0);

	useEffect(() => {
		if (!pdfUrl) return;

		let mounted = true;
		let currentInstance: NutrientViewerInstance | null = null;

		const loadPDF = async () => {
			if (!mounted) return;

			setIsLoading(true);
			setError(null);

			try {
				// Check if NutrientViewer is available
				if (!window.NutrientViewer) {
					throw new Error("Nutrient SDK not loaded");
				}

				// Clear previous viewer instance and force container recreation
				if (viewerInstanceRef.current) {
					try {
						await viewerInstanceRef.current.unload();
					} catch (e) {
						console.warn("Error unloading previous viewer:", e);
					}
					viewerInstanceRef.current = null;
					// Force container recreation by changing key
					setContainerKey((prev) => prev + 1);
					// Wait for React to recreate the DOM element
					await new Promise((resolve) => setTimeout(resolve, 100));
				}

				// Wait for container to be available and mounted
				if (!mounted || !containerRef.current) {
					return;
				}

				// Verify container is a valid DOM element
				if (!(containerRef.current instanceof HTMLElement)) {
					throw new Error("Container is not a valid DOM element");
				}

				const container = containerRef.current;

				// Wait for layout and check if container has dimensions
				await new Promise((resolve) => requestAnimationFrame(resolve));

				const containerRect = container.getBoundingClientRect();
				console.log("Container dimensions check:", {
					width: containerRect.width,
					height: containerRect.height,
					offsetWidth: container.offsetWidth,
					offsetHeight: container.offsetHeight,
					clientWidth: container.clientWidth,
					clientHeight: container.clientHeight,
				});

				if (containerRect.width === 0 || containerRect.height === 0) {
					console.warn("Container has no dimensions, waiting for layout...");

					// Wait for layout with multiple attempts
					for (let i = 0; i < 5; i++) {
						await new Promise((resolve) => setTimeout(resolve, 100));
						const newRect = container.getBoundingClientRect();
						if (newRect.width > 0 && newRect.height > 0) {
							console.log(
								`Container got dimensions after ${(i + 1) * 100}ms:`,
								newRect.width,
								"x",
								newRect.height,
							);
							break;
						}
						if (i === 4) {
							throw new Error(
								`Container still has no dimensions after waiting. Final size: ${newRect.width}x${newRect.height}`,
							);
						}
					}
				}

				// Basic container cleanup (should already be empty)
				if (container.children.length > 0 || container.childNodes.length > 0) {
					console.log("Container has content, clearing...");
					container.innerHTML = "";
				}

				// Double-check we're still mounted after DOM manipulation
				if (!mounted || !containerRef.current) {
					return;
				}

				console.log("Loading PDF with container:", containerRef.current);

				// Initialize new viewer
				const instance = await window.NutrientViewer.load({
					container: containerRef.current,
					document: pdfUrl,
					toolbarPlacement: window.NutrientViewer.ToolbarPlacement.TOP,
					theme: window.NutrientViewer.Theme.LIGHT,
					licenseKey: process.env.NEXT_PUBLIC_NUTRIENT_LICENSE_KEY || "",
				});

				if (mounted) {
					currentInstance = instance;
					viewerInstanceRef.current = instance;
				} else {
					// Component was unmounted during load, clean up
					instance.unload().catch(console.warn);
				}
			} catch (err) {
				if (mounted) {
					console.error("Error loading PDF:", err);
					setError(err instanceof Error ? err.message : "Failed to load PDF");
				}
			} finally {
				if (mounted) {
					setIsLoading(false);
				}
			}
		};

		// Start loading immediately
		loadPDF();

		// Cleanup on unmount or pdfUrl change
		return () => {
			mounted = false;
			if (currentInstance) {
				currentInstance.unload().catch((e: unknown) => {
					console.warn("Error during cleanup:", e);
				});
			}
			if (
				viewerInstanceRef.current &&
				viewerInstanceRef.current !== currentInstance
			) {
				viewerInstanceRef.current.unload().catch((e: unknown) => {
					console.warn("Error during cleanup:", e);
				});
			}
		};
	}, [pdfUrl]);

	return (
		<div
			className={`pdf-viewer-container ${className}`}
			style={{ width: "100%", height: "100%", minHeight: "400px" }}
		>
			{error && (
				<div className="pdf-viewer-error-overlay">
					<div className="error-content">
						<div className="error-icon">📄</div>
						<div className="error-message">
							<h4>Failed to load PDF</h4>
							<p>{error}</p>
						</div>
						<button
							type="button"
							className="error-retry-btn"
							onClick={() => {
								setError(null);
								if (containerRef.current) {
									containerRef.current.innerHTML = "";
								}
							}}
						>
							Retry
						</button>
					</div>
				</div>
			)}

			{isLoading && (
				<div className="pdf-viewer-loading-overlay">
					<div className="loading-content">
						<div className="loading-spinner"></div>
						<p>Loading PDF...</p>
					</div>
				</div>
			)}

			<div
				key={containerKey}
				ref={containerRef}
				className="pdf-viewer-nutrient"
				style={{
					width: "100%",
					height: "100%",
					minHeight: "400px",
					minWidth: "300px",
					position: "relative",
					display: "block",
				}}
			/>
		</div>
	);
}
