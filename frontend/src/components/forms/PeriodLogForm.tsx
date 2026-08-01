import { useState, type FormEvent } from "react";
import { Alert, Box, Button, MenuItem, Stack, TextField } from "@mui/material";
import { format } from "date-fns";
import { periodsApi } from "../../api/logs";
import type { FlowIntensity } from "../../types/api";

const FLOW_OPTIONS: FlowIntensity[] = ["spotting", "light", "medium", "heavy"];

export function PeriodLogForm() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [flowIntensity, setFlowIntensity] = useState<FlowIntensity>("medium");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("idle");
    try {
      await periodsApi.create({ date, flow_intensity: flowIntensity, notes: notes || null });
      setStatus("success");
      setNotes("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2} sx={{ maxWidth: 420 }}>
        {status === "success" && <Alert severity="success">Period logged.</Alert>}
        {status === "error" && <Alert severity="error">Could not save — check the date isn't already logged.</Alert>}
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          required
        />
        <TextField
          select
          label="Flow intensity"
          value={flowIntensity}
          onChange={(e) => setFlowIntensity(e.target.value as FlowIntensity)}
        >
          {FLOW_OPTIONS.map((option) => (
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
          Save period entry
        </Button>
      </Stack>
    </Box>
  );
}
