"use client";
import { useEffect, useRef, useState } from "react";

const emailRx = /^\S+@\S+\.\S+$/;

export default function Home() {
  const [form, setForm] = useState({
    name: "", email: "", message: "", subscribe: false, topic: "כללי", website: "" // website = honeypot
  });
  const [status, setStatus] = useState("idle"); // idle|loading|ok|err
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const nameRef = useRef(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  function validateClient(f) {
    const e = {};
    if (!f.name.trim()) e.name = "שם ריק";
    else if (f.name.trim().length < 2) e.name = "שם חייב להכיל לפחות 2 תווים";
    if (!emailRx.test((f.email ?? "").trim())) e.email = "אימייל לא תקין";
    if ((f.message ?? "").trim().length < 5) e.message = "הודעה קצרה מדי";
    return e;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setServerError("");
    const eClient = validateClient(form);
    setErrors(eClient);
    if (Object.keys(eClient).length) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        // שגיאות ולידציה מהשרת?
        if (json.errors) setErrors(json.errors);
        setServerError(json.error || "שגיאה בשליחה");
        setStatus("err");
        return;
      }

      setStatus("ok");
      setErrors({});
      setForm({ name: "", email: "", message: "", subscribe: false, topic: "כללי", website: "" });
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      setServerError(err.message);
      setStatus("err");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid gap-8 md:grid-cols-2">
        <section className="self-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-3">דף נחיתה – יצירת קשר</h1>
          <p className="text-slate-600">עיצוב נקי, רספונסיבי, וולידציה לקוח+שרת, שליחה מאובטחת ל-Airtable.</p>
        </section>

        <section className="bg-white rounded-2xl shadow p-6 space-y-4">
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            {/* honeypot (מוסתר לגמרי מהמשתמשים) */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              value={form.website}
              onChange={e => setForm({ ...form, website: e.target.value })}
              aria-hidden="true"
            />

            <div>
              <label className="block text-sm mb-1" htmlFor="name">שם מלא</label>
              <input
                id="name" ref={nameRef}
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400
                 ${errors.name ? "border-red-500" : "border-slate-300"}`}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "err-name" : undefined}
                placeholder="שם מלא"
              />
              {errors.name && <p id="err-name" className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm mb-1" htmlFor="email">אימייל</label>
              <input
                id="email" type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400
                 ${errors.email ? "border-red-500" : "border-slate-300"}`}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "err-email" : undefined}
                placeholder="you@example.com"
              />
              {errors.email && <p id="err-email" className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm mb-1" htmlFor="message">הודעה</label>
              <textarea
                id="message" rows={4}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400
                 ${errors.message ? "border-red-500" : "border-slate-300"}`}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "err-message" : undefined}
                placeholder="איך אפשר לעזור?"
              />
              {errors.message && <p id="err-message" className="text-red-600 text-sm mt-1">{errors.message}</p>}
            </div>

            <div>
              <label className="block text-sm mb-1" htmlFor="topic">נושא</label>
              <select
                id="topic"
                value={form.topic}
                onChange={e => setForm({ ...form, topic: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option>כללי</option>
                <option>מכירות</option>
                <option>תמיכה</option>
              </select>
            </div>

            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.subscribe}
                onChange={e => setForm({ ...form, subscribe: e.target.checked })}
                className="h-4 w-4"
              />
              <span>צרפו אותי לעדכונים</span>
            </label>

            <button
              disabled={status === "loading"}
              className="w-full rounded-lg bg-sky-600 text-white py-2.5 font-medium hover:bg-sky-700 disabled:opacity-60"
            >
              {status === "loading" ? "שולח…" : "שליחה"}
            </button>

            {status === "ok"  && <p className="text-green-600">נשלח בהצלחה ✅</p>}
            {status === "err" && !!serverError && <p className="text-red-600">{serverError}</p>}
          </form>
        </section>
      </div>
    </main>
  );
}
