'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';

export function Providers({ children }) {
  // Stop the browser's own drag-and-drop of links and pictures (a see-through copy
  // following the cursor). globals.css does the same with -webkit-user-drag; this
  // covers Firefox, which ignores that property.
  useEffect(() => {
    const onDragStart = (e) => {
      if (e.target instanceof Element && e.target.closest('a, img, svg')) e.preventDefault();
    };
    document.addEventListener('dragstart', onDragStart);
    return () => document.removeEventListener('dragstart', onDragStart);
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
