"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Users,
  TrendingUp,
  Filter,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { BASE_URL } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Partner {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  _id: string;
  name: string;
}

interface PartnerProfit {
  _id: string;
  partner: Partner | string;
  activity: Activity | string;
  month: number;
  year: number;
  profit: number;
  createdAt: string;
}

type NotificationType = "success" | "error";

interface Notification {
  show: boolean;
  type: NotificationType;
  message: string;
}

interface DeleteTarget {
  type: "partner" | "profit";
  id: string;
  name: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TAB_STORAGE_KEY = "partners-active-tab";

const months = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth(); // 0-indexed

const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - 5 + i + 1).reverse();

const defaultProfitForm = {
  partner: "",
  activity: "",
  profit: "",
  month: currentMonth,
  year: currentYear,
};

// ─── Helper: read persisted tab safely (SSR-safe) ─────────────────────────────

function getPersistedTab(): string {
  try {
    return localStorage.getItem(TAB_STORAGE_KEY) ?? "partners";
  } catch {
    return "partners";
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PartnersManagementPage() {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [partners, setPartners] = useState<Partner[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [profits, setProfits] = useState<PartnerProfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Tab persistence ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<string>(getPersistedTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    try {
      localStorage.setItem(TAB_STORAGE_KEY, value);
    } catch {
      // ignore
    }
  };

  // ── Filters — start undefined so nothing is appended until user picks ────────
  const [filterYear, setFilterYear] = useState<number | undefined>(currentYear);
  const [filterMonth, setFilterMonth] = useState<number | undefined>(currentMonth);

  // ── Dialog state ─────────────────────────────────────────────────────────────
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  const [profitDialogOpen, setProfitDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [selectedProfit, setSelectedProfit] = useState<PartnerProfit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Form state ───────────────────────────────────────────────────────────────
  const [partnerForm, setPartnerForm] = useState({ name: "" });
  const [profitForm, setProfitForm] = useState(defaultProfitForm);

  // ── Notification ─────────────────────────────────────────────────────────────
  const [notification, setNotification] = useState<Notification>({
    show: false,
    type: "success",
    message: "",
  });

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({ show: true, type, message });
  };

  useEffect(() => {
    if (!notification.show) return;
    const timer = setTimeout(
      () => setNotification({ show: false, type: "success", message: "" }),
      3500
    );
    return () => clearTimeout(timer);
  }, [notification.show]);

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchData = useCallback(
    async (silent = false) => {
      try {
        silent ? setRefreshing(true) : setLoading(true);

        const params = new URLSearchParams();
        if (filterYear !== undefined) params.set("year", String(filterYear));
        if (filterMonth !== undefined) params.set("month", String(filterMonth));
        const query = params.toString() ? `?${params.toString()}` : "";

        const [partnersRes, profitsRes, activitiesRes] = await Promise.all([
          fetch(`${BASE_URL}/partners`),
          fetch(`${BASE_URL}/partners/profits/all${query}`),
          fetch(`${BASE_URL}/activities`),
        ]);

        if (!partnersRes.ok || !profitsRes.ok || !activitiesRes.ok) {
          throw new Error("فشل في جلب البيانات من الخادم");
        }

        const [partnersData, profitsData, activitiesData] = await Promise.all([
          partnersRes.json(),
          profitsRes.json(),
          activitiesRes.json(),
        ]);

        setPartners(partnersData);
        setProfits(profitsData);
        setActivities(activitiesData);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "فشل في تحميل البيانات";
        showNotification("error", message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filterYear, filterMonth]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Derived / filtered data ───────────────────────────────────────────────────

  const filteredProfits = profits.filter((p) => {
    const yearMatch = filterYear === undefined || p.year === filterYear;
    const monthMatch = filterMonth === undefined || p.month === filterMonth;
    return yearMatch && monthMatch;
  });

  const totalFilteredProfit = filteredProfits.reduce((sum, p) => sum + p.profit, 0);

  const isFilterDefault =
    filterYear === currentYear && filterMonth === currentMonth;

  const handleClearFilters = () => {
    setFilterYear(currentYear);
    setFilterMonth(currentMonth);
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const getPartnerId = (v: string | Partner) =>
    typeof v === "object" ? v._id : v;

  const getActivityId = (v: string | Activity) =>
    typeof v === "object" ? v._id : v;

  const getPartnerName = (v: string | Partner) => {
    if (typeof v === "object") return v?.name ?? "غير معروف";
    return partners.find((p) => p._id === v)?.name ?? "غير معروف";
  };

  const getActivityName = (v: string | Activity) => {
    if (typeof v === "object") return v?.name ?? "غير محدد";
    return activities.find((a) => a._id === v)?.name ?? "غير محدد";
  };

  const getFilteredTotalProfit = (partnerId: string) =>
    filteredProfits
      .filter((p) => getPartnerId(p.partner) === partnerId)
      .reduce((sum, p) => sum + p.profit, 0);

  // ── CRUD: Partners ────────────────────────────────────────────────────────────

  const openPartnerDialog = (partner?: Partner) => {
    setSelectedPartner(partner ?? null);
    setPartnerForm({ name: partner?.name ?? "" });
    setPartnerDialogOpen(true);
  };

  const handleSavePartner = async () => {
    if (!partnerForm.name.trim()) {
      showNotification("error", "الرجاء إدخال اسم الشريك");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = selectedPartner
        ? `${BASE_URL}/partners/${selectedPartner._id}`
        : `${BASE_URL}/partners`;
      const method = selectedPartner ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partnerForm),
      });

      if (!res.ok) throw new Error();

      showNotification(
        "success",
        selectedPartner ? "تم تحديث الشريك بنجاح" : "تم إنشاء الشريك بنجاح"
      );
      setPartnerDialogOpen(false);
      setSelectedPartner(null);
      setPartnerForm({ name: "" });
      fetchData(true);
    } catch {
      showNotification(
        "error",
        selectedPartner ? "فشل في تحديث الشريك" : "فشل في إنشاء الشريك"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── CRUD: Profits ─────────────────────────────────────────────────────────────

  const openProfitDialog = (profit?: PartnerProfit) => {
    if (profit) {
      setSelectedProfit(profit);
      setProfitForm({
        partner: getPartnerId(profit.partner),
        activity: getActivityId(profit.activity),
        profit: profit.profit.toString(),
        month: profit.month,
        year: profit.year ?? currentYear,
      });
    } else {
      setSelectedProfit(null);
      setProfitForm(defaultProfitForm);
    }
    setProfitDialogOpen(true);
  };

  const handleSaveProfit = async () => {
    if (!profitForm.partner) {
      showNotification("error", "الرجاء اختيار الشريك");
      return;
    }
    if (!profitForm.activity) {
      showNotification("error", "الرجاء اختيار النشاط");
      return;
    }
    if (!profitForm.profit || isNaN(parseFloat(profitForm.profit))) {
      showNotification("error", "الرجاء إدخال مبلغ صحيح");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = selectedProfit
        ? `${BASE_URL}/partners/profits/${selectedProfit._id}`
        : `${BASE_URL}/partners/profits`;
      const method = selectedProfit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profitForm,
          profit: parseFloat(profitForm.profit),
          year: Number(profitForm.year),
          month: Number(profitForm.month),
        }),
      });

      if (!res.ok) throw new Error();

      showNotification(
        "success",
        selectedProfit ? "تم تحديث الربح بنجاح" : "تم إضافة الربح بنجاح"
      );
      setProfitDialogOpen(false);
      setSelectedProfit(null);
      setProfitForm(defaultProfitForm);
      fetchData(true);
    } catch {
      showNotification(
        "error",
        selectedProfit ? "فشل في تحديث الربح" : "فشل في إضافة الربح"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── CRUD: Delete ──────────────────────────────────────────────────────────────

  const openDeleteDialog = (
    type: "partner" | "profit",
    id: string,
    name: string
  ) => {
    setDeleteTarget({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsSubmitting(true);
    try {
      const url =
        deleteTarget.type === "partner"
          ? `${BASE_URL}/partners/${deleteTarget.id}`
          : `${BASE_URL}/partners/profits/${deleteTarget.id}`;

      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error();

      showNotification(
        "success",
        `تم حذف ${deleteTarget.type === "partner" ? "الشريك" : "سجل الربح"} بنجاح`
      );
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      fetchData(true);
    } catch {
      showNotification("error", "فشل في الحذف، يرجى المحاولة مرة أخرى");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Filter bar component (shared between tabs) ────────────────────────────────

  const FilterBar = ({ idPrefix }: { idPrefix: string }) => (
    <Card className="p-4 border-dashed">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex items-center gap-1 text-muted-foreground mt-5">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">فلترة</span>
        </div>

        <div className="grid gap-1">
          <Label htmlFor={`${idPrefix}-year`} className="text-xs text-muted-foreground">
            السنة
          </Label>
          <select
            id={`${idPrefix}-year`}
            className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={filterYear ?? ""}
            onChange={(e) =>
              setFilterYear(e.target.value ? Number(e.target.value) : undefined)
            }
          >
            <option value="">الكل</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-1">
          <Label htmlFor={`${idPrefix}-month`} className="text-xs text-muted-foreground">
            الشهر
          </Label>
          <select
            id={`${idPrefix}-month`}
            className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={filterMonth ?? ""}
            onChange={(e) =>
              setFilterMonth(e.target.value !== "" ? Number(e.target.value) : undefined)
            }
          >
            <option value="">الكل</option>
            {months.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 mt-5">
          {!isFilterDefault && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="gap-1 h-9">
              <X className="h-3 w-3" />
              إعادة تعيين
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="gap-1 h-9"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
            تحديث
          </Button>
        </div>

        <span className="text-sm text-muted-foreground mt-5 mr-auto">
          {filteredProfits.length} سجل
        </span>
      </div>
    </Card>
  );

  // ── Loading screen ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">جاري تحميل البيانات...</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto py-8 px-4" dir="rtl">

      {/* ── Toast Notification ── */}
      {notification.show && (
        <div
          className={`fixed top-4 left-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 max-w-sm ${
            notification.type === "success"
              ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <p className="text-sm font-medium flex-1">{notification.message}</p>
          <button
            onClick={() => setNotification({ show: false, type: "success", message: "" })}
            className="text-current opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">إدارة الشركاء</h1>
        <p className="text-muted-foreground text-sm">إدارة الشركاء وتتبع أرباحهم الشهرية</p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الشركاء</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{partners.length}</div>
            <p className="text-xs text-muted-foreground mt-1">شريك مسجل</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              عدد السجلات
              {filterMonth !== undefined && filterYear !== undefined && (
                <span className="font-normal"> — {months[filterMonth]} {filterYear}</span>
              )}
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredProfits.length}</div>
            <p className="text-xs text-muted-foreground mt-1">سجل ربح</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الأرباح
              {filterMonth !== undefined && filterYear !== undefined && (
                <span className="font-normal"> — {months[filterMonth]} {filterYear}</span>
              )}
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-950 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalFilteredProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">جنيه مصري</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="partners" className="flex-1 sm:flex-none gap-2">
            <Users className="h-4 w-4" />
            الشركاء
            <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
              {partners.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="profits" className="flex-1 sm:flex-none gap-2">
            <DollarSign className="h-4 w-4" />
            الأرباح
            <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
              {filteredProfits.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* ── Partners Tab ── */}
        <TabsContent value="partners" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">قائمة الشركاء</h2>
            <Button onClick={() => openPartnerDialog()} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة شريك
            </Button>
          </div>

          <FilterBar idPrefix="partners" />

          <Card>
            <CardContent className="p-0">
              {partners.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                  <Users className="h-10 w-10 opacity-30" />
                  <p className="text-sm">لا يوجد شركاء بعد</p>
                  <Button variant="outline" size="sm" onClick={() => openPartnerDialog()}>
                    إضافة أول شريك
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="text-right font-semibold">الاسم</TableHead>
                      <TableHead className="text-right font-semibold">
                        إجمالي الربح
                        {filterMonth !== undefined && filterYear !== undefined && (
                          <span className="font-normal text-muted-foreground text-xs mr-1">
                            ({months[filterMonth]} {filterYear})
                          </span>
                        )}
                      </TableHead>
                      <TableHead className="text-right font-semibold w-24">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.map((partner) => {
                      const total = getFilteredTotalProfit(partner._id);
                      return (
                        <TableRow key={partner._id} className="group">
                          <TableCell className="font-medium text-right">{partner.name}</TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={total > 0 ? "default" : "secondary"}
                              className="font-mono tabular-nums"
                            >
                              {total.toFixed(2)} ج.م
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openPartnerDialog(partner)}
                                title="تعديل"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() =>
                                  openDeleteDialog("partner", partner._id, partner.name)
                                }
                                title="حذف"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Profits Tab ── */}
        <TabsContent value="profits" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">سجلات الأرباح</h2>
            <Button onClick={() => openProfitDialog()} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة ربح
            </Button>
          </div>

          <FilterBar idPrefix="profits" />

          <Card>
            <CardContent className="p-0">
              {filteredProfits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                  <DollarSign className="h-10 w-10 opacity-30" />
                  <p className="text-sm">
                    {filterMonth !== undefined && filterYear !== undefined
                      ? `لا توجد سجلات لـ ${months[filterMonth]} ${filterYear}`
                      : "لا توجد سجلات أرباح"}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => openProfitDialog()}>
                    إضافة سجل ربح
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="text-right font-semibold">الشريك</TableHead>
                      <TableHead className="text-right font-semibold">الشهر / السنة</TableHead>
                      <TableHead className="text-right font-semibold">النشاط</TableHead>
                      <TableHead className="text-right font-semibold">الربح</TableHead>
                      <TableHead className="text-right font-semibold w-24">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfits.map((profit) => (
                      <TableRow key={profit._id} className="group">
                        <TableCell className="font-medium text-right">
                          {getPartnerName(profit.partner)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {months[profit.month]} {profit.year ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{getActivityName(profit.activity)}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={profit.profit >= 0 ? "default" : "destructive"}
                            className="font-mono tabular-nums"
                          >
                            {profit.profit.toFixed(2)} ج.م
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openProfitDialog(profit)}
                              title="تعديل"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() =>
                                openDeleteDialog(
                                  "profit",
                                  profit._id,
                                  `${getPartnerName(profit.partner)} — ${profit.profit.toFixed(2)} ج.م`
                                )
                              }
                              title="حذف"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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
        </TabsContent>
      </Tabs>

      {/* ── Partner Dialog ── */}
      <Dialog open={partnerDialogOpen} onOpenChange={setPartnerDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{selectedPartner ? "تعديل شريك" : "إضافة شريك جديد"}</DialogTitle>
            <DialogDescription>
              {selectedPartner
                ? "قم بتحديث معلومات الشريك"
                : "أدخل اسم الشريك الجديد لإضافته"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="partner-name">الاسم *</Label>
              <Input
                id="partner-name"
                value={partnerForm.name}
                onChange={(e) => setPartnerForm({ name: e.target.value })}
                placeholder="اسم الشريك"
                onKeyDown={(e) => e.key === "Enter" && handleSavePartner()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setPartnerDialogOpen(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button onClick={handleSavePartner} disabled={isSubmitting}>
              {isSubmitting && <RefreshCw className="h-3.5 w-3.5 animate-spin ml-2" />}
              {selectedPartner ? "حفظ التعديلات" : "إنشاء"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Profit Dialog ── */}
      <Dialog open={profitDialogOpen} onOpenChange={setProfitDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{selectedProfit ? "تعديل سجل ربح" : "إضافة سجل ربح جديد"}</DialogTitle>
            <DialogDescription>
              {selectedProfit ? "تحديث بيانات سجل الربح" : "أدخل بيانات الربح الجديد"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Partner */}
            <div className="grid gap-2">
              <Label htmlFor="profit-partner">الشريك *</Label>
              <select
                id="profit-partner"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={profitForm.partner}
                onChange={(e) => setProfitForm({ ...profitForm, partner: e.target.value })}
              >
                <option value="">اختر شريك</option>
                {partners.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Activity */}
            <div className="grid gap-2">
              <Label htmlFor="profit-activity">النشاط *</Label>
              <select
                id="profit-activity"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={profitForm.activity}
                onChange={(e) => setProfitForm({ ...profitForm, activity: e.target.value })}
              >
                <option value="">اختر النشاط</option>
                {activities.map((a) => (
                  <option key={a._id} value={a._id}>{a.name}</option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="grid gap-2">
              <Label htmlFor="profit-amount">مبلغ الربح *</Label>
              <div className="relative">
                <Input
                  id="profit-amount"
                  type="number"
                  step="0.01"
                  value={profitForm.profit}
                  onChange={(e) => setProfitForm({ ...profitForm, profit: e.target.value })}
                  placeholder="0.00"
                  className="pl-12"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                  ج.م
                </span>
              </div>
            </div>

            {/* Month + Year */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="profit-month">الشهر *</Label>
                <select
                  id="profit-month"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={profitForm.month}
                  onChange={(e) =>
                    setProfitForm({ ...profitForm, month: Number(e.target.value) })
                  }
                >
                  {months.map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="profit-year">السنة *</Label>
                <select
                  id="profit-year"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={profitForm.year}
                  onChange={(e) =>
                    setProfitForm({ ...profitForm, year: Number(e.target.value) })
                  }
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setProfitDialogOpen(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button onClick={handleSaveProfit} disabled={isSubmitting}>
              {isSubmitting && <RefreshCw className="h-3.5 w-3.5 animate-spin ml-2" />}
              {selectedProfit ? "حفظ التعديلات" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>تأكيد الحذف</DialogTitle>
            </div>
            <DialogDescription className="text-right leading-relaxed">
              هل أنت متأكد من حذف{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span>
              {deleteTarget?.type === "partner" && (
                <span className="block mt-1 text-destructive text-xs">
                  ⚠️ سيتم حذف جميع سجلات الأرباح المرتبطة بهذا الشريك نهائياً
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting && <RefreshCw className="h-3.5 w-3.5 animate-spin ml-2" />}
              حذف نهائياً
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}