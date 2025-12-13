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

interface Reservation {
  _id: string;
  guestName: string;
  age: number;
  phone: string;
  email?: string;
  gender?: string;
  country: string;
  numberOfCompanions: number;
  expectedArrivalDate: string;
  expectedArrivalTime: string;
  expectedDepartureDate?: string;
  purposeOfVisit?: string;
  transportationMode?: string;
  notes?: string;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [open, setOpen] = useState(false);

  // fetch
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

  const formatPhoneForWa = (phone = "") =>
    phone.replace(/\D/g, ""); // remove non-digits for wa.me

  // Arabic date formatter
  const formatDateAr = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("ar-EG");
    } catch {
      return iso;
    }
  };

  return (
    // dir rtl for Arabic layout
    <div dir="rtl" className="p-6 min-h-screen bg-background text-foreground">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">الحجوزات</h1>
      </div>

      {loading ? (
        <p className="text-sm">جاري التحميل...</p>
      ) : (
        <div className="rounded-md border overflow-hidden">
          {/* Use native table + colgroup to guarantee header/column alignment */}
          <table className="table-fixed w-full min-w-[720px]">
            {/* تحديد أعمدة العرض (تتوافق مع نفس الترتيب في thead/tbody) */}
            <colgroup>
              {/* Guest (host/اسم الضيف) -- عرض أكبر */}
              <col style={{ width: "20%" }} />
              {/* Phone */}
              <col style={{ width: "18%" }} />
              {/* Country */}
              <col style={{ width: "15%" }} />
              {/* Arrival */}
              <col style={{ width: "15%" }} />
              {/* Companions */}
              <col style={{ width: "10%" }} />
              {/* Actions */}
              <col style={{ width: "22%" }} />
            </colgroup>

            <thead className="bg-muted/20">
              <tr className="text-sm text-muted-foreground">
                {/* order visually right-to-left; but colgroup sets widths */}
                <th className="p-4 text-right border-b">الضيف</th>
                <th className="p-4 text-right border-b">الهاتف</th>
                <th className="p-4 text-right border-b">البلد</th>
                <th className="p-4 text-right border-b">الوصول</th>
                <th className="p-4 text-right border-b">المرافقون</th>
                <th className="p-4 text-right border-b">الإجراءات</th>
              </tr>
            </thead>

            <tbody>
              {reservations.map((r) => (
                <tr key={r._id} className="odd:bg-muted/5">
                  <td className="p-4 text-sm text-right border-b">{r.guestName}</td>
                  <td className="p-4 text-sm text-right border-b">{r.phone}</td>
                  <td className="p-4 text-sm text-right border-b">{r.country}</td>
                  <td className="p-4 text-sm text-right border-b">
                    {formatDateAr(r.expectedArrivalDate)}
                  </td>
                  <td className="p-4 text-sm text-right border-b">{r.numberOfCompanions}</td>
                  <td className="p-4 text-sm text-right border-b">
                    <div className="flex items-center justify-start gap-2 rtl:justify-end">
                      <Button size="sm" onClick={() => openDetails(r)}>
                        عرض التفاصيل
                      </Button>

                      {/* سلوك سريع لفتح WhatsApp مباشرة من الجدول */}
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
                    </div>
                  </td>
                </tr>
              ))}

              {reservations.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                    لا توجد حجوزات لعرضها
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* تفاصيل الحجز (Dialog) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selected ? `تفاصيل الحجز — ${selected.guestName}` : "تفاصيل الحجز"}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Field label="اسم الضيف" value={selected.guestName} />
              <Field label="العمر" value={selected.age} />

              <div>
                <p className="text-sm font-medium">الهاتف</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-muted-foreground">{selected.phone}</span>
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

              <Field label="البريد الإلكتروني" value={selected.email} />
              <Field label="الجنس" value={selected.gender} />
              <Field label="البلد" value={selected.country} />

              <Field label="تاريخ الوصول" value={formatDateAr(selected.expectedArrivalDate)} />
              <Field label="وقت الوصول" value={selected.expectedArrivalTime} />

              {selected.expectedDepartureDate && (
                <Field label="تاريخ المغادرة" value={formatDateAr(selected.expectedDepartureDate)} />
              )}

              <Field label="المرافقون" value={selected.numberOfCompanions} />
              <Field label="الغرض من الزيارة" value={selected.purposeOfVisit} />
              <Field label="وسيلة النقل" value={selected.transportationMode} />

              {selected.notes && (
                <div className="col-span-2">
                  <p className="text-sm font-medium">ملاحظات</p>
                  <p className="text-sm text-muted-foreground mt-1">{selected.notes}</p>
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

/** مكون صغير لعرض حقل/قيمة */
function Field({ label, value }: { label: string; value?: any }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm text-muted-foreground mt-1">{value}</p>
    </div>
  );
}
