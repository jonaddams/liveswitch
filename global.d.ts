// Nutrient Viewer types for CDN-loaded SDK
interface NutrientViewerInstance {
	unload: () => Promise<void>;
}

interface NutrientViewerConfig {
	container: HTMLElement;
	document: string;
	toolbarPlacement?: string;
	theme?: string;
	licenseKey?: string;
}

interface NutrientViewerSDK {
	load: (config: NutrientViewerConfig) => Promise<NutrientViewerInstance>;
	ToolbarPlacement: {
		TOP: string;
		BOTTOM: string;
	};
	Theme: {
		LIGHT: string;
		DARK: string;
	};
}

declare global {
	interface Window {
		// Nutrient Web SDK will be available on window.NutrientViewer once loaded from CDN
		NutrientViewer?: NutrientViewerSDK;
	}
}

export {};
