"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";
import { Moon, Sun, Plus, Trash2, Coins, TrendingUp, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Currency {
  _id: string;
  code: string;
  name: string;
  exchangeRate: number;
}

export default function CurrencyPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    exchangeRate: "",
  });

  const [editForm, setEditForm] = useState({
    code: "",
    name: "",
    exchangeRate: "",
  });

  const fetchCurrencies = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/currencies`);
      setCurrencies(res.data);
    } catch (error) {
      console.error("Failed to fetch currencies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/currencies`, {
        ...form,
        exchangeRate: Number(form.exchangeRate),
      });

      setForm({ code: "", name: "", exchangeRate: "" });
      setIsDialogOpen(false);
      fetchCurrencies();
    } catch (error) {
      console.error("Failed to add currency:", error);
    }
  };

  const handleEdit = (currency: Currency) => {
    setEditingCurrency(currency);
    setEditForm({
      code: currency.code,
      name: currency.name,
      exchangeRate: currency.exchangeRate.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCurrency) return;

    try {
      await axios.patch(`${BASE_URL}/currencies/${editingCurrency._id}`, {
        ...editForm,
        exchangeRate: Number(editForm.exchangeRate),
      });

      setEditForm({ code: "", name: "", exchangeRate: "" });
      setEditingCurrency(null);
      setIsEditDialogOpen(false);
      fetchCurrencies();
    } catch (error) {
      console.error("Failed to update currency:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه العملة؟")) {
      return;
    }
    try {
      await axios.delete(`${BASE_URL}/currencies/${id}`);
      fetchCurrencies();
    } catch (error) {
      console.error("Failed to delete currency:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-400/10 dark:bg-violet-600/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative p-4 sm:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top duration-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl shadow-lg">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                إدارة العملات
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                تتبع وإدارة أسعار الصرف
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-2xl animate-in fade-in slide-in-from-bottom duration-700 delay-200 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">قائمة العملات</CardTitle>
                <CardDescription className="mt-1">
                  عرض وإدارة جميع العملات المتاحة
                </CardDescription>
              </div>

              {/* Add Currency Dialog */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة عملة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">إضافة عملة جديدة</DialogTitle>
                    <DialogDescription>
                      أدخل تفاصيل العملة الجديدة أدناه
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="code" className="text-base">
                        كود العملة
                      </Label>
                      <Input
                        id="code"
                        placeholder="مثال: USD"
                        value={form.code}
                        onChange={(e) =>
                          setForm({ ...form, code: e.target.value.toUpperCase() })
                        }
                        required
                        className="h-12 text-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-base">
                        اسم العملة
                      </Label>
                      <Input
                        id="name"
                        placeholder="مثال: الدولار الأمريكي"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        required
                        className="h-12 text-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rate" className="text-base">
                        سعر الصرف (بالجنيه المصري)
                      </Label>
                      <Input
                        id="rate"
                        placeholder="مثال: 49.50"
                        type="number"
                        step="0.01"
                        value={form.exchangeRate}
                        onChange={(e) =>
                          setForm({ ...form, exchangeRate: e.target.value })
                        }
                        required
                        className="h-12 text-lg"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-lg"
                    >
                      إضافة العملة
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    جار التحميل...
                  </p>
                </div>
              </div>
            ) : currencies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                  <Coins className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-300">
                  لا توجد عملات
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  ابدأ بإضافة عملة جديدة
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b-2">
                    <TableHead className="font-bold text-base text-start">كود العملة</TableHead>
                    <TableHead className="font-bold text-base text-start">الاسم</TableHead>
                    <TableHead className="font-bold text-base text-start">
                      سعر الصرف
                    </TableHead>
                    <TableHead className="font-bold text-base text-start">
                      الإجراءات
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currencies.map((currency, index) => (
                    <TableRow
                      key={currency._id}
                      className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200"
                      style={{
                        animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                      }}
                    >
                      <TableCell className="font-mono font-bold text-lg flex-start">
                        <Badge
                          variant="secondary"
                          className="text-base px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                        >
                          {currency.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-base font-medium flex-start">
                        {currency.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-lg font-semibold">
                            {currency.exchangeRate.toFixed(2)}
                          </span>
                          <span className="text-sm text-slate-500">ج.م</span>
                        </div>
                      </TableCell>
                      <TableCell className="flex-start">
                        <div className="flex items-center gap-2  transition-all duration-300">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(currency)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            تعديل
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(currency._id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            حذف
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Currency Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Edit className="w-6 h-6 text-blue-600" />
              تعديل العملة
            </DialogTitle>
            <DialogDescription>
              قم بتحديث تفاصيل العملة أدناه
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-code" className="text-base">
                كود العملة
              </Label>
              <Input
                id="edit-code"
                placeholder="مثال: USD"
                value={editForm.code}
                onChange={(e) =>
                  setEditForm({ ...editForm, code: e.target.value.toUpperCase() })
                }
                required
                className="h-12 text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-base">
                اسم العملة
              </Label>
              <Input
                id="edit-name"
                placeholder="مثال: الدولار الأمريكي"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                required
                className="h-12 text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rate" className="text-base">
                سعر الصرف (بالجنيه المصري)
              </Label>
              <Input
                id="edit-rate"
                placeholder="مثال: 49.50"
                type="number"
                step="0.01"
                value={editForm.exchangeRate}
                onChange={(e) =>
                  setEditForm({ ...editForm, exchangeRate: e.target.value })
                }
                required
                className="h-12 text-lg"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1 h-12 text-lg"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-lg"
              >
                حفظ التعديلات
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
