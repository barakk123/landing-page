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
    
    const errors = {};
    // סניטציה
    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim();
    const message = (body.message ?? "").trim();
    const subscribe = Boolean(body.subscribe);
    const topic = (body.topic ?? "כללי").trim();

    // ולידציה צד שרת
    if (!name) errors.name = "שם ריק";
    else if (name.length < 2) errors.name = "שם חייב להכיל לפחות 2 תווים";
    if (!emailRx.test(email)) errors.email = "אימייל לא תקין";
    if (message.length < 5) errors.message = "הודעה קצרה מדי";
    if (Object.keys(errors).length > 0) {
      return Response.json({ ok: false, errors, error: "Validation failed" }, { status: 400 });
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

      console.error("Airtable error:", res.status, details);

      const STATUSES = {
        401: "שגיאת אימות מול ספק הנתונים",
        403: "אין הרשאה לגשת למשאב המבוקש",
        404: "המשאב המבוקש לא נמצא",
        422: "נתונים לא תקינים - בדקו שדות/טיפוסים/Topic",
        429: "יותר מדי בקשות - נסו שוב מאוחר יותר",
        500: "שגיאה בצד הספק - נסו שוב מאוחר יותר"
      };
      const msg = STATUSES[res.status] || "שגיאה בשליחה - נסו שוב מאוחר יותר";

      return Response.json(
        { ok: false, error: msg, status: res.status },
        { status: res.status }
      );
    }


    const data = await res.json();
    return Response.json({ ok: true, data }, { status: 200 });
  } catch (err) {
    console.error("Lead API error:", err);
    return Response.json(
      { ok: false, error: "שגיאה כללית בשליחה - נסו שוב", status: 500 },
      { status: 500 }
    );
  }

}
