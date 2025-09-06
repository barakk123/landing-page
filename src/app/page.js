"use client";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  // מצב ראשוני עד שאכין את הAPI
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const nameRef = useRef(null);
  useEffect(() => { nameRef.current?.focus(); }, []);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid gap-8 md:grid-cols-2">
        {/* צד תוכן קצר ונקי */}
        <section className="self-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-3">דף נחיתה - יצירת קשר</h1>
          <p className="text-slate-600">
            עיצוב נקי, נעים ומאוזן. רספונסיבי לכל המסכים.
          </p>
        </section>

        {/* כרטיס הטופס */}
        <section className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="name">שם מלא</label>
            <input
              id="name" ref={nameRef} value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="שם מלא"
            />
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="email">אימייל</label>
            <input
              id="email" type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="message">הודעה</label>
            <textarea
              id="message" rows={4} value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="איך אפשר לעזור?"
            />
          </div>

          {/* אוסיף בהמשך את הלוגיקה של השליחה */}
          <button
            type="button"
            className="w-full rounded-lg bg-sky-600 text-white py-2.5 font-medium hover:bg-sky-700"
            disabled
            title="אוסיף בהמשך את הלוגיקה של השליחה"
          >
            שליחה
          </button>
        </section>
      </div>
    </main>
  );
}
