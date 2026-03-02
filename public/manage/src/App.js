import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/admin';
import { ChakraProvider } from '@chakra-ui/react';
import initialTheme from './theme/theme';
import React, { useState, useEffect } from 'react';
import { publicRoutes } from 'routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

const clientId = "957303562690-obspr7p6ci10npk7eamm7taiqolcqajj.apps.googleusercontent.com";

export default function Main() {
  const [currentTheme, setCurrentTheme] = useState(initialTheme);

  useEffect(() => {
    // Create a style element to inject styles dynamically
    const style = document.createElement('style');
    style.innerHTML = `
      body::-webkit-scrollbar {
        display: none; /* Hide scrollbar in Webkit browsers (Chrome, Safari, Edge) */
      }
      
      body {
        overflow: auto; /* Allow scrolling */
        scrollbar-width: none; /* Hide scrollbar in Firefox */
        -ms-overflow-style: none; /* Hide scrollbar in IE */
      }
    `;

    // Append the style element to the head of the document
    document.head.appendChild(style);

    // Clean up the style element when the component is unmounted
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  

  return (
    <GoogleOAuthProvider
      clientId={clientId}
    >
      <React.Fragment>
        <ChakraProvider theme={currentTheme}>
          <ToastContainer />
          <Routes>
            {publicRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<route.component />}
              />
            ))}

            <Route
              path="admin/*"
              element={
                <AdminLayout theme={currentTheme} setTheme={setCurrentTheme} />
              }
            />

            <Route
              path="*"
              element={<Navigate to="/admin/default" replace />}
            />
          </Routes>
        </ChakraProvider>
      </React.Fragment>
    </GoogleOAuthProvider>
  );
}
