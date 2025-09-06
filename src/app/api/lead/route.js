// בדיקת מבנה אימייל פשוטה
const emailRx = /^\S+@\S+\.\S+$/;

// רשימת שדות מותרים
const ALLOWED = new Set(["name", "email", "message", "subscribe", "topic", "website"]);

export async function POST(request) {
  try {
    const body = await request.json();

    // חסימת שדות לא מוכרים
    for (const k of Object.keys(body)) {
      if (!ALLOWED.has(k)) {
        return Response.json({ ok: false, error: `Unknown field: ${k}` }, { status: 400 });
      }
    }

    // שדה website מוסתר לתפיסת בוטים
    // אם מלא - דילוג על עיבוד הפנייה
    if ((body.website ?? "").trim() !== "") {
      return Response.json({ ok: true, skipped: true }, { status: 200 });
    }

    // סניטציה
    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim();
    const message = (body.message ?? "").trim();
    const subscribe = Boolean(body.subscribe);
    const topic = (body.topic ?? "כללי").trim();

    // ולידציה צד שרת
    const errors = {};
    if (!name) errors.name = "שם ריק";
    if (!emailRx.test(email)) errors.email = "אימייל לא תקין";
    if (message.length < 5) errors.message = "הודעה קצרה מדי";
    if (Object.keys(errors).length) {
      return Response.json({ ok: false, errors }, { status: 400 });
    }

    // שליחה ל-Airtable
    const baseId = process.env.AIRTABLE_BASE_ID;
    const table = encodeURIComponent(process.env.AIRTABLE_TABLE_NAME);
    const url = `https://api.airtable.com/v0/${baseId}/${table}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_PAT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              Name: name,
              Email: email,
              Message: message,
              Subscribe: subscribe,
              Topic: topic,
              SubmittedAt: new Date().toISOString(),
            },
          },
        ],
      }),
    });

    if (!res.ok) {
      const details = await res.text();
      return Response.json(
        { ok: false, error: "Airtable error", details },
        { status: 502 }
      );
    }

    const data = await res.json();
    return Response.json({ ok: true, data }, { status: 200 });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
