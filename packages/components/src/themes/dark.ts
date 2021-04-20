import { css } from 'styled-components';

export default css`
  --background-main: #211a1d;
  --background-raised: #272023;
  --background-overlay: #2a2728;
  --background-hover: rgba(255, 255, 255, 0.1);
  --background-translucent: rgba(33, 26, 29, 0.7);
  --background-tab-bar-drop: linear-gradient(
    rgba(33, 26, 29, 0),
    rgba(33, 26, 29, 1)
  );
  --text-main: #ffffff;
  --text-secondary: #9e9e9e;
  --text-on-accent: #000000;
  --text-gain: #49c569;
  --text-loss: #f74b3c;
  --text-no-change: #775d68;
  --accent-main: #f100ff;
  --accent-hover: #f76fff;
  --ordinal-1: #5b6a87;
  --ordinal-2: #d6a59c;
  --ordinal-3: #a3b4d4;
  --ordinal-4: #bfd48e;
  --ordinal-5: #7c8761;

  --shadow-pressed: 0 0.1rem 0.5rem rgba(0, 0, 0, 0.15),
    0 0.2rem 0.2rem rgba(0, 0, 0, 0.2);
  --shadow-raised: 0 0.5rem 0.75rem rgba(0, 0, 0, 0.15),
    0 0.375rem 0.5rem rgba(0, 0, 0, 0.2);
  --shadow-overlay: 0 1rem 1.22rem rgba(0, 0, 0, 0.15),
    0 0.55rem 0.61rem rgba(0, 0, 0, 0.2);
`;
