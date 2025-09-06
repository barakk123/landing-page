# דף נחיתה + טופס ל-Airtable
דף נחיתה עם טופס (React + Next.js + Tailwind) ושירות API פנימי ששולח ל-Airtable בצורה מאובטחת.

## דרישות מוקדמות

- Node.js 18+
- Airtable עם Base; Table בשם **Leads**

## התקנה והרצה

```bash
npm install
npm run dev
# http://localhost:3000
```

## משתני סביבה (`env.` בשורש הפרויקט)

```
AIRTABLE_PAT=patxxxxxxxxx
AIRTABLE_BASE_ID=appxxxxxxxx
AIRTABLE_TABLE_NAME=Leads
```

> לאחר שינוי `env.` יש לאתחל את שרת הפיתוח.

## סכמת Airtable - טבלת Leads

- **Name** - Single line text
- **Email** - Email
- **Message** - Long text
- **Subscribe** - Checkbox
- **Topic** - Single select: `כללי`, `מכירות`, `תמיכה`
- **SubmittedAt** - Date + time (תצוגה: Local Time)

## בדיקה מקומית
פתיחת הדף, מילוי הטופס ושליחה -> נוצרה רשומה בטבלת Airtable.

אימות שגיאות: אימייל לא תקין / הודעה קצרה / שם קצר מ‑2 תווים.
