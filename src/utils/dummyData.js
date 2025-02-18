export const dummyInvoiceData = {
    vendorDetails: {
      vendor: 'A-1 Entertainment',
      address: '550 Main St, Lynn',
    },
    invoiceDetails: {
      purchaseOrderNumber: 'PO-2024-001',
      invoiceNumber: 'INV-2024-001',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalAmount: 5000.00,
      paymentTerms: 'Net 30',
      status: 'Draft',
    },
    expenseDetails: [{
      lineAmount: 5000.00,
      department: 'Sales',
      account: '1001',
      location: 'HQ',
      description: 'Marketing Services',
    }],
    comments: 'Please process this invoice as per the agreed terms.',
  };