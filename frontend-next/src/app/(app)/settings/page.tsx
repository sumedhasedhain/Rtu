"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Download, FileText, Trash2, ShieldAlert } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth/useAuth";
import { deleteAccount, downloadExport } from "@/lib/api/cycles";
import { fadeRise } from "@/lib/motion/variants";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [exportingFormat, setExportingFormat] = useState<"csv" | "pdf" | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleExport(format: "csv" | "pdf") {
    setExportingFormat(format);
    try {
      await downloadExport(format);
      toast({ title: `Export ready`, description: `Your ${format.toUpperCase()} download has started.`, tone: "success" });
    } catch {
      toast({ title: "Export failed", description: "Please try again.", tone: "error" });
    } finally {
      setExportingFormat(null);
    }
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    try {
      await deleteAccount();
      await logout();
      router.push("/login");
    } catch {
      toast({ title: "Couldn't delete your account", description: "Please try again.", tone: "error" });
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="max-w-2xl pb-10">
      <motion.div initial="hidden" animate="visible" variants={fadeRise} className="mb-6">
        <p className="text-sm text-text-tertiary">Manage your account</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-text-primary">Settings</h1>
      </motion.div>

      <div className="flex flex-col gap-5">
        <motion.div initial="hidden" animate="visible" variants={fadeRise} transition={{ delay: 0.05 }}>
          <GlassPanel className="p-6">
            <h2 className="font-medium text-text-primary">Account</h2>
            <p className="mt-2 text-sm text-text-secondary">{user?.email}</p>
          </GlassPanel>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeRise} transition={{ delay: 0.1 }}>
          <GlassPanel className="p-6">
            <h2 className="font-medium text-text-primary">Export your data</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Download everything you&rsquo;ve logged, in CSV or PDF format.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                variant="glass"
                loading={exportingFormat === "csv"}
                disabled={exportingFormat !== null}
                onClick={() => void handleExport("csv")}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="glass"
                loading={exportingFormat === "pdf"}
                disabled={exportingFormat !== null}
                onClick={() => void handleExport("pdf")}
              >
                <FileText className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </GlassPanel>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeRise} transition={{ delay: 0.15 }}>
          <GlassPanel className="border-state-danger/20 p-6">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-state-danger" />
              <h2 className="font-medium text-state-danger">Danger zone</h2>
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              Permanently delete your account and every entry you&rsquo;ve logged. This
              cannot be undone.
            </p>
            <Button variant="danger" className="mt-5" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete my account
            </Button>
          </GlassPanel>
        </motion.div>
      </div>

      <Modal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete your account?"
        description="This permanently deletes your account and all logged periods, symptoms, and other data. This action cannot be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" loading={isDeleting} onClick={() => void handleDeleteAccount()}>
              Delete permanently
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">There is no undo for this action.</p>
      </Modal>
    </div>
  );
}
