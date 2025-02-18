import React, { useState, useEffect, useRef } from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import { useNavigate } from 'react-router-dom';
import PdfViewer from './PdfViewer';
import ExpenseRow from './ExpenseRow';
import { invoiceSchema } from '../utils/validation';
import { dummyInvoiceData } from '../utils/dummyData';
import { Building2, FileText, MessageSquare, Trash } from 'lucide-react';

const departments = ['Sales', 'Marketing', 'Engineering', 'Finance', 'HR'];
const accounts = ['1001', '1002', '1003', '1004', '1005'];
const locations = ['HQ', 'Branch 1', 'Branch 2', 'Remote'];
const paymentTerms = ['Net 30', 'Net 60', 'Net 90', 'Due on Receipt'];

const FORM_STORAGE_KEY = 'draftInvoiceData';
const AUTOSAVE_INTERVAL = 1000; // 1 second


const InvoiceForm = () => {
  const navigate = useNavigate();
  const [pdfFile, setPdfFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [activeTab, setActiveTab] = useState('vendor');
  const [showVendorDetails, setShowVendorDetails] = useState(false);


  // Create refs to track form values and dirty state for autosave
  const formValuesRef = useRef(null);
  const formDirtyRef = useRef(false);

  const clearAllFormData = () => {
    localStorage.removeItem(FORM_STORAGE_KEY);
    localStorage.removeItem('pdfFile'); // Clear saved PDF
    setPdfFile(null);
    formValuesRef.current = null;
    formDirtyRef.current = false;
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveTab(sectionId);
  };
  
  // Autosave effect
  useEffect(() => {
    const autosaveTimer = setInterval(() => {
      if (formDirtyRef.current && formValuesRef.current) {
        localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formValuesRef.current));
        setLastSavedTime(new Date().toLocaleTimeString());
      }
    }, AUTOSAVE_INTERVAL);

    return () => clearInterval(autosaveTimer);
  }, []);

  useEffect(() => {
    return () => {
      // Clear PDF data when component unmounts
      localStorage.removeItem('pdfFile');
    };
  }, []);

  useEffect(() => {
    // Only redirect if no user and not on login page
    const user = localStorage.getItem('user');
    const isLoginPage = window.location.pathname === '/login';
    if (!user && !isLoginPage) {
      navigate('/login');
    }
  }, [navigate]);

  const getInitialValues = () => {
    try {
      const savedData = localStorage.getItem(FORM_STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Error loading saved form data:', error);
    }

    // Used dummy data as fallback for testing if needed
    

    return {
      vendorDetails: {
        vendor: '',
        address: '',
      },
      invoiceDetails: {
        purchaseOrderNumber: '',
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0], // Set today as default
        dueDate: '',
        totalAmount: '',
        paymentTerms: '',
        status: 'Draft',
      },
      expenseDetails: [
        {
          lineAmount: '',
          department: '',
          account: '',
          location: '',
          description: '',
        },
      ],
      comments: '',
    };
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    console.log('Form submitted with values:', values); // Debug log
    setIsSubmitting(true);
    try {
      const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      
      const newInvoice = {
        ...values,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      const updatedInvoices = [...existingInvoices, newInvoice];
      
      // Save completed invoice
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
      console.log('Invoice saved successfully!'); // Debug log
      
      // Clear draft data
      localStorage.removeItem(FORM_STORAGE_KEY);
      
      // Reset refs for autosave
      formValuesRef.current = null;
      formDirtyRef.current = false;

      clearAllFormData();

      resetForm();
      setPdfFile(null);
      
      // Navigate after a short delay to ensure localStorage operations complete
      setTimeout(() => navigate('/dashboard'), 100);
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('There was an error saving the invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const handlePdfUpload = (file) => {
    setPdfFile(file);
  };

  // Helper function to format date strings to YYYY-MM-DD format required by input[type="date"]
  const formatDate = (dateString) => {
    try {
      if (!dateString) return '';
      
      // Check if it's already in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // Handle MM/DD/YYYY format
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const month = parts[0].padStart(2, '0');
        const day = parts[1].padStart(2, '0');
        let year = parts[2];
        
        // Handle 2-digit years
        if (year.length === 2) {
          year = `20${year}`;  // Assuming 20xx for simplicity
        }
        
        return `${year}-${month}-${day}`;
      }
      
      // Fallback if parsing fails
      return '';
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const populateDummyData = (setValues) => {
    setValues(dummyInvoiceData);
    // Update refs for autosave
    formValuesRef.current = dummyInvoiceData;
    formDirtyRef.current = true;
  };

  // Debug function
  const logFormState = (values, isValid, dirty) => {
    console.log('Form values:', values);
    console.log('Form isValid:', isValid);
    console.log('Form isDirty:', dirty);
  };

  const handleCancel = () => {
    clearAllFormData();
    navigate('/dashboard');
  };

  const handleSaveLater = () => {
    // Save the form data in local storage or state
    localStorage.setItem('draftInvoice', JSON.stringify(formValuesRef.current));
  
    // Optionally, show a notification to the user
    alert('Invoice saved as a draft!');
  
    // Navigate to the dashboard or stay on the same page
    navigate('/dashboard');
  };
  

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="flex justify-end border-b border-gray-200 mb-8">
  <button
    onClick={() => scrollToSection('vendor')}
    className={`flex items-center px-6 py-3 border-b-2 ${
      activeTab === 'vendor'
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`}
  >
    <Building2 className="w-5 h-5 mr-2" />
    Vendor Details
  </button>
  <button
    onClick={() => scrollToSection('invoice')}
    className={`flex items-center px-6 py-3 border-b-2 ${
      activeTab === 'invoice'
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`}
  >
    <FileText className="w-5 h-5 mr-2" />
    Invoice Details
  </button>
  <button
    onClick={() => scrollToSection('comments')}
    className={`flex items-center px-6 py-3 border-b-2 ${
      activeTab === 'comments'
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`}
  >
    <MessageSquare className="w-5 h-5 mr-2" />
    Comments
  </button>
</div>
      <Formik
        initialValues={getInitialValues()}
        validationSchema={invoiceSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, setValues, isValid, dirty, setFieldValue }) => {
          // Store values and dirty state to use in autosave
          formValuesRef.current = values;
          formDirtyRef.current = dirty;

          // Define the handler for extracted data here, where setFieldValue is in scope
          const handleDataExtracted = (data) => {
            console.log('OCR Data received in form:', data);
            
            // Only update form if we have valid data
            if (data && Object.keys(data).length > 0) {
              // Use setFieldValue to update the form fields
              if (data.vendorDetails) {
                if (data.vendorDetails.vendor) 
                  setFieldValue('vendorDetails.vendor', data.vendorDetails.vendor);
                if (data.vendorDetails.address) 
                  setFieldValue('vendorDetails.address', data.vendorDetails.address);
              }
              
              if (data.invoiceDetails) {
                if (data.invoiceDetails.invoiceNumber) 
                  setFieldValue('invoiceDetails.invoiceNumber', data.invoiceDetails.invoiceNumber);
                if (data.invoiceDetails.totalAmount) 
                  setFieldValue('invoiceDetails.totalAmount', parseFloat(data.invoiceDetails.totalAmount) || '');
                if (data.invoiceDetails.invoiceDate) 
                  setFieldValue('invoiceDetails.invoiceDate', formatDate(data.invoiceDetails.invoiceDate));
              }
            }
          };

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-1">
                <PdfViewer
                  file={pdfFile}
                  onFileSelect={handlePdfUpload}
                  onDataExtracted={handleDataExtracted}
                />
              </div>

              <div className="md:col-span-1">
                <Form className="space-y-6">
                  {lastSavedTime && (
                    <div className="text-sm text-gray-500 text-right">
                      Last saved at {lastSavedTime}
                    </div>
                  )}

                  {/* For debugging */}
                  <button 
                    type="button" 
                    onClick={() => logFormState(values, isValid, dirty)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    
                  </button>

                  {/* Vendor Details Section */}
                  <div id="vendor" className="bg-white shadow rounded-lg p-6">
                  <button
                        type="button"
                        onClick={() => populateDummyData(setValues)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-secondary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        Populate with Dummy Data
                      </button>
                      <div className="flex items-center mb-4">
    <Building2 className="w-5 h-5 text-blue-500 mr-2" />
    <h3 className="text-lg font-medium text-gray-900">Vendor Details</h3>

  </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                    <p className="text-sm text-gray-900 font-bold">Vendor Information</p>

                      <div>
                      <label className="block text-sm font-medium text-gray-700">
  Vendor <span className="text-red-500">*</span>
</label>
                        <Field
                          name="vendorDetails.vendor"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        />
                        {errors.vendorDetails?.vendor && touched.vendorDetails?.vendor && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.vendorDetails.vendor}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Address
                        </label>
                        <Field
                          name="vendorDetails.address"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        />
                        {errors.vendorDetails?.address && touched.vendorDetails?.address && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.vendorDetails.address}
                          </p>
                        )}
                      {/* View Vendor Details dropdown */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setShowVendorDetails(!showVendorDetails)}
          className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
        >
          View Vendor Details
          <svg
            className={`ml-1 h-4 w-4 transform transition-transform ${
              showVendorDetails ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        
        {/* Dropdown content */}
        {showVendorDetails && (
          <div className="mt-2 p-4 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-2">About A-1 Exterminators</p>
              <p>This is a superpower high tech vendor trusted by 500+ companies.</p>
              <div className="mt-3">
                <p className="mb-1"><span className="font-medium">Industry:</span> Technology</p>
                <p className="mb-1"><span className="font-medium">Years Active:</span> 15+</p>
                <p className="mb-1"><span className="font-medium">Rating:</span> 4.8/5</p>
                <p><span className="font-medium">Certifications:</span> ISO 9001, ISO 27001</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    
  </div>
</div>

                  {/* Invoice Details Section */}
<div id="invoice" className="bg-white shadow rounded-lg p-6">
  {/* Main Heading */}
  <div className="flex items-center mb-4">
    <FileText className="w-5 h-5 text-blue-500 mr-2" />
    <h3 className="text-lg font-medium text-gray-900">Invoice Details</h3>
  </div>

  {/* General Information Subheading */}
  <h4 className="text-md font-semibold text-gray-700 mb-2">General Information</h4>

  {/* Purchase Order Number Field */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">Purchase Order Number</label>
    <Field
      name="invoiceDetails.purchaseOrderNumber"
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
      placeholder="Select PO Number"
    />
  </div>

  {/* Invoice Details Subheading */}
  <h4 className="text-md font-semibold text-gray-700 mt-4 mb-2">Invoice Details</h4>

  <div className="grid grid-cols-2 gap-4">
    {/* Invoice Number */}
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Invoice Number <span className="text-red-500">*</span>
      </label>
      <Field
        name="invoiceDetails.invoiceNumber"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        placeholder="Invoice number"
      />
    </div>

    {/* Invoice Date */}
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Invoice Date <span className="text-red-500">*</span>
      </label>
      <Field
        type="date"
        name="invoiceDetails.invoiceDate"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
      />
    </div>

    {/* Total Amount */}
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Total Amount <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
        <Field
          type="number"
          name="invoiceDetails.totalAmount"
          className="mt-1 pl-7 pr-12 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="0.00"
        />
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">USD</span>
      </div>
    </div>

    {/* Payment Terms */}
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Payment Terms <span className="text-red-500">*</span>
      </label>
      <Field
        as="select"
        name="invoiceDetails.paymentTerms"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
      >
        <option value="">Select Payment Terms</option>
        {paymentTerms.map((term) => (
          <option key={term} value={term}>
            {term}
          </option>
        ))}
      </Field>
    </div>

    {/* Invoice Due Date */}
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Invoice Due Date <span className="text-red-500">*</span>
      </label>
      <Field
        type="date"
        name="invoiceDetails.dueDate"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
      />
    </div>

    {/* GL Post Date */}
    <div>
      <label className="block text-sm font-medium text-gray-700">
        GL Post Date <span className="text-red-500">*</span>
      </label>
      <Field
        type="date"
        name="invoiceDetails.glPostDate"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
      />
    </div>

    {/* Invoice Description */}
    <div className="col-span-2">
      <label className="block text-sm font-medium text-gray-700">
        Invoice Description <span className="text-red-500">*</span>
      </label>
      <Field
        as="textarea"
        name="invoiceDetails.description"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        rows="3"
      />
    </div>
  </div>
</div>

                  {/* Expense Details Section */}
<div className="bg-white shadow rounded-lg p-6">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-medium text-gray-900">Expense Details</h3>
  </div>

  <FieldArray name="expenseDetails">
    {({ push, remove }) => (
      <div>
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 mb-2">
          <div className="col-span-2">
            <span className="text-sm font-medium text-gray-700">Amount</span>
          </div>
          <div className="col-span-2">
            <span className="text-sm font-medium text-gray-700">Department</span>
          </div>
          <div className="col-span-2">
            <span className="text-sm font-medium text-gray-700">Account</span>
          </div>
          <div className="col-span-2">
            <span className="text-sm font-medium text-gray-700">Location</span>
          </div>
        </div>

        {/* Expense Rows */}
        {values.expenseDetails.map((_, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 items-center mb-2">
            {/* Amount */}
            <div className="col-span-2">
              <Field
                name={`expenseDetails.${index}.lineAmount`}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="0.00"
              />
            </div>

            {/* Department */}
            <div className="col-span-2">
              <Field
                as="select"
                name={`expenseDetails.${index}.department`}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </Field>
            </div>

            {/* Account */}
            <div className="col-span-2">
              <Field
                as="select"
                name={`expenseDetails.${index}.account`}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                <option value="">Select Account</option>
                {accounts.map((account) => (
                  <option key={account} value={account}>
                    {account}
                  </option>
                ))}
              </Field>
            </div>

            {/* Location */}
            <div className="col-span-2">
              <Field
                as="select"
                name={`expenseDetails.${index}.location`}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                <option value="">Select Location</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </Field>
            </div>

            {/* Remove Button (Trash Icon) */}
            <div className="col-span-1 flex justify-center">
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash className="w-5 h-5" /> {/* Trash Icon */}
              </button>
            </div>

            {/* Description (Expanded at the end) */}
            <div className="col-span-9">
              <Field
                as="textarea"
                name={`expenseDetails.${index}.description`}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Description"
                rows="2"
              />
            </div>
          </div>
        ))}

        {/* Align button to right */}
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={() =>
              push({
                lineAmount: '',
                department: '',
                account: '',
                location: '',
                description: '',
              })
            }
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            + Add Another Expense
          </button>
        </div>
      </div>
    )}
  </FieldArray>
</div>




                  {/* Comments Section */}
                  <div id="comments" className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center mb-4">
    <MessageSquare className="w-5 h-5 text-blue-500 mr-2" />
    <h3 className="text-lg font-medium text-gray-900">Comments</h3>
  </div>
                    <Field
                      as="textarea"
                      name="comments"
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      placeholder="Add any additional comments here..."
                    />
                  </div>

                  {/* Form Actions */}
<div className="flex justify-end space-x-4">
  <button
    type="button"
    onClick={handleCancel}
    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
  >
    Cancel
  </button>
  <button
    type="button"
    onClick={handleSaveLater}
    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
  >
    Save Later
  </button>
  <button
    type="submit"
    disabled={isSubmitting}
    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
    onClick={() => {
      if (!isValid) {
        console.log('Form validation errors:', errors);
      }
    }}
  >
    {isSubmitting ? 'Saving...' : 'Save Invoice'}
  </button>
</div>

                </Form>
              </div>
            </div>
          );
        }}
      </Formik>
    </div>
  );
};

export default InvoiceForm;