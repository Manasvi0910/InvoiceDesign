import React from 'react';
import {Link} from 'react-router-dom';
import Navbar from '../components/Navbar';

const Dashboard = () => {
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');

    return (
        <div className = "min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
                <h2 className = "text-2xl font-bold text-gray-900">Invoices!</h2>
                <Link>
                    Create New Invoice
                </Link>
            </div>
                {invoices.length === 0 ? (
                    <div className="text-center py-12">
                    <p className = "text-gray-500 text-lg">No invoices found. Create your first invoice!!</p>
                    </div>
                ) : (
                   <div className="bg-white shadow overflow-hidden sm:rounded-md">
                   <ul className="divide-y divide-gray-200">
                    {invoices.map((invoice, index) => (
                        <li key = {index}>
                            <div className = "px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                    <p className="text-sm font-medium text-primary truncate">
                                        Invoice #{invoice.invoiceNumber}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {invoice.vendorDetails.vendor}
                                    </p>

                                    </div>
                                    <div className = "flex flex-col items-end">
                                    <p className="text-sm font-medium text-gray-900">
                                        ${invoice.totalAmount}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        {invoice.invoiceDate}
                                    </p>
                                    </div>

                                </div>
                            </div>
                        </li>
                    ))}
                   </ul>

                   </div> 
                )}
            </div>
        </div>

        </div>
    );
};

export default Dashboard;