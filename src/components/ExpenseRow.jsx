import React from 'react';
import {Field} from 'formik';

const ExpenseRow = ({index, remove, departments, accounts, locations}) => {
    return (
        <div className="grid grid-cols-12 gap-4 mb-4">
          <div className="col-span-2">
            <Field
              name={`expenseDetails.${index}.lineAmount`}
              type="number"
              placeholder="Amount"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
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
          <div className="col-span-3">
            <Field
              name={`expenseDetails.${index}.description`}
              type="text"
              placeholder="Description"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-600 hover:text-red-800"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      );
};

export default ExpenseRow;