import React from 'react';
import {Formik, Form, Field} from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';

const loginSchema = Yup.object().shape({
    username: Yup.string()
    .required('Username is required'),
    password: Yup.string()
    .min(6, 'Password must be atleast 6 characters')
    .required('Password is required'),
});

const Login = () => {
    const {login} = useAuth();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center text-gray-900">
                Sign in to your account
            </h2>

            <Formik
                initialValues={{username: '', password: ''}}
                validationSchema={loginSchema}
                onSubmit={(values, {setSubmitting}) => {
                    login({username: values.username});
                    setSubmitting(false);
                }}
                >
                {({errors, touched, isSubmitting}) => (
                    <Form className="mt-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <Field
                    name="username"
                    type="text"
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Username"
                  />
                  {errors.username && touched.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>

                <div>
                  <Field
                    name="password"
                    type="password"
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Password"
                  />
                  {errors.password && touched.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Sign in
              </button>
            </Form>
                )}

            </Formik>

            </div>
        </div>
    );
};

export default Login;