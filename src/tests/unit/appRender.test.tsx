import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from '../../App';

describe('App Render Test', () => {
  it('renders App to string without crashing', () => {
    // Provide minimal window/localStorage mocks if needed
    const html = renderToString(<App />);
    expect(html).toBeDefined();
    console.log('App rendered successfully! HTML length:', html.length);
  });
});
