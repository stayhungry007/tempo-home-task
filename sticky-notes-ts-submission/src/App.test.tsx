import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app sidebar header', () => {
  render(<App />);
  const header = screen.getByText(/sticky notes/i);
  expect(header).toBeInTheDocument();
});
