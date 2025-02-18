import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const Navbar = () => {
    const {logout, user} = useAuth();
    const location = useLocation();

    return (
        <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-primary">Invoice Manager By Manasvi!</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className={`${
                  location.pathname === '/dashboard'
                    ? 'border-primary text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Dashboard
              </Link>
              <Link
                to="/create-invoice"
                className={`${
                  location.pathname === '/create-invoice'
                    ? 'border-primary text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Create Invoice
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-gray-600 mr-4">Welcome, {user?.username}</span>
            <button
              onClick={logout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
    );
};
export default Navbar;