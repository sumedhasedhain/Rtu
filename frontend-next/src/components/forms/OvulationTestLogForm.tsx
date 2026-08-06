"use client";

import { useState, type FormEvent } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ovulationTestsApi } from "@/lib/api/logs";
import type { OvulationTestResult } from "@/types/api";

const RESULT_OPTIONS: { value: OvulationTestResult; label: string }[] = [
  { value: "negative", label: "Negative" },
  { value: "positive", label: "Positive" },
  { value: "peak", label: "Peak" },
];

export function OvulationTestLogForm() {
  const toast = useToast();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [result, setResult] = useState<OvulationTestResult>("negative");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await ovulationTestsApi.create({ date, result, notes: notes || null });
      toast({ title: "Test result logged", tone: "success" });
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
        label="Result"
        value={result}
        onValueChange={(v) => setResult(v as OvulationTestResult)}
        options={RESULT_OPTIONS}
      />
      <Textarea label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <Button type="submit" loading={isSubmitting} className="mt-1">
        Save entry
      </Button>
    </form>
  );
}
