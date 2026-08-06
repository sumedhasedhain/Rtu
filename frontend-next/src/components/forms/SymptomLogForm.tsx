"use client";

import { useEffect, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Slider } from "@/components/ui/Slider";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { listSymptomTypes, symptomLogsApi } from "@/lib/api/logs";
import type { Symptom } from "@/types/api";

// Trimmed to the 10 most commonly tracked, distinct cycle symptoms — the backend
// seeds 15, but several overlap (e.g. "irritability" vs "mood_swings") or are less
// central to daily tracking (joint_pain, insomnia, acne, sadness).
const EXCLUDED_SYMPTOMS = new Set(["sadness", "irritability", "joint_pain", "insomnia", "acne"]);

export function SymptomLogForm() {
  const toast = useToast();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [symptomId, setSymptomId] = useState("");
  const [severity, setSeverity] = useState(3);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    listSymptomTypes().then((data) => {
      const filtered = data.filter((s) => !EXCLUDED_SYMPTOMS.has(s.name));
      setSymptoms(filtered);
      if (filtered.length > 0) setSymptomId(filtered[0].id);
    });
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await symptomLogsApi.create({ date, symptom_id: symptomId, severity, notes: notes || null });
      toast({ title: "Symptom logged", tone: "success" });
      setNotes("");
    } catch {
      toast({
        title: "Couldn't save",
        description: "That symptom may already be logged for this date.",
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
        label="Symptom"
        value={symptomId}
        onValueChange={setSymptomId}
        options={symptoms.map((s) => ({ value: s.id, label: s.name.replace(/_/g, " ") }))}
        placeholder="Select a symptom"
      />
      <Slider label="Severity" value={severity} onValueChange={setSeverity} min={1} max={5} />
      <Textarea label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <Button type="submit" loading={isSubmitting} disabled={!symptomId} className="mt-1">
        Save symptom entry
      </Button>
    </form>
  );
}
