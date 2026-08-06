"use client";

import { useState, type FormEvent } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { bbtApi } from "@/lib/api/logs";

export function BBTLogForm() {
  const toast = useToast();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [temperature, setTemperature] = useState("36.5");
  const [timeRecorded, setTimeRecorded] = useState("07:00");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await bbtApi.create({
        date,
        temperature_celsius: Number(temperature),
        time_recorded: timeRecorded ? `${timeRecorded}:00` : null,
        notes: notes || null,
      });
      toast({ title: "Temperature logged", tone: "success" });
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
      <Input
        label="Basal body temperature (°C)"
        type="number"
        step={0.01}
        min={30}
        max={45}
        required
        value={temperature}
        onChange={(e) => setTemperature(e.target.value)}
      />
      <Input
        label="Time recorded"
        type="time"
        value={timeRecorded}
        onChange={(e) => setTimeRecorded(e.target.value)}
      />
      <Textarea label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <Button type="submit" loading={isSubmitting} className="mt-1">
        Save BBT entry
      </Button>
    </form>
  );
}
