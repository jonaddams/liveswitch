/** @type {import('next').NextConfig} */
const nextConfig = {
	// Server actions are enabled by default in Next.js 15+
	webpack: (config, { isServer }) => {
		// Exclude @nutrient-sdk packages from the bundle since we're loading from CDN
		config.externals = config.externals || [];

		if (!isServer) {
			config.externals.push({
				"@nutrient-sdk/viewer": "window.NutrientViewer",
				"@nutrient-sdk/web": "window.NutrientViewer",
			});
		}

		return config;
	},
};

module.exports = nextConfig;
