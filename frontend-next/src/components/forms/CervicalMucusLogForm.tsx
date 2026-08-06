"use client";

import { useState, type FormEvent } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cervicalMucusApi } from "@/lib/api/logs";
import type { CervicalMucusType } from "@/types/api";

const TYPE_OPTIONS: { value: CervicalMucusType; label: string }[] = [
  { value: "dry", label: "Dry" },
  { value: "sticky", label: "Sticky" },
  { value: "creamy", label: "Creamy" },
  { value: "watery", label: "Watery" },
  { value: "egg_white", label: "Egg white" },
];

export function CervicalMucusLogForm() {
  const toast = useToast();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [type, setType] = useState<CervicalMucusType>("creamy");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await cervicalMucusApi.create({ date, type, notes: notes || null });
      toast({ title: "Entry logged", tone: "success" });
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
        label="Type"
        value={type}
        onValueChange={(v) => setType(v as CervicalMucusType)}
        options={TYPE_OPTIONS}
      />
      <Textarea label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <Button type="submit" loading={isSubmitting} className="mt-1">
        Save entry
      </Button>
    </form>
  );
}
