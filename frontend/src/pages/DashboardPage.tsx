import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { getDashboardSummary, getFertileWindowPrediction, getNextPeriodPrediction } from "../api/cycles";
import type { DashboardSummary, FertileWindowPrediction, NextPeriodPrediction } from "../types/api";
import { PHASE_COLORS } from "../theme";

const REGULARITY_LABEL: Record<string, string> = {
  regular: "Regular",
  irregular: "Irregular",
  insufficient_data: "Not enough data yet",
};

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [nextPeriod, setNextPeriod] = useState<NextPeriodPrediction | null>(null);
  const [fertileWindow, setFertileWindow] = useState<FertileWindowPrediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [summaryData, nextPeriodData, fertileWindowData] = await Promise.all([
          getDashboardSummary(),
          getNextPeriodPrediction(),
          getFertileWindowPrediction(),
        ]);
        setSummary(summaryData);
        setNextPeriod(nextPeriodData);
        setFertileWindow(fertileWindowData);
      } catch {
        setError("Could not load your dashboard. Please try again shortly.");
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !summary) {
    return <Alert severity="error">{error ?? "No data available."}</Alert>;
  }

  const phaseColor = PHASE_COLORS[summary.current_phase] ?? PHASE_COLORS.unknown;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderTop: `4px solid ${phaseColor}` }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Current phase
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, textTransform: "capitalize" }}>
                {summary.current_phase}
              </Typography>
              {summary.current_cycle_day !== null && (
                <Typography variant="body2" color="text.secondary">
                  Cycle day {summary.current_cycle_day}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Days until next period
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {summary.days_until_next_period ?? "—"}
              </Typography>
              {summary.predicted_next_period_date && (
                <Typography variant="body2" color="text.secondary">
                  Predicted: {summary.predicted_next_period_date}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Cycle regularity
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {REGULARITY_LABEL[summary.cycle_regularity] ?? summary.cycle_regularity}
              </Typography>
              {nextPeriod && (
                <Chip
                  size="small"
                  sx={{ mt: 1 }}
                  label={`${nextPeriod.confidence_level} confidence`}
                  color={
                    nextPeriod.confidence_level === "high"
                      ? "success"
                      : nextPeriod.confidence_level === "medium"
                        ? "warning"
                        : "default"
                  }
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Fertile window
              </Typography>
              {fertileWindow?.fertile_window_start ? (
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {fertileWindow.fertile_window_start} → {fertileWindow.fertile_window_end}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Log a few periods to see this
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {nextPeriod?.message && (
        <Alert severity="info" sx={{ mt: 3 }}>
          {nextPeriod.message}
        </Alert>
      )}
    </Box>
  );
}
