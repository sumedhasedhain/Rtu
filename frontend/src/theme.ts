import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#9c27b0",
    },
    secondary: {
      main: "#ff6f91",
    },
    background: {
      default: "#faf7fb",
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export const PHASE_COLORS: Record<string, string> = {
  menstrual: "#e53973",
  follicular: "#7cb342",
  fertile: "#fbc02d",
  luteal: "#7e57c2",
  unknown: "#bdbdbd",
};
