import * as Yup from 'yup';

export const invoiceSchema = Yup.object().shape({
    vendorDetails: Yup.object().shape({
        vendor: Yup.string().required('Vendor is required'),
        address: Yup.string().required('Address is required'),

    }),
    invoiceDetails: Yup.object().shape({
        purchaseOrderNumber: Yup.string().required('PO Number is required'),
        invoiceNumber: Yup.string().required('Invoice Number is required.'),
        invoiceDate: Yup.date().required('Invoice Date is required'),
        dueDate: Yup.date().required('Due date is required'),
        totalAmount: Yup.number()
        .positive('Amount must be positive')
        .required('Total Amount is required'),

        paymentTerms: Yup.string().required('Payment Terms are required!'),
        status: Yup.string(),

    }),
    expenseDetails: Yup.array().of(
        Yup.object().shape({
            lineAmount: Yup.number().required('Line Amount is Required'),
            department: Yup.string().required('Department is Required'),
            account: Yup.string().required('Account is Required'),
            location: Yup.string().required('Location is Required'),
            description: Yup.string(),

        })
    ),
    comments: Yup.string(),
});