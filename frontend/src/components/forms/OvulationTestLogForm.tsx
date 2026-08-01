import { useState, type FormEvent } from "react";
import { Alert, Box, Button, MenuItem, Stack, TextField } from "@mui/material";
import { format } from "date-fns";
import { ovulationTestsApi } from "../../api/logs";
import type { OvulationTestResult } from "../../types/api";

const RESULT_OPTIONS: OvulationTestResult[] = ["negative", "positive", "peak"];

export function OvulationTestLogForm() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [result, setResult] = useState<OvulationTestResult>("negative");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("idle");
    try {
      await ovulationTestsApi.create({ date, result, notes: notes || null });
      setStatus("success");
      setNotes("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2} sx={{ maxWidth: 420 }}>
        {status === "success" && <Alert severity="success">Ovulation test logged.</Alert>}
        {status === "error" && <Alert severity="error">Could not save — check the date isn't already logged.</Alert>}
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          required
        />
        <TextField select label="Result" value={result} onChange={(e) => setResult(e.target.value as OvulationTestResult)}>
          {RESULT_OPTIONS.map((option) => (
            <MenuItem key={option} value={option} sx={{ textTransform: "capitalize" }}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Notes"
          multiline
          minRows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <Button type="submit" variant="contained">
          Save entry
        </Button>
      </Stack>
    </Box>
  );
}
