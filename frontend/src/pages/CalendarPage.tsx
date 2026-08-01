import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { Alert, Box, Chip, CircularProgress, IconButton, Paper, Stack, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { listCycles } from "../api/cycles";
import type { Cycle } from "../types/api";
import { determinePhase } from "../utils/phase";
import { PHASE_COLORS } from "../theme";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [monthAnchor, setMonthAnchor] = useState(() => new Date());
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listCycles()
      .then(setCycles)
      .catch(() => setError("Could not load your cycle history."))
      .finally(() => setIsLoading(false));
  }, []);

  const days = useMemo(() => {
    const monthStart = startOfMonth(monthAnchor);
    const monthEnd = endOfMonth(monthAnchor);
    return eachDayOfInterval({
      start: startOfWeek(monthStart),
      end: endOfWeek(monthEnd),
    });
  }, [monthAnchor]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Calendar
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <IconButton onClick={() => setMonthAnchor((d) => subMonths(d, 1))} aria-label="Previous month">
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6" sx={{ minWidth: 160, textAlign: "center" }}>
            {format(monthAnchor, "MMMM yyyy")}
          </Typography>
          <IconButton onClick={() => setMonthAnchor((d) => addMonths(d, 1))} aria-label="Next month">
            <ChevronRightIcon />
          </IconButton>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
        {Object.entries(PHASE_COLORS)
          .filter(([phase]) => phase !== "unknown")
          .map(([phase, color]) => (
            <Chip
              key={phase}
              label={phase}
              size="small"
              sx={{ bgcolor: color, color: "white", textTransform: "capitalize" }}
            />
          ))}
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 1,
        }}
      >
        {WEEKDAY_LABELS.map((label) => (
          <Typography
            key={label}
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 700, textAlign: "center" }}
          >
            {label}
          </Typography>
        ))}

        {days.map((day) => {
          const inMonth = isSameMonth(day, monthAnchor);
          const phase = determinePhase(day, cycles);
          const color = PHASE_COLORS[phase];
          const today = isToday(day);

          return (
            <Paper
              key={day.toISOString()}
              variant="outlined"
              sx={{
                minHeight: 64,
                p: 1,
                opacity: inMonth ? 1 : 0.35,
                borderColor: today ? "primary.main" : undefined,
                borderWidth: today ? 2 : 1,
                bgcolor: phase === "unknown" ? "background.paper" : `${color}22`,
                position: "relative",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: today ? 700 : 400 }}>
                {format(day, "d")}
              </Typography>
              {phase !== "unknown" && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 6,
                    left: 6,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: color,
                  }}
                  aria-label={phase}
                />
              )}
            </Paper>
          );
        })}
      </Box>

      {cycles.length === 0 && !error && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Log your first period to see phase predictions on the calendar.
        </Alert>
      )}
    </Box>
  );
}
