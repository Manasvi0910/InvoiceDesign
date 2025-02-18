import { createWorker } from 'tesseract.js';
import * as pdfjs from 'pdfjs-dist';

export class OCRService {
    constructor() {
        this.worker = null;
    }

    async initialize() {
        if (!this.worker) {
            this.worker = await createWorker('eng');
        }
    }

    async processPDF(file) {
        try {
            if (!file) {
                throw new Error('No file provided');
            }

            const pdfData = await this.convertPDFToImage(file);
            
            if (!this.worker) {
                await this.initialize();
            }

            const result = await this.worker.recognize(pdfData);
            console.log('Raw OCR text:', result.data.text); // Debug log
            
            if (!result.data.text) {
                throw new Error('No text extracted from PDF');
            }

            return this.parseExtractedText(result.data.text);

        } catch (error) {
            console.error('Error processing PDF:', error);
            throw error;
        } finally {
            if (this.worker) {
                try {
                    await this.worker.terminate();
                    this.worker = null;
                } catch (error) {
                    console.error('Error terminating worker:', error);
                }
            }
        }
    }

    async convertPDFToImage(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument(arrayBuffer).promise;
            const page = await pdf.getPage(1);

            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            return canvas.toDataURL();

        } catch (error) {
            console.error('Error converting PDF to image:', error);
            throw error;
        }
    }

    parseExtractedText(text) {
        // Clean up the text
        const cleanText = text
            .replace(/\s+/g, ' ')                    // Normalize whitespace
            .replace(/[^\w\s:./,-]/g, '')           // Remove special characters except those needed
            .replace(/\s*[:=]\s*/g, ': ')           // Normalize separators
            .trim();

        const patterns = {
            invoiceNumber: /invoicenumber:?\s*(\d+)/i,
            amount: /amount:?\s*(\d+)/i,
            date: /date:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
            address: /address:?\s*([a-zA-Z\s]+)(?=\s*(?:invoice|amount|date|$))/i,
            vendor: /vendor:?\s*([a-zA-Z\s]+)(?=\s*(?:invoice|amount|date|address|$))/i
        };

        // Extract each field and clean the results
        const extractedData = {
            vendorDetails: {
                vendor: this.cleanField(this.findMatch(cleanText, patterns.vendor)),
                address: this.cleanField(this.findMatch(cleanText, patterns.address))
            },
            invoiceDetails: {
                invoiceNumber: this.cleanField(this.findMatch(cleanText, patterns.invoiceNumber)),
                totalAmount: this.cleanField(this.findMatch(cleanText, patterns.amount)),
                invoiceDate: this.cleanField(this.findMatch(cleanText, patterns.date))
            }
        };

        console.log('Cleaned text:', cleanText);
        console.log('Extracted data:', extractedData);
        return extractedData;
    }

    findMatch(text, pattern) {
        const match = text.match(pattern);
        return match ? match[1] : '';
    }

    cleanField(value) {
        return value
            .replace(/[^\w\s./,-]/g, '')  // Remove special characters except those needed
            .replace(/\s+/g, ' ')         // Normalize whitespace
            .trim();
    }
}