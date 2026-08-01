import { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, Grid, Paper, Typography } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getCycleLengthTrend, getSymptomFrequency } from "../api/cycles";
import type { CycleLengthTrendPoint, SymptomFrequencyEntry } from "../types/api";
import { aggregateBySymptom } from "../utils/aggregateBySymptom";

export function TrendsPage() {
  const [trend, setTrend] = useState<CycleLengthTrendPoint[]>([]);
  const [symptomFrequency, setSymptomFrequency] = useState<SymptomFrequencyEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCycleLengthTrend(), getSymptomFrequency()])
      .then(([trendData, symptomData]) => {
        setTrend(trendData);
        setSymptomFrequency(symptomData);
      })
      .catch(() => setError("Could not load trend data."))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const symptomChartData = aggregateBySymptom(symptomFrequency);

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Trends
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cycle length over time
            </Typography>
            {trend.length === 0 ? (
              <Typography color="text.secondary">Not enough completed cycles yet.</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cycle_number" label={{ value: "Cycle #", position: "insideBottom", offset: -5 }} />
                  <YAxis label={{ value: "Days", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="cycle_length_days" stroke="#9c27b0" strokeWidth={2} name="Cycle length" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Symptom frequency by phase
            </Typography>
            {symptomChartData.length === 0 ? (
              <Typography color="text.secondary">Log some symptoms to see this chart.</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={symptomChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="symptom_name" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={70} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="menstrual" stackId="phase" fill="#e53973" />
                  <Bar dataKey="follicular" stackId="phase" fill="#7cb342" />
                  <Bar dataKey="fertile" stackId="phase" fill="#fbc02d" />
                  <Bar dataKey="luteal" stackId="phase" fill="#7e57c2" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
