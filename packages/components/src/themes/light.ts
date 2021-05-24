import { css } from 'styled-components';

export default css`
  --background-main: #ffffff;
  --background-raised: #ffffff;
  --background-overlay: #ffffff;
  --background-hover: rgba(0, 0, 0, 0.05);
  --background-translucent: rgba(255, 255, 255, 0.6);
  --background-tab-bar-drop: linear-gradient(
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 1)
  );
  --text-main: #211a1d;
  --text-secondary: #918a8d;
  --text-on-accent: #ffffff;
  --text-gain: #49c569;
  --text-loss: #f74b3c;
  --text-no-change: #b3b3b3;
  --text-error: #f74b3c;
  --accent-main: #5218fa;
  --accent-hover: #774afb;
  --ordinal-1: #556480;
  --ordinal-2: #cf9f97;
  --ordinal-3: #9daecc;
  --ordinal-4: #b8cc89;
  --ordinal-5: #75805c;

  --shadow-pressed: 0 0.1rem 0.5rem rgba(0, 0, 0, 0.05),
    0 0.2rem 0.2rem rgba(0, 0, 0, 0.1);
  --shadow-raised: 0 0.2rem 0.75rem rgba(0, 0, 0, 0.05),
    0 0.375rem 0.5rem rgba(0, 0, 0, 0.1);
  --shadow-overlay: 0 0 0.5rem rgba(0, 0, 0, 0.05),
    0 1rem 1.22rem rgba(0, 0, 0, 0.05), 0 0.55rem 0.61rem rgba(0, 0, 0, 0.1);
`;
