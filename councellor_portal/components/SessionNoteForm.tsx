// components/SessionNoteForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Calendar, CheckCircle } from "lucide-react";

export default function SessionNoteForm({ caseId }: { caseId: string }) {
  const [note, setNote] = useState("");
  const [action, setAction] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [markResolved, setMarkResolved] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/cases/${caseId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteContent: note,
          actionTaken: action || undefined,
          followUpDate: followUpDate
            ? new Date(followUpDate).toISOString()
            : undefined,
          markResolved,
        }),
      });

      if (res.ok) {
        setNote("");
        setAction("");
        setFollowUpDate("");
        setMarkResolved(false);
        router.refresh();
      } else {
        alert("Failed to create note");
      }
    } catch (error) {
      console.error("Failed to create note:", error);
      alert("Failed to create note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="note"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Session Notes *
        </label>
        <textarea
          id="note"
          required
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={8}
          className="input-field resize-none"
          placeholder="Document session findings, observations, interventions, and student responses..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="action"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Action Taken
          </label>
          <input
            id="action"
            type="text"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="input-field"
            placeholder="e.g., Referred to psychiatrist"
          />
        </div>

        <div>
          <label
            htmlFor="followUp"
            className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1"
          >
            <Calendar className="w-4 h-4" />
            Follow-up Date
          </label>
          <input
            id="followUp"
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          checked={markResolved}
          onChange={(e) => setMarkResolved(e.target.checked)}
          id="mark-resolved"
          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label
          htmlFor="mark-resolved"
          className="text-sm font-medium text-gray-700 flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5 text-green-600" />
          Mark this case as resolved
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Saving...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Save Session Note
          </>
        )}
      </button>
    </form>
  );
}
