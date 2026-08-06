"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Droplet, Activity, Thermometer, Waves, TestTube2 } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Tabs, TabPanel } from "@/components/ui/Tabs";
import { PeriodLogForm } from "@/components/forms/PeriodLogForm";
import { SymptomLogForm } from "@/components/forms/SymptomLogForm";
import { BBTLogForm } from "@/components/forms/BBTLogForm";
import { CervicalMucusLogForm } from "@/components/forms/CervicalMucusLogForm";
import { OvulationTestLogForm } from "@/components/forms/OvulationTestLogForm";
import { fadeRise } from "@/lib/motion/variants";

const TABS = [
  { value: "period", label: "Period", icon: <Droplet className="h-4 w-4" /> },
  { value: "symptom", label: "Symptom", icon: <Activity className="h-4 w-4" /> },
  { value: "bbt", label: "BBT", icon: <Thermometer className="h-4 w-4" /> },
  { value: "cervical-mucus", label: "Mucus", icon: <Waves className="h-4 w-4" /> },
  { value: "ovulation-test", label: "Ovulation", icon: <TestTube2 className="h-4 w-4" /> },
];

export default function LogEntryPage() {
  const [activeTab, setActiveTab] = useState("period");

  return (
    <div className="pb-10">
      <motion.div initial="hidden" animate="visible" variants={fadeRise} className="mb-6">
        <p className="text-sm text-text-tertiary">Add to your timeline</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-text-primary">Log entry</h1>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeRise} transition={{ delay: 0.05 }}>
        <GlassPanel className="p-6 sm:p-8">
          <Tabs items={TABS} value={activeTab} onValueChange={setActiveTab}>
            <div className="mt-8">
              <TabPanel value="period">
                <PeriodLogForm />
              </TabPanel>
              <TabPanel value="symptom">
                <SymptomLogForm />
              </TabPanel>
              <TabPanel value="bbt">
                <BBTLogForm />
              </TabPanel>
              <TabPanel value="cervical-mucus">
                <CervicalMucusLogForm />
              </TabPanel>
              <TabPanel value="ovulation-test">
                <OvulationTestLogForm />
              </TabPanel>
            </div>
          </Tabs>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
