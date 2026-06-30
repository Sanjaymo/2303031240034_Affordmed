import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { NotificationsPage } from "./pages/NotificationsPage";

const theme = createTheme({
  palette: {
    background: {
      default: "#f6f8fb",
    },
    primary: {
      main: "#2457c5",
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationsPage />
    </ThemeProvider>
  );
}
