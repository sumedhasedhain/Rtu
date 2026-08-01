import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { deleteAccount, downloadExport } from "../api/cycles";
import { useAuth } from "../auth/useAuth";

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState<"csv" | "pdf" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleExport(format: "csv" | "pdf") {
    setError(null);
    setIsExporting(format);
    try {
      await downloadExport(format);
    } catch {
      setError("Export failed. Please try again.");
    } finally {
      setIsExporting(null);
    }
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    try {
      await deleteAccount();
      await logout();
      navigate("/login");
    } catch {
      setError("Could not delete your account. Please try again.");
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Settings
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Account
        </Typography>
        <Typography color="text.secondary">{user?.email}</Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Export your data
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Download everything you've logged, in CSV or PDF format.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            disabled={isExporting !== null}
            onClick={() => void handleExport("csv")}
          >
            {isExporting === "csv" ? "Exporting..." : "Export CSV"}
          </Button>
          <Button
            variant="outlined"
            disabled={isExporting !== null}
            onClick={() => void handleExport("pdf")}
          >
            {isExporting === "pdf" ? "Exporting..." : "Export PDF"}
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, borderColor: "error.main" }} variant="outlined">
        <Typography variant="h6" gutterBottom color="error">
          Danger zone
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Permanently delete your account and every entry you've logged. This cannot be undone.
        </Typography>
        <Button variant="contained" color="error" onClick={() => setConfirmOpen(true)}>
          Delete my account
        </Button>
      </Paper>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete your account?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This permanently deletes your account and all logged periods, symptoms, and other
            data. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button color="error" onClick={() => void handleDeleteAccount()} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete permanently"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
