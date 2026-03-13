"use client";

import { useEffect, useState } from "react";
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
  notes?: string;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [open, setOpen] = useState(false);

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
      </div>

      {loading ? (
        <p className="text-sm">جاري التحميل...</p>
      ) : (
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
              {reservations.map((r) => (
                <tr key={r._id} className="odd:bg-muted/5">
                  <td className="p-4 text-sm text-right border-b">{r.guestName ?? "—"}</td>
                  <td className="p-4 text-sm text-right border-b">{r.phone ?? "—"}</td>
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
                      {r.phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(
                              `https://wa.me/${formatPhoneForWa(r.phone)}`,
                              "_blank"
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

              {reservations.length === 0 && (
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

              {/* Phone with WhatsApp shortcut */}
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
                          "_blank"
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

              {/* Package details */}
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
                        ? `${selected.package.price.toLocaleString("ar-EG")} ج.م`
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

          <DialogFooter>
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