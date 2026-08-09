import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { MotionConfig } from 'framer-motion';
import { Toaster } from 'sonner';
import App from './App';
import { store } from './store';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      {/* reducedMotion="user" makes every Framer Motion animation in the app
          automatically respect the OS "Reduce Motion" accessibility setting
          — no need to touch individual components. */}
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <App />
          <Toaster position="top-right" richColors closeButton />
        </BrowserRouter>
      </MotionConfig>
    </Provider>
  </React.StrictMode>
);
