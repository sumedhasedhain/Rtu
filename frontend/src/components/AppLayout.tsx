import { AppBar, Toolbar, Typography, Button, Box, Container } from "@mui/material";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const NAV_LINKS = [
  { to: "/", label: "Dashboard" },
  { to: "/calendar", label: "Calendar" },
  { to: "/log", label: "Log Entry" },
  { to: "/trends", label: "Trends" },
  { to: "/settings", label: "Settings" },
];

export function AppLayout() {
  const { logout } = useAuth();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 0, fontWeight: 700 }}>
            Cycle Tracker
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexGrow: 1 }}>
            {NAV_LINKS.map((link) => (
              <Button
                key={link.to}
                component={NavLink}
                to={link.to}
                end={link.to === "/"}
                sx={{
                  color: "white",
                  "&.active": { textDecoration: "underline", fontWeight: 700 },
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>
          <Button color="inherit" onClick={() => void logout()}>
            Log out
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
