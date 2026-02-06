import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders application correctly', () => {
  render(<App />);
  // Check that the app renders without crashing
  const header = screen.getByRole('heading', { level: 1 });
  expect(header).toBeInTheDocument();
});
