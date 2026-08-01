import { useEffect, useState, type FormEvent } from "react";
import { Alert, Box, Button, MenuItem, Slider, Stack, TextField, Typography } from "@mui/material";
import { format } from "date-fns";
import { listSymptomTypes, symptomLogsApi } from "../../api/logs";
import type { Symptom } from "../../types/api";

export function SymptomLogForm() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [symptomId, setSymptomId] = useState("");
  const [severity, setSeverity] = useState(3);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    listSymptomTypes().then((data) => {
      setSymptoms(data);
      if (data.length > 0) setSymptomId(data[0].id);
    });
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("idle");
    try {
      await symptomLogsApi.create({ date, symptom_id: symptomId, severity, notes: notes || null });
      setStatus("success");
      setNotes("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2} sx={{ maxWidth: 420 }}>
        {status === "success" && <Alert severity="success">Symptom logged.</Alert>}
        {status === "error" && <Alert severity="error">Could not save — check the date/symptom isn't already logged.</Alert>}
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          required
        />
        <TextField select label="Symptom" value={symptomId} onChange={(e) => setSymptomId(e.target.value)}>
          {symptoms.map((symptom) => (
            <MenuItem key={symptom.id} value={symptom.id} sx={{ textTransform: "capitalize" }}>
              {symptom.name.replace(/_/g, " ")} ({symptom.category})
            </MenuItem>
          ))}
        </TextField>
        <Box>
          <Typography gutterBottom>Severity: {severity}/5</Typography>
          <Slider
            value={severity}
            onChange={(_, value) => setSeverity(value as number)}
            min={1}
            max={5}
            step={1}
            marks
          />
        </Box>
        <TextField
          label="Notes"
          multiline
          minRows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <Button type="submit" variant="contained" disabled={!symptomId}>
          Save symptom entry
        </Button>
      </Stack>
    </Box>
  );
}
