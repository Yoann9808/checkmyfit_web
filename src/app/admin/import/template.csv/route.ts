import { CSV_TEMPLATE } from "@/lib/catalog/schema";
import { requireAdmin } from "@/lib/auth/session";

export async function GET() {
  await requireAdmin();
  return new Response("﻿" + CSV_TEMPLATE, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="checkmyfit-catalogue-modele.csv"',
    },
  });
}
