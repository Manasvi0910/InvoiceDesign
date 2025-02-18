// src/pages/CreateInvoice.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import InvoiceForm from '../components/InvoiceForm';

const CreateInvoice = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6">
        <div className="md:flex md:items-center md:justify-between mb-6 px-4 sm:px-6 lg:px-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Create New Invoice
            </h2>
          </div>
        </div>
        <InvoiceForm />
      </div>
    </div>
  );
};

export default CreateInvoice;