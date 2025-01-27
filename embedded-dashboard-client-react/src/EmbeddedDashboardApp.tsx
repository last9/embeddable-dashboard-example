import React, { useCallback, useEffect } from 'react';

declare global {
  interface Window {
    // Add EmbeddedDashboardApp
    EmbeddedDashboardApp?: {
      initialize: (options: {
        containerId: string;
        org: string;
        getToken: () => Promise<any>;
        onError: (error: any) => void;
      }) => void;
    };
  }
}

// Add required CSS dynamically
const addStyleLink = (href: string) => {
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
};

// Add required JS dynamically
const loadScript = (src: string, async = true) => {
  return new Promise((resolve, reject) => {
    if (!document.querySelector(`script[src="${src}"]`)) {
      const script = document.createElement('script');
      script.src = src;
      script.async = async;
      script.onload = resolve;
      script.onerror = reject;
      if (async) {
        document.body.appendChild(script);
      } else {
        document.head.appendChild(script);
      }
    }
  });
};

// Request data for fetching access token
const accessTokenReqData = {
  datasource_id: '',
  dashboard_id: '',
  variables: {},
};

const EmbeddedDashboardApp = () => {
  const loadEmbeddedDashboard = useCallback(async () => {
    addStyleLink(
      'https://cdn.last9.io/dashboard-assets/embedded/public/css/inter.css'
    );
    addStyleLink(
      'https://cdn.last9.io/dashboard-assets/embedded/public/css/commit.css'
    );
    addStyleLink('https://cdn.last9.io/dashboard-assets/embedded/style.css');
    addStyleLink(
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block'
    );

    await loadScript(
      'https://unpkg.com/react@18/umd/react.production.min.js',
      false
    );
    await loadScript(
      'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
      false
    );

    // Load the dashboard script dynamically
    loadScript(
      'https://cdn.last9.io/dashboard-assets/embedded/last9-embedded-dashboard.umd-v1.1.js'
    )
      .then(() => {
        console.log('Dashboard script loaded.');
        if (window.EmbeddedDashboardApp) {
          console.log('Initializing EmbeddedDashboardApp...');

          // Function to fetch access token
          const getToken = async () => {
            const apiUrl = 'http://localhost:8080/embed-token';
            const data = accessTokenReqData;
            const requestOptions = {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            };
            console.info('Fetching token from server...');
            const response = await fetch(apiUrl, requestOptions);
            if (!response.ok) {
              console.error('Error:', response.statusText);
              throw new Error('Error occurred while fetching access token.');
            }
            console.info('Token fetched successfully!');
            return response.json();
          };

          // Callback function to handle errors
          const onError = (error: any) => {
            console.error('Error occurred in Embedded Dashboard:', error);
          };

          // Initialize the dashboard
          try {
            window.EmbeddedDashboardApp.initialize({
              containerId: 'embedded-dashboard-container',
              org: 'last9',
              getToken,
              onError,
            });
          } catch (error) {
            console.error(
              'Error during EmbeddedDashboardApp initialization:',
              error
            );
          }
        } else {
          console.error('EmbeddedDashboardApp is not defined on window.');
        }
      })
      .catch((error) => {
        console.error('Failed to load the EmbeddedDashboard script.', error);
      });
  }, []);

  useEffect(() => {
    loadEmbeddedDashboard();

    return () => {
      // Cleanup the script and styles on unmount
      console.log('Cleaning up EmbeddedDashboard resources...');
      // document.body.removeChild(script);
    };
  }, [loadEmbeddedDashboard]);

  return (
    <div
      id="embedded-dashboard-container"
      style={{ height: '100vh', width: '100%' }}
    />
  );
};
export default EmbeddedDashboardApp;
