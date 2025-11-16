import { NextResponse } from "next/server";

import { pool } from "@/lib/db/drizzle";

export async function POST() {
  const now = new Date();

  const promotedArticles = await pool.query(
    'update "articles" set "status" = $1, "published_at" = coalesce("published_at", $2), "scheduled_at" = null, "updated_at" = now() where "status" = $3 and "scheduled_at" <= $2 and "deleted_at" is null',
    ["PUBLISHED", now, "SCHEDULED"],
  );

  const promotedEvents = await pool.query(
    'update "events" set "status" = $1, "updated_at" = now() where "status" = $2 and "start_date" <= $3 and "deleted_at" is null',
    ["PUBLISHED", "DRAFT", now],
  );

  return NextResponse.json({
    ok: true,
    promoted: {
      articles: promotedArticles.rowCount ?? 0,
      events: promotedEvents.rowCount ?? 0,
    },
  });
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Use POST to trigger scheduled publish job." });
}
