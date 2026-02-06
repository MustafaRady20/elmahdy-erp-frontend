"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, DollarSign, Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";

interface Revenue {
  _id: string;
  shift: string;
  date: string;
  amount: number;
}

interface RevenueListProps {
  cafeId: string;
}

export default function RevenueList({ cafeId }: RevenueListProps) {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRevenue, setSelectedRevenue] = useState<Revenue | null>(null);
  const [editFormData, setEditFormData] = useState({
    shift: "",
    date: "",
    amount: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRevenues();
  }, [cafeId]);

  const fetchRevenues = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/revenue`);
      // Filter by cafeId on frontend since there's no filter endpoint
      const filtered = res.data.filter((r: any) => r.cafeId._id === cafeId);
      setRevenues(filtered);
    } catch (err) {
      console.error("Failed to fetch revenues", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (revenue: Revenue) => {
    setSelectedRevenue(revenue);
    setEditFormData({
      shift: revenue.shift,
      date: new Date(revenue.date).toISOString().split("T")[0],
      amount: revenue.amount.toString(),
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (revenue: Revenue) => {
    setSelectedRevenue(revenue);
    setDeleteDialogOpen(true);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRevenue) return;

    setSubmitting(true);
    try {
      await axios.patch(`${BASE_URL}/revenue/${selectedRevenue._id}`, {
        shift: editFormData.shift,
        date: new Date(editFormData.date),
        amount: parseFloat(editFormData.amount),
      });

      setEditDialogOpen(false);
      fetchRevenues();
    } catch (err) {
      console.error("Failed to update revenue", err);
      alert("فشل في تحديث الإيرادات");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedRevenue) return;

    setSubmitting(true);
    try {
      await axios.delete(`${BASE_URL}/revenue/${selectedRevenue._id}`);
      setDeleteDialogOpen(false);
      fetchRevenues();
    } catch (err) {
      console.error("Failed to delete revenue", err);
      alert("فشل في حذف الإيرادات");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const getShiftLabel = (shift: string) => {
    return shift === "morning" ? "صباحي" : "مسائي";
  };

  const getShiftVariant = (shift: string) => {
    return shift === "morning" ? "default" : "secondary";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل الإيرادات...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>سجل الإيرادات</CardTitle>
        </CardHeader>
        <CardContent>
          {revenues.length === 0 ? (
            <div className="py-12 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد إيرادات مسجلة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {revenues.map((revenue) => (
                <div
                  key={revenue._id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getShiftVariant(revenue.shift)}>
                        {getShiftLabel(revenue.shift)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(revenue.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <p className="font-bold text-lg text-green-600 dark:text-green-400">
                        {formatCurrency(revenue.amount)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(revenue)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(revenue)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل الإيرادات</DialogTitle>
          </DialogHeader>

          <form onSubmit={submitEdit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="edit-shift">الشفت *</Label>
              <Select
                value={editFormData.shift}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, shift: value })
                }
                required
              >
                <SelectTrigger id="edit-shift">
                  <SelectValue placeholder="اختر الشفت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">صباحي</SelectItem>
                  <SelectItem value="evening">مسائي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-date">التاريخ *</Label>
              <Input
                id="edit-date"
                type="date"
                required
                value={editFormData.date}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, date: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-amount">المبلغ (ج.م) *</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                min="0"
                required
                value={editFormData.amount}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, amount: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    جاري التحديث...
                  </>
                ) : (
                  "حفظ التعديلات"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={submitting}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الإيرادات نهائياً من
              السجلات.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري الحذف...
                </>
              ) : (
                "حذف"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
