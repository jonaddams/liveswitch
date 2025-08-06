"use client";

import { sampleImages } from "@/lib/sample-images";

interface PhotosPanelProps {
	onDragStart: (imageData: string) => void;
	onDragEnd: () => void;
}

export default function PhotosPanel({
	onDragStart,
	onDragEnd,
}: PhotosPanelProps) {
	const handleDragStart = (
		e: React.DragEvent<HTMLButtonElement>,
		imageData: string,
	) => {
		console.log("Drag started with image:", `${imageData.substring(0, 50)}...`);
		// Set drag data
		e.dataTransfer.setData("text/plain", imageData);
		e.dataTransfer.effectAllowed = "copy";
		onDragStart(imageData);
		e.currentTarget.style.opacity = "0.5";
	};

	const handleDragEnd = (e: React.DragEvent<HTMLButtonElement>) => {
		console.log(
			"Drag end event:",
			e.type,
			"dropEffect:",
			e.dataTransfer.dropEffect,
		);
		onDragEnd();
		e.currentTarget.style.opacity = "1";
	};

	return (
		<div className="photos-panel">
			<div className="photos-header">
				<div className="flex items-center gap-3">
					<svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
					</svg>
					<h2>Photos</h2>
				</div>
			</div>
			<div className="photos-grid">
				{sampleImages.map((imageData) => (
					<button
						key={imageData}
						type="button"
						className="photo-item"
						draggable
						style={{ backgroundImage: `url(${imageData})` }}
						onDragStart={(e) => handleDragStart(e, imageData)}
						onDragEnd={handleDragEnd}
					>
						<div
							className="photo-select-indicator"
							style={{ pointerEvents: "none" }}
						>
							○
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
