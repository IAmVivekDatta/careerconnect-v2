import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRouter from './router';
import './styles/index.css';
import { ToastProvider } from './components/atoms/Toast';
import ThemeProvider from './providers/ThemeProvider';
import SocketProvider from './providers/SocketProvider';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <SocketProvider>
            <RouterProvider
              router={AppRouter}
              future={{ v7_startTransition: true }}
            />
          </SocketProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
