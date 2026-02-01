"use client";

import { useState, useEffect, useCallback } from "react";

type LabStep = {
  title: string;
  description: string;
  code?: string;
};

type LabResponse = {
  steps: LabStep[];
};

export default function Home() {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LabResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [auto, setAuto] = useState(true);

  const onGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Request failed");
      }
      const json = (await res.json()) as LabResponse;
      setData(json);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unexpected error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [notes]);

  useEffect(() => {
    if (!auto) return;
    const trimmed = notes.trim();
    if (!trimmed || trimmed.length < 20) return;
    const t = setTimeout(() => {
      onGenerate();
    }, 600);
    return () => clearTimeout(t);
  }, [notes, auto, onGenerate]);

  const surpriseMe = () => {
    setNotes(
      [
        "Topic: Async/Await and Promises in JavaScript",
        "Explain event loop, microtasks vs macrotasks",
        "Show converting callbacks to promises",
        "Practice: fetch API with error handling",
        "Add exercises with Node.js examples",
      ].join("\n")
    );
  };

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Lecture Notes → Interactive Lab</h1>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full h-40 rounded border border-white/20 bg-white/10 p-3 text-white placeholder:text-white/60"
        placeholder="Paste messy lecture notes here"
      />
      <div className="flex gap-3">
        <button
          onClick={onGenerate}
          disabled={loading || !notes.trim()}
          className="inline-flex items-center rounded bg-white/20 px-4 py-2 text-white backdrop-blur hover:bg-white/30 disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate Lab"}
        </button>
        <button
          onClick={surpriseMe}
          disabled={loading}
          className="inline-flex items-center rounded bg-fuchsia-600/80 px-4 py-2 text-white hover:bg-fuchsia-500"
        >
          Surprise Me
        </button>
        <label className="ml-auto flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={auto}
            onChange={(e) => setAuto(e.target.checked)}
          />
          AI Auto Mode
        </label>
      </div>

      {error && <p className="text-red-300">{error}</p>}

      {data && (
        <section className="space-y-6">
          {data.steps.map((s, i) => (
            <div key={i} className="rounded border border-white/20 bg-white/5 p-4">
              <h2 className="text-lg font-medium text-white">
                Step {i + 1}: {s.title}
              </h2>
              <p className="mt-2 text-white/90">{s.description}</p>
              {s.code && (
                <pre className="mt-3 overflow-auto rounded bg-black/70 p-3 text-sm text-gray-100">
                  <code>{s.code}</code>
                </pre>
              )}
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
