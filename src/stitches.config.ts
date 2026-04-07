import { createStitches } from '@stitches/react';

export const { styled, css } = createStitches({
  theme: {
    colors: {
      primary: '#10b981',
      secondary: '#047857',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: '#1f2937',
      border: '#d1fae5',
    },
    space: {
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      6: '24px',
      8: '32px',
      12: '48px',
      16: '64px',
    },
    sizes: {
      full: '100%',
      half: '50%',
    },
    radii: {
      1: '4px',
      2: '8px',
      round: '50%',
    },
    fontSizes: {
      1: '12px',
      2: '14px',
      3: '16px',
      4: '18px',
      5: '20px',
      6: '28px',
      7: '36px',
    },
  },
});
