import { useState, type SyntheticEvent } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { PeriodLogForm } from "../components/forms/PeriodLogForm";
import { SymptomLogForm } from "../components/forms/SymptomLogForm";
import { BBTLogForm } from "../components/forms/BBTLogForm";
import { CervicalMucusLogForm } from "../components/forms/CervicalMucusLogForm";
import { OvulationTestLogForm } from "../components/forms/OvulationTestLogForm";

const TABS = [
  { label: "Period", component: <PeriodLogForm /> },
  { label: "Symptom", component: <SymptomLogForm /> },
  { label: "BBT", component: <BBTLogForm /> },
  { label: "Cervical Mucus", component: <CervicalMucusLogForm /> },
  { label: "Ovulation Test", component: <OvulationTestLogForm /> },
];

export function LogEntryPage() {
  const [activeTab, setActiveTab] = useState(0);

  function handleChange(_event: SyntheticEvent, newValue: number) {
    setActiveTab(newValue);
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Log Entry
      </Typography>
      <Tabs value={activeTab} onChange={handleChange} sx={{ mb: 3 }} variant="scrollable">
        {TABS.map((tab) => (
          <Tab key={tab.label} label={tab.label} />
        ))}
      </Tabs>
      {TABS[activeTab].component}
    </Box>
  );
}
