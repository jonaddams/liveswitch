#!/usr/bin/env node

require("dotenv").config();
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

// Get configuration from environment variables
const API_TOKEN = process.env.API_TOKEN;
const BASE_URL = process.env.BASE_URL || "http://localhost:8585";

// Parse command line arguments
const htmlFile = process.argv[2];
const outputFile = process.argv[3] || "output.pdf";
const assetFiles = process.argv.slice(4);

if (!htmlFile) {
	console.error("Error: HTML file not specified");
	console.log(
		"Usage: node html.js <html-file> [output-file] [asset1] [asset2] ...",
	);
	process.exit(1);
}

async function convertHtmlToPdf(
	htmlFilePath,
	outputFilePath,
	assetFilePaths = [],
) {
	try {
		// Make sure the input files exist
		if (!fs.existsSync(htmlFilePath)) {
			console.error(`Error: HTML file ${htmlFilePath} does not exist`);
			process.exit(1);
		}

		for (const assetPath of assetFilePaths) {
			if (!fs.existsSync(assetPath)) {
				console.error(`Error: Asset file ${assetPath} does not exist`);
				process.exit(1);
			}
		}

		console.log(`Converting ${htmlFilePath} to PDF...`);
		console.log(`Using API URL: ${BASE_URL}/api/documents`);

		// Create form data
		const form = new FormData();

		// Add the HTML file
		const htmlFileName = path.basename(htmlFilePath);
		form.append(htmlFileName, fs.createReadStream(htmlFilePath));
		console.log(`Added HTML file: ${htmlFileName}`);

		// Add asset files
		const assetFileNames = [];
		for (const assetPath of assetFilePaths) {
			const assetFileName = path.basename(assetPath);
			form.append(assetFileName, fs.createReadStream(assetPath));
			assetFileNames.push(assetFileName);
			console.log(`Added asset: ${assetFileName}`);
		}

		// Add the generation JSON
		const generation = {
			html: htmlFileName,
			assets: assetFileNames,
		};

		form.append("generation", JSON.stringify(generation));
		console.log("Generation payload:", JSON.stringify(generation));

		// Step 1: Request document generation
		console.log("Sending request to generate document...");
		const response = await axios.post(`${BASE_URL}/api/documents`, form, {
			headers: {
				...form.getHeaders(),
				Authorization: `Token token=${API_TOKEN}`,
			},
		});

		console.log(`Response status: ${response.status}`);

		// Parse the response to get document ID
		const responseData = response.data;
		console.log("Document generation response:", JSON.stringify(responseData));

		if (!responseData.data || !responseData.data.document_id) {
			console.error("Error: No document ID found in the response");
			console.error("Response:", JSON.stringify(responseData));
			process.exit(1);
		}

		const documentId = responseData.data.document_id;
		console.log(`Document ID: ${documentId}`);

		// Step 2: Download the PDF file
		console.log(`Downloading PDF for document ID: ${documentId}...`);
		const downloadResponse = await axios.get(
			`${BASE_URL}/api/documents/${documentId}/pdf`,
			{
				headers: {
					Authorization: `Token token=${API_TOKEN}`,
				},
				responseType: "arraybuffer",
			},
		);

		console.log(`Download response status: ${downloadResponse.status}`);

		// Verify the response is a PDF
		const pdfHeader = Buffer.from(downloadResponse.data.slice(0, 4)).toString();
		if (!pdfHeader.startsWith("%PDF")) {
			console.error("Error: Downloaded file does not appear to be a valid PDF");
			try {
				console.error(
					`Response (as text): ${Buffer.from(downloadResponse.data).toString()}`,
				);
			} catch (e) {
				console.error("Could not convert response to text");
			}
			process.exit(1);
		}

		// Save the downloaded PDF
		fs.writeFileSync(outputFilePath, downloadResponse.data);
		console.log(`Conversion complete! Output saved to ${outputFilePath}`);
		console.log(`Output file size: ${fs.statSync(outputFilePath).size} bytes`);
	} catch (error) {
		console.error("Error converting HTML to PDF:");
		if (error.response) {
			console.error(`Status: ${error.response.status}`);
			try {
				if (error.response.data instanceof Buffer) {
					console.error(
						`Response: ${Buffer.from(error.response.data).toString()}`,
					);
				} else {
					console.error(`Response: ${JSON.stringify(error.response.data)}`);
				}
			} catch (e) {
				console.error("Could not parse response data");
				if (error.response.data) {
					console.error(
						`Raw response data type: ${typeof error.response.data}`,
					);
					console.error(
						`Raw response data length: ${error.response.data.length} bytes`,
					);
				}
			}
		} else {
			console.error(error.message);
		}
		process.exit(1);
	}
}

// Run the conversion process
convertHtmlToPdf(htmlFile, outputFile, assetFiles);
