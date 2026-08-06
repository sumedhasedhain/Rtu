"use client";

import { useState, type FormEvent } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { periodsApi } from "@/lib/api/logs";
import type { FlowIntensity } from "@/types/api";

const FLOW_OPTIONS: { value: FlowIntensity; label: string }[] = [
  { value: "spotting", label: "Spotting" },
  { value: "light", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "heavy", label: "Heavy" },
];

export function PeriodLogForm() {
  const toast = useToast();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [flowIntensity, setFlowIntensity] = useState<FlowIntensity>("medium");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await periodsApi.create({ date, flow_intensity: flowIntensity, notes: notes || null });
      toast({ title: "Period logged", tone: "success" });
      setNotes("");
    } catch {
      toast({
        title: "Couldn't save",
        description: "That date may already have an entry.",
        tone: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-5">
      <Input label="Date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
      <Select
        label="Flow intensity"
        value={flowIntensity}
        onValueChange={(v) => setFlowIntensity(v as FlowIntensity)}
        options={FLOW_OPTIONS}
      />
      <Textarea label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <Button type="submit" loading={isSubmitting} className="mt-1">
        Save period entry
      </Button>
    </form>
  );
}
