"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Package, Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";

interface Category {
  _id: string;
  name: string;
}

interface Purchase {
  _id: string;
  category: {
    _id: string;
    name: string;
  };
  quantity: number;
  unitPrice: number;
  totalCost: number;
  purchaseDate: string;
}

interface PurchasesListProps {
  cafeId: string;
}

export default function PurchasesList({ cafeId }: PurchasesListProps) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [editFormData, setEditFormData] = useState({
    category: "",
    quantity: "",
    unitPrice: "",
    purchaseDate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPurchases();
    fetchCategories();
  }, [cafeId]);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/purchases/filter`, {
        params: { cafeId },
      });
      setPurchases(res.data);
    } catch (err) {
      console.error("Failed to fetch purchases", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const handleEdit = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setEditFormData({
      category: purchase.category._id,
      quantity: purchase.quantity.toString(),
      unitPrice: purchase.unitPrice.toString(),
      purchaseDate: new Date(purchase.purchaseDate).toISOString().split('T')[0],
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setDeleteDialogOpen(true);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPurchase) return;

    setSubmitting(true);
    try {
      const totalCost = parseFloat(editFormData.quantity) * parseFloat(editFormData.unitPrice);
      
      await axios.patch(`${BASE_URL}/purchases/${selectedPurchase._id}`, {
        category: editFormData.category,
        quantity: parseFloat(editFormData.quantity),
        unitPrice: parseFloat(editFormData.unitPrice),
        totalCost,
        purchaseDate: new Date(editFormData.purchaseDate),
      });

      setEditDialogOpen(false);
      fetchPurchases();
    } catch (err) {
      console.error("Failed to update purchase", err);
      alert("فشل في تحديث المشترى");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedPurchase) return;

    setSubmitting(true);
    try {
      await axios.delete(`${BASE_URL}/purchases/${selectedPurchase._id}`);
      setDeleteDialogOpen(false);
      fetchPurchases();
    } catch (err) {
      console.error("Failed to delete purchase", err);
      alert("فشل في حذف المشترى");
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

  const totalCost = editFormData.quantity && editFormData.unitPrice 
    ? (parseFloat(editFormData.quantity) * parseFloat(editFormData.unitPrice)).toFixed(2)
    : "0.00";

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل المشتريات...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>سجل المشتريات</CardTitle>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد مشتريات مسجلة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <div
                  key={purchase._id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{purchase.category?.name || "غير محدد"}</p>
                      <Badge variant="secondary" className="text-xs">
                        {purchase.quantity} وحدة
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(purchase.purchaseDate)} • {formatCurrency(purchase.unitPrice)} للوحدة
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <p className="font-bold text-lg">{formatCurrency(purchase.totalCost)}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(purchase)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(purchase)}
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
            <DialogTitle>تعديل المشترى</DialogTitle>
          </DialogHeader>

          <form onSubmit={submitEdit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="edit-category">التصنيف *</Label>
              <Select
                value={editFormData.category}
                onValueChange={(value) => setEditFormData({ ...editFormData, category: value })}
                required
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="اختر التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">الكمية *</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={editFormData.quantity}
                  onChange={(e) => setEditFormData({ ...editFormData, quantity: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-unitPrice">سعر الوحدة *</Label>
                <Input
                  id="edit-unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={editFormData.unitPrice}
                  onChange={(e) => setEditFormData({ ...editFormData, unitPrice: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-purchaseDate">تاريخ الشراء *</Label>
              <Input
                id="edit-purchaseDate"
                type="date"
                required
                value={editFormData.purchaseDate}
                onChange={(e) => setEditFormData({ ...editFormData, purchaseDate: e.target.value })}
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">إجمالي التكلفة:</span>
                <span className="text-lg font-bold">{totalCost} ج.م</span>
              </div>
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
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المشترى نهائياً من السجلات.
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