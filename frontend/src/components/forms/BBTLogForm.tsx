import { useState, type FormEvent } from "react";
import { Alert, Box, Button, Stack, TextField } from "@mui/material";
import { format } from "date-fns";
import { bbtApi } from "../../api/logs";

export function BBTLogForm() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [temperature, setTemperature] = useState("36.5");
  const [timeRecorded, setTimeRecorded] = useState("07:00");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("idle");
    try {
      await bbtApi.create({
        date,
        temperature_celsius: Number(temperature),
        time_recorded: timeRecorded ? `${timeRecorded}:00` : null,
        notes: notes || null,
      });
      setStatus("success");
      setNotes("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2} sx={{ maxWidth: 420 }}>
        {status === "success" && <Alert severity="success">Temperature logged.</Alert>}
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
          label="Basal body temperature (°C)"
          type="number"
          slotProps={{ htmlInput: { step: 0.01, min: 30, max: 45 } }}
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          required
        />
        <TextField
          label="Time recorded"
          type="time"
          value={timeRecorded}
          onChange={(e) => setTimeRecorded(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Notes"
          multiline
          minRows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <Button type="submit" variant="contained">
          Save BBT entry
        </Button>
      </Stack>
    </Box>
  );
}
