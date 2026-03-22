"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { BASE_URL } from "@/lib/constants";

interface PackageLocale {
  name: string;
  description?: string;
  features: string[];
}

interface Package {
  _id: string;
  ar: PackageLocale;
  en: PackageLocale;
  price: number;
  popular?: boolean;
  premium?: boolean;
}

interface Reservation {
  _id: string;
  guestName?: string;
  age?: number;
  phone?: string;
  numberOfCompanions?: number;
  expectedArrivalDate?: string;
  expectedArrivalTime?: string;
  directionOfTravel?: string;
  package?: Package;
  totalCost?: number;
  notes?: string;
  createdAt?: string;
}

const PAGE_SIZE = 10;

// ─── Print helper ────────────────────────────────────────────────────────────
function printReservation(r: Reservation) {
  const formatDateAr = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("ar-EG");
    } catch {
      return iso;
    }
  };

  const features = r.package?.ar?.features?.length
    ? r.package.ar.features.map((f) => `<li>${f}</li>`).join("")
    : "";

  // 🔥 dynamic scaling based on content length
  const isLargeContent =
    (r.notes && r.notes.length > 200) ||
    (r.package?.ar?.features && r.package.ar.features.length > 5);

  const scale = isLargeContent ? 0.75 : 0.9;

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8" />
      <title>تفاصيل الحجز — ${r.guestName ?? "ضيف"}</title>

     <style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Cairo', Arial, sans-serif;
    direction: rtl;
    color: #1a1a1a;
    padding: 20px;
    background: #fff;
    zoom: ${scale};
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 12px;
    margin-bottom: 18px;
  }

  .header h1 { font-size: 22px; font-weight: 700; }
  .header .id { font-size: 12px; color: #6b7280; }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 18px;
    margin-bottom: 18px;
  }

  .field label {
    font-size: 18px;
    font-weight: 800;
    color: #6b7280;
    margin-bottom: 4px;
    display: block;
  }

  .field span { font-size: 18px; color: #111827; }

  .full { grid-column: span 2; }

  .section-title {
    font-size: 18px;
    font-weight: 700;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 6px;
    margin-bottom: 10px;
    margin-top: 12px;
    color: #374151;
  }

  .badge {
    display: inline-block;
    font-size: 16px;
    padding: 3px 8px;
    border-radius: 9999px;
    margin-right: 6px;
  }

  .badge-gold { background: #fef3c7; color: #92400e; }
  .badge-blue { background: #dbeafe; color: #1e40af; }

  ul.features {
    list-style: disc;
    padding-right: 18px;
  }

  ul.features li {
    font-size: 18px;
    margin-bottom: 4px;
  }

  .notes-box {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
    line-height: 1.6;
  }

  .footer {
    margin-top: 18px;
    text-align: center;
    font-size: 11px;
    color: #9ca3af;
    border-top: 1px solid #e5e7eb;
    padding-top: 8px;
  }

  @media print {
    @page {
      size: A4;
      margin: 15mm;
    }

    body {
      padding: 10px;
    }

    * {
      page-break-inside: avoid !important;
    }
  }
</style>
    </head>

    <body>
      <div class="header">
        <h1>booking details — ${r.guestName ?? "ضيف"}</h1>
        <span class="id">booking no: ${r._id}</span>
      </div>

      <p class="section-title">guest details</p>
      <div class="grid">
        <div class="field"><label>guest name</label><span>${r.guestName ?? "—"}</span></div>
        <div class="field"><label>age</label><span>${r.age ?? "—"}</span></div>
        <div class="field"><label>phone</label><span>${r.phone ?? "—"}</span></div>
        <div class="field"><label>companions</label><span>${r.numberOfCompanions ?? "—"}</span></div>
        <div class="field"><label>arrival date</label><span>${formatDateAr(r.expectedArrivalDate)}</span></div>
        <div class="field"><label>arrival time</label><span>${r.expectedArrivalTime ?? "—"}</span></div>
        <div class="field full"><label>direction</label><span>${r.directionOfTravel ?? "—"}</span></div>
      </div>

      ${r.package ? `
        <p class="section-title">الباقة</p>
        <div class="grid">
          <div class="field full">
            <label>package</label>
            <span>
              ${r.package.en?.name ?? "—"}
              ${r.package.premium ? '<span class="badge badge-gold">premium</span>' : ""}
              ${r.package.popular ? '<span class="badge badge-blue">popular</span>' : ""}
            </span>
          </div>

          ${r.package.en?.description ? `
            <div class="field full">
              <label>details</label>
              <span>${r.package.en.description}</span>
            </div>
          ` : ""}

          <div class="field">
            <label>price/person</label>
            <span>${r.package.price != null ? r.package.price + " ₪" : "—"}</span>
          </div>

          <div class="field">
            <label>total</label>
            <span>${r.totalCost != null ? r.totalCost + " ₪" : "—"}</span>
          </div>

          ${features ? `
            <div class="field full">
              <label>features</label>
              <ul class="features">${features}</ul>
            </div>
          ` : ""}
        </div>
      ` : ""}

      ${r.notes ? `
        <p class="section-title">ملاحظات</p>
        <div class="notes-box">${r.notes}</div>
      ` : ""}

      <div class="footer">
        تم الإنشاء بتاريخ ${new Date().toLocaleDateString("ar-EG")} — ${new Date().toLocaleTimeString("ar-EG")}
      </div>
    </body>
    </html>
  `;

  const win = window.open("", "_blank", "width=800,height=900");
  if (!win) return;

  win.document.write(html);
  win.document.close();
  win.focus();

  setTimeout(() => {
    win.print();
  }, 500);
}
// ─────────────────────────────────────────────────────────────────────────────

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/reservations`);
      setReservations(res.data);
    } catch (err) {
      console.error("Error fetching reservations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Sort newest first: use createdAt if present, otherwise fall back to
  // MongoDB ObjectId lexicographic order (first 8 hex chars encode a timestamp).
  const sorted = useMemo(() => {
    return [...reservations].sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (tA === 0 && tB === 0) return b._id.localeCompare(a._id);
      return tB - tA;
    });
  }, [reservations]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Build the compact page-number list: always show first, last, and ±1 around current
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);

  const openDetails = (reservation: Reservation) => {
    setSelected(reservation);
    setOpen(true);
  };

  const formatPhoneForWa = (phone = "") => phone.replace(/\D/g, "");

  const formatDateAr = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("ar-EG");
    } catch {
      return iso;
    }
  };

  return (
    <div dir="rtl" className="p-6 min-h-screen bg-background text-foreground">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">الحجوزات</h1>
        <span className="text-sm text-muted-foreground">
          {reservations.length} حجز إجمالاً
        </span>
      </div>

      {loading ? (
        <p className="text-sm">جاري التحميل...</p>
      ) : (
        <>
          <div className="rounded-md border overflow-hidden">
            <table className="table-fixed w-full min-w-[720px]">
              <colgroup>
                <col style={{ width: "20%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "22%" }} />
              </colgroup>

              <thead className="bg-muted/20">
                <tr className="text-sm text-muted-foreground">
                  <th className="p-4 text-right border-b">الضيف</th>
                  <th className="p-4 text-right border-b">الهاتف</th>
                  <th className="p-4 text-right border-b">الباقة</th>
                  <th className="p-4 text-right border-b">الوصول</th>
                  <th className="p-4 text-right border-b">المرافقون</th>
                  <th className="p-4 text-right border-b">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((r) => (
                  <tr key={r._id} className="odd:bg-muted/5">
                    <td className="p-4 text-sm text-right border-b">
                      {r.guestName ?? "—"}
                    </td>
                    <td className="p-4 text-sm text-right border-b">
                      {r.phone ?? "—"}
                    </td>
                    <td className="p-4 text-sm text-right border-b">
                      {r.package?.ar?.name ?? "—"}
                    </td>
                    <td className="p-4 text-sm text-right border-b">
                      {formatDateAr(r.expectedArrivalDate) || "—"}
                    </td>
                    <td className="p-4 text-sm text-right border-b">
                      {r.numberOfCompanions ?? "—"}
                    </td>
                    <td className="p-4 text-sm text-right border-b">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" onClick={() => openDetails(r)}>
                          عرض التفاصيل
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          title="طباعة / تحميل PDF"
                          onClick={() => printReservation(r)}
                        >
                          🖨️
                        </Button>
                        {r.phone && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              window.open(
                                `https://wa.me/${formatPhoneForWa(r.phone)}`,
                                "_blank",
                              )
                            }
                          >
                            واتساب
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {paginated.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-6 text-center text-sm text-muted-foreground"
                    >
                      لا توجد حجوزات لعرضها
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">
                صفحة {page} من {totalPages} — عرض{" "}
                {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, sorted.length)} من {sorted.length}
              </span>

              <div className="flex items-center gap-1">
                {/* First */}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                  aria-label="الصفحة الأولى"
                >
                  «
                </Button>
                {/* Prev */}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ‹ السابق
                </Button>

                {/* Numbered pages */}
                {pageNumbers.map((item, idx) =>
                  item === "…" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-muted-foreground text-sm select-none"
                    >
                      …
                    </span>
                  ) : (
                    <Button
                      key={item}
                      size="sm"
                      variant={item === page ? "default" : "outline"}
                      onClick={() => setPage(item as number)}
                    >
                      {item}
                    </Button>
                  )
                )}

                {/* Next */}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  التالي ›
                </Button>
                {/* Last */}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(totalPages)}
                  aria-label="الصفحة الأخيرة"
                >
                  »
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Reservation Details Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {selected
                ? `تفاصيل الحجز — ${selected.guestName ?? "ضيف"}`
                : "تفاصيل الحجز"}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Field label="اسم الضيف" value={selected.guestName} />
              <Field label="العمر" value={selected.age} />

              {selected.phone && (
                <div>
                  <p className="text-sm font-medium">الهاتف</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-muted-foreground">
                      {selected.phone}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open(
                          `https://wa.me/${formatPhoneForWa(selected.phone)}`,
                          "_blank",
                        )
                      }
                    >
                      افتح في واتساب
                    </Button>
                  </div>
                </div>
              )}

              <Field label="عدد المرافقين" value={selected.numberOfCompanions} />
              <Field
                label="تاريخ الوصول"
                value={formatDateAr(selected.expectedArrivalDate)}
              />
              <Field label="وقت الوصول" value={selected.expectedArrivalTime} />
              <Field label="اتجاه السفر" value={selected.directionOfTravel} />

              {selected.package && (
                <>
                  <div className="col-span-2">
                    <p className="text-sm font-medium">الباقة</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selected.package.ar?.name}
                      {selected.package.premium && (
                        <span className="mr-2 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                          مميزة
                        </span>
                      )}
                      {selected.package.popular && (
                        <span className="mr-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                          الأكثر طلباً
                        </span>
                      )}
                    </p>
                    {selected.package.ar?.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selected.package.ar.description}
                      </p>
                    )}
                  </div>

                  {selected.package.ar?.features?.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium mb-1">مميزات الباقة</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {selected.package.ar.features.map((f, i) => (
                          <li key={i} className="text-sm text-muted-foreground">
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Field
                    label="سعر الباقة"
                    value={
                      selected.package.price != null
                        ? `${selected.package.price.toLocaleString("ar-EG")} شيكل`
                        : undefined
                    }
                  />
                </>
              )}

              {selected.notes && (
                <div className="col-span-2">
                  <p className="text-sm font-medium">ملاحظات</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selected.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => selected && printReservation(selected)}
            >
              🖨️ طباعة / تحميل PDF
            </Button>
            <Button onClick={() => setOpen(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm text-muted-foreground mt-1">{value}</p>
    </div>
  );
}