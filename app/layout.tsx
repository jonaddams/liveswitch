import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
	title: "Report Designer - LiveSwitch",
	description: "WYSIWYG report designer with PDF preview",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<Script
					src="https://cdn.cloud.pspdfkit.com/pspdfkit-web@1.4.1/nutrient-viewer.js"
					strategy="beforeInteractive"
				/>
			</head>
			<body>{children}</body>
		</html>
	);
}
