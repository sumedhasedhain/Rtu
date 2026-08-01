import { useState, type FormEvent } from "react";
import { Alert, Box, Button, MenuItem, Stack, TextField } from "@mui/material";
import { format } from "date-fns";
import { cervicalMucusApi } from "../../api/logs";
import type { CervicalMucusType } from "../../types/api";

const TYPE_OPTIONS: CervicalMucusType[] = ["dry", "sticky", "creamy", "watery", "egg_white"];

export function CervicalMucusLogForm() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [type, setType] = useState<CervicalMucusType>("creamy");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("idle");
    try {
      await cervicalMucusApi.create({ date, type, notes: notes || null });
      setStatus("success");
      setNotes("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2} sx={{ maxWidth: 420 }}>
        {status === "success" && <Alert severity="success">Cervical mucus logged.</Alert>}
        {status === "error" && <Alert severity="error">Could not save — check the date isn't already logged.</Alert>}
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          required
        />
        <TextField select label="Type" value={type} onChange={(e) => setType(e.target.value as CervicalMucusType)}>
          {TYPE_OPTIONS.map((option) => (
            <MenuItem key={option} value={option} sx={{ textTransform: "capitalize" }}>
              {option.replace("_", " ")}
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
