import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { OCRService } from '../utils/ocrService';
import Button from './Button';

// Update worker configuration
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;
const PdfViewer = ({ file, onFileSelect, onDataExtracted }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [localFile, setLocalFile] = useState(null);

  // Load saved PDF data on component mount
  useEffect(() => {
    try {
      const savedPdfData = localStorage.getItem('pdfFile');
      if (savedPdfData && isValidDataURL(savedPdfData)) {
        const blob = dataURLtoBlob(savedPdfData);
        const file = new File([blob], 'saved-pdf.pdf', { type: 'application/pdf' });
        setLocalFile(file);
        onFileSelect(file);
        processFile(file);
      }
    } catch (err) {
      console.error('Error loading saved PDF:', err);
      localStorage.removeItem('pdfFile'); // Clear invalid data
    }
  }, []);

  // Helper function to validate data URL
  const isValidDataURL = (dataURL) => {
    try {
      const regex = /^data:.*?;base64,/;
      if (!regex.test(dataURL)) return false;
      
      // Test if it can be decoded
      const base64 = dataURL.split(',')[1];
      atob(base64);
      return true;
    } catch {
      return false;
    }
  };

  // Helper function to convert data URL to Blob
  const dataURLtoBlob = (dataURL) => {
    try {
      const arr = dataURL.split(',');
      if (arr.length !== 2) throw new Error('Invalid data URL format');
      
      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch) throw new Error('Invalid MIME type');
      
      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      
      return new Blob([u8arr], { type: mime });
    } catch (err) {
      console.error('Error converting data URL to blob:', err);
      throw err;
    }
  };

  // Helper function to convert file to data URL
  const fileToDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  async function processFile(file) {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      // Save PDF to localStorage
      const dataURL = await fileToDataURL(file);
      if (dataURL && isValidDataURL(dataURL)) {
        localStorage.setItem('pdfFile', dataURL);
      }
      
      const ocrService = new OCRService();
      const extractedData = await ocrService.processPDF(file);
      onDataExtracted(extractedData);
      onFileSelect(file);
      setLocalFile(file);
    } catch (err) {
      setError('Error processing the PDF. Please try again.');
      console.error('PDF processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  }

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setError(null);
  }

  function onDocumentLoadError(error) {
    console.error('PDF load error:', error);
    setError('Error loading the PDF. Please ensure it\'s a valid PDF file.');
    // Clear invalid data from localStorage
    localStorage.removeItem('pdfFile');
  }

  const displayFile = localFile || file;

  // Update the return statement in your PdfViewer component
return (
  <div className="w-full h-full flex flex-col items-center bg-white rounded-lg">
    {!displayFile ? (
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 w-full flex flex-col items-center justify-center"
        onDrop={(e) => {
          e.preventDefault();
          const droppedFile = e.dataTransfer.files[0];
          if (droppedFile?.type === 'application/pdf') {
            processFile(droppedFile);
          }
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <h2 className="text-xl font-semibold mb-2">Upload Your Invoice</h2>
        <p className="text-gray-500 mb-6">To auto-populate fields and save time</p>
        
        {/* Blue circle with icon */}
        <div className="bg-blue-500 rounded-full p-8 mb-6">
          <svg
            className="w-16 h-16 text-white"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="flex flex-col items-center">
          <label
            htmlFor="file-upload"
            className="relative cursor-pointer bg-white border border-gray-300 rounded-md px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 focus-within:outline-none"
          >
            <span>Upload File</span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept="application/pdf"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  processFile(selectedFile);
                }
              }}
            />
          </label>
          <p className="text-sm text-gray-500 mt-2">Click to upload or Drag and drop</p>
        </div>
      </div>
    ) : (
      <div className="w-full">
        <Document
          file={displayFile}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          className="border rounded-lg overflow-hidden"
        >
          <Page
            pageNumber={pageNumber}
            width={window.innerWidth < 768 ? window.innerWidth - 32 : 500}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
        {numPages > 1 && (
          <div className="mt-4 flex justify-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
              disabled={pageNumber <= 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {pageNumber} of {numPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
              disabled={pageNumber >= numPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    )}

    {isProcessing && (
      <div className="mt-4 text-sm text-gray-600">
        Processing PDF... Please wait.
      </div>
    )}

    {error && (
      <div className="mt-4 text-sm text-red-600">
        {error}
      </div>
    )}
  </div>
);
};

export default PdfViewer;