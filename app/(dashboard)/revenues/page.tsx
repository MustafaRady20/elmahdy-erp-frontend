"use client";

import { useState, useEffect } from "react";
import axios from "axios";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Select from "react-select";
import { BASE_URL } from "@/lib/constants";
import {
  TrendingUp,
  Plus,
  Eye,
  Calendar,
  DollarSign,
  Activity as ActivityIcon,
  User,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Edit,
  Trash2,
  Coins,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CurrencyEntry {
  currency: string; // currency _id
  amount: number;
  exchangeRate: number;
}

interface EmployeeRevenue {
  _id: string;
  total: number;
  employee: {
    _id: string;
    name: string;
  };
}

interface EmployeeRevenueDetail {
  _id: string;
  activity: { _id: string; name: string };
  currencies: {
    currency: { _id: string; name: string; code: string };
    amount: number;
    exchangeRate: number;
  }[];
  date: string;
  totalEGPAmount?: number; // optional pre-computed total in EGP from backend
}

interface Employee {
  _id: string;
  name: string;
}

interface Activity {
  _id: string;
  name: string;
}

interface Currency {
  _id: string;
  name: string;
  code: string;
}

// ─── Reusable Multi-Currency Input ────────────────────────────────────────────

interface MultiCurrencyInputProps {
  entries: CurrencyEntry[];
  onChange: (entries: CurrencyEntry[]) => void;
  currencies: Currency[];
  selectStyles: any;
}

function MultiCurrencyInput({ entries, onChange, currencies, selectStyles }: MultiCurrencyInputProps) {
  const addEntry = () => {
    onChange([...entries, { currency: "", amount: 0, exchangeRate: 0 }]);
  };

  const removeEntry = (index: number) => {
    onChange(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof CurrencyEntry, value: string | number) => {
    onChange(
      entries.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      )
    );
  };

  // currencies already used (to optionally disable duplicates)
  const usedCurrencyIds = entries.map((e) => e.currency).filter(Boolean);

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry, index) => (
        <div
          key={index}
          className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3"
        >
          {/* Row label */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              العملة {index + 1}
            </span>
            {entries.length > 1 && (
              <button
                type="button"
                onClick={() => removeEntry(index)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Currency Select */}
          <Select
            options={currencies.map((c) => ({
              value: c._id,
              label: `${c.name} (${c.code})`,
              isDisabled: usedCurrencyIds.includes(c._id) && entry.currency !== c._id,
            }))}
            value={
              entry.currency
                ? {
                    value: entry.currency,
                    label: currencies.find((c) => c._id === entry.currency)
                      ? `${currencies.find((c) => c._id === entry.currency)!.name} (${currencies.find((c) => c._id === entry.currency)!.code})`
                      : "",
                  }
                : null
            }
            onChange={(val: any) => updateEntry(index, "currency", val?.value || "")}
            placeholder="اختر العملة"
            styles={selectStyles}
            isSearchable
            isOptionDisabled={(option: any) => option.isDisabled}
          />

          {/* Amount + Exchange Rate row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-slate-600 dark:text-slate-400">
                المبلغ <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="المبلغ"
                value={entry.amount || ""}
                onChange={(e) => updateEntry(index, "amount", Number(e.target.value))}
                className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600 dark:text-slate-400">
                سعر الصرف <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="سعر الصرف"
                value={entry.exchangeRate || ""}
                onChange={(e) => updateEntry(index, "exchangeRate", Number(e.target.value))}
                className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* EGP preview */}
          {entry.amount && entry.exchangeRate ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              = {(entry.amount * entry.exchangeRate).toLocaleString()} جنيه مصري
            </p>
          ) : null}
        </div>
      ))}

      <Button
        type="button"
        onClick={addEntry}
        variant="outline"
        size="sm"
        className="w-full border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
      >
        <Plus className="w-4 h-4 ml-2" />
        إضافة عملة أخرى
      </Button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RevenuePage() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [data, setData] = useState<EmployeeRevenue[]>([]);
  const [loading, setLoading] = useState(false);

  // Date filters
  const [filterYear, setFilterYear] = useState<string>("");
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");

  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRevenue | null>(null);
  const [details, setDetails] = useState<EmployeeRevenueDetail[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Lookup data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  // ── Add Revenue (global) ──
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState<string | null>(null);
  const [newActivity, setNewActivity] = useState<string | null>(null);
  const [newCurrencies, setNewCurrencies] = useState<CurrencyEntry[]>([{ currency: "", amount: 0, exchangeRate: 0 }]);
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  // ── Add Revenue (per-employee detail modal) ──
  const [addEmployeeRevenueDialogOpen, setAddEmployeeRevenueDialogOpen] = useState(false);
  const [addEmployeeActivity, setAddEmployeeActivity] = useState<string | null>(null);
  const [addEmployeeCurrencies, setAddEmployeeCurrencies] = useState<CurrencyEntry[]>([{ currency: "", amount: 0, exchangeRate: 0 }]);
  const [addEmployeeDate, setAddEmployeeDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // ── Edit Revenue ──
  const [editingRevenue, setEditingRevenue] = useState<EmployeeRevenueDetail | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editActivity, setEditActivity] = useState<string>("");
  const [editCurrencies, setEditCurrencies] = useState<CurrencyEntry[]>([]);
  const [editDate, setEditDate] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  // ─── Styles ─────────────────────────────────────────────────────────────────

  const selectStyles = {
    control: (styles: any, { isFocused }: any) => ({
      ...styles,
      backgroundColor: "hsl(var(--background))",
      borderColor: isFocused ? "hsl(var(--ring))" : "hsl(var(--border))",
      color: "hsl(var(--foreground))",
      boxShadow: isFocused ? "0 0 0 1px hsl(var(--ring))" : "none",
      "&:hover": { borderColor: "hsl(var(--ring))" },
    }),
    menu: (styles: any) => ({
      ...styles,
      backgroundColor: "hsl(var(--background))",
      border: "1px solid hsl(var(--border))",
      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
      zIndex: 99999,
    }),
    menuPortal: (styles: any) => ({ ...styles, zIndex: 99999 }),
    menuList: (styles: any) => ({
      ...styles,
      backgroundColor: "gray",
      padding: 0,
      maxHeight: "200px",
      overflowY: "auto",
    }),
    singleValue: (styles: any) => ({ ...styles, color: "hsl(var(--foreground))" }),
    option: (styles: any, { isSelected, isFocused }: any) => ({
      ...styles,
      backgroundColor: isSelected
        ? "hsl(var(--primary))"
        : isFocused
        ? "hsl(var(--accent))"
        : "hsl(var(--background))",
      color: isSelected ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
      cursor: "pointer",
      "&:active": { backgroundColor: "hsl(var(--primary))" },
    }),
    input: (styles: any) => ({ ...styles, color: "hsl(var(--foreground))" }),
    placeholder: (styles: any) => ({ ...styles, color: "hsl(var(--muted-foreground))" }),
  };

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append("period", period);
    if (filterYear) params.append("year", filterYear);
    if (filterMonth) params.append("month", filterMonth);
    if (filterDate) params.append("date", filterDate);
    return params.toString();
  };

  /** Validate that every currency row is fully filled */
  const validateCurrencies = (entries: CurrencyEntry[]): boolean =>
    entries.length > 0 &&
    entries.every((e) => e.currency && e.amount > 0 && e.exchangeRate > 0);

  /** Compute total EGP preview from local entries */
  const computeTotalEGP = (entries: CurrencyEntry[]): number =>
    entries.reduce((sum, e) => sum + (e.amount || 0) * (e.exchangeRate || 0), 0);

  // ─── API calls ──────────────────────────────────────────────────────────────

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/emp-revenue/report?${buildQueryParams()}`);
      setData(res.data.revenueByEmployee || []);
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async (employeeId: string, pageNum: number) => {
    setLoadingDetails(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/emp-revenue/employee/${employeeId}?page=${pageNum}&limit=${limit}`
      );
      setDetails(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("خطأ في جلب التفاصيل:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchEmployeesActivitiesAndCurrencies = async () => {
    try {
      const [empRes, actRes, currRes] = await Promise.all([
        axios.get(`${BASE_URL}/employees`),
        axios.get(`${BASE_URL}/activities`),
        axios.get(`${BASE_URL}/currencies`),
      ]);
      setEmployees(empRes.data || []);
      setActivities(actRes.data || []);
      setCurrencies(currRes.data || []);
    } catch (error) {
      console.error("خطأ في جلب الموظفين أو الأنشطة أو العملات:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchEmployeesActivitiesAndCurrencies();
  }, [period, filterYear, filterMonth, filterDate]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const openEmployeeDetails = (emp: EmployeeRevenue) => {
    setSelectedEmployee(emp);
    setPage(1);
    fetchDetails(emp.employee._id, 1);
  };

  const handlePageChange = (newPage: number) => {
    if (!selectedEmployee) return;
    setPage(newPage);
    fetchDetails(selectedEmployee.employee._id, newPage);
  };

  /** Global "Add Revenue" */
  const handleSaveNewRevenue = async () => {
    if (!newEmployee || !newActivity || !validateCurrencies(newCurrencies)) {
      alert("يرجى ملء جميع الحقول المطلوبة بشكل صحيح");
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${BASE_URL}/emp-revenue`, {
        employee: newEmployee,
        activity: newActivity,
        currencies: newCurrencies,
        date: newDate,
      });
      // reset
      setNewEmployee(null);
      setNewActivity(null);
      setNewCurrencies([{ currency: "", amount: 0, exchangeRate: 0 }]);
      setNewDate(new Date().toISOString().split("T")[0]);
      setAddDialogOpen(false);
      fetchData();
      alert("تم إضافة الإيراد بنجاح");
    } catch (error) {
      console.error("خطأ في حفظ الإيراد:", error);
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  /** Per-employee detail modal "Add Revenue" */
  const handleAddEmployeeRevenue = async () => {
    if (!selectedEmployee || !addEmployeeActivity || !validateCurrencies(addEmployeeCurrencies)) {
      alert("يرجى ملء جميع الحقول المطلوبة بشكل صحيح");
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${BASE_URL}/emp-revenue`, {
        employee: selectedEmployee.employee._id,
        activity: addEmployeeActivity,
        currencies: addEmployeeCurrencies,
        date: addEmployeeDate,
      });
      // reset
      setAddEmployeeActivity(null);
      setAddEmployeeCurrencies([{ currency: "", amount: 0, exchangeRate: 0 }]);
      setAddEmployeeDate(new Date().toISOString().split("T")[0]);
      setAddEmployeeRevenueDialogOpen(false);
      fetchDetails(selectedEmployee.employee._id, page);
      fetchData();
      alert("تم إضافة الإيراد بنجاح");
    } catch (error) {
      console.error("خطأ في حفظ الإيراد:", error);
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  /** Open edit dialog pre-filled */
  const handleEditRevenue = (revenue: EmployeeRevenueDetail) => {
    setEditingRevenue(revenue);
    setEditActivity(revenue.activity._id);
    setEditDate(revenue.date.split("T")[0]);
    // Map populated currency objects back to CurrencyEntry shape
    setEditCurrencies(
      revenue.currencies.map((c) => ({
        currency: c.currency._id,
        amount: c.amount,
        exchangeRate: c.exchangeRate,
      }))
    );
    setEditDialogOpen(true);
  };

  /** Submit edit */
  const handleUpdateRevenue = async () => {
    if (!editingRevenue || !editActivity || !validateCurrencies(editCurrencies)) {
      alert("يرجى ملء جميع الحقول المطلوبة بشكل صحيح");
      return;
    }
    setUpdating(true);
    try {
      await axios.patch(`${BASE_URL}/emp-revenue/${editingRevenue._id}`, {
        activity: editActivity,
        currencies: editCurrencies,
        date: editDate,
      });
      setEditDialogOpen(false);
      setEditingRevenue(null);
      if (selectedEmployee) fetchDetails(selectedEmployee.employee._id, page);
      fetchData();
      alert("تم تحديث الإيراد بنجاح");
    } catch (error) {
      console.error("خطأ في تحديث الإيراد:", error);
      alert("حدث خطأ أثناء التحديث");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteRevenue = async (revenueId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإيراد؟")) return;
    try {
      await axios.delete(`${BASE_URL}/emp-revenue/${revenueId}`);
      if (selectedEmployee) fetchDetails(selectedEmployee.employee._id, page);
      fetchData();
      alert("تم حذف الإيراد بنجاح");
    } catch (error) {
      console.error("خطأ في حذف الإيراد:", error);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const clearFilters = () => {
    setFilterYear("");
    setFilterMonth("");
    setFilterDate("");
  };

  const getTotalRevenue = () => data.reduce((sum, emp) => sum + emp.total, 0);

  const getPeriodLabel = () => {
    const labels = { daily: "يومي", weekly: "أسبوعي", monthly: "شهري", yearly: "سنوي" };
    return labels[period];
  };

  const hasActiveFilters = filterYear || filterMonth || filterDate;

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  }));

  const monthOptions = [
    { value: "1", label: "يناير" },
    { value: "2", label: "فبراير" },
    { value: "3", label: "مارس" },
    { value: "4", label: "أبريل" },
    { value: "5", label: "مايو" },
    { value: "6", label: "يونيو" },
    { value: "7", label: "يوليو" },
    { value: "8", label: "أغسطس" },
    { value: "9", label: "سبتمبر" },
    { value: "10", label: "أكتوبر" },
    { value: "11", label: "نوفمبر" },
    { value: "12", label: "ديسمبر" },
  ];

  // ─── Reusable form body (shared between the 3 dialogs) ────────────────────

  const SharedFormFooter = ({
    onSubmit,
    onClose,
    isLoading,
    loadingLabel,
    submitLabel,
    submitIcon,
    gradientFrom = "from-emerald-600",
    gradientTo = "to-cyan-600",
    hoverFrom = "hover:from-emerald-700",
    hoverTo = "hover:to-cyan-700",
  }: {
    onSubmit: () => void;
    onClose?: () => void;
    isLoading: boolean;
    loadingLabel: string;
    submitLabel: string;
    submitIcon: React.ReactNode;
    gradientFrom?: string;
    gradientTo?: string;
    hoverFrom?: string;
    hoverTo?: string;
  }) => (
    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
      <DialogClose asChild>
        <Button
          variant="outline"
          className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          إلغاء
        </Button>
      </DialogClose>
      <Button
        onClick={onSubmit}
        disabled={isLoading}
        className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} ${hoverFrom} ${hoverTo} text-white`}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
            {loadingLabel}
          </>
        ) : (
          <>
            {submitIcon}
            {submitLabel}
          </>
        )}
      </Button>
    </div>
  );

  // ─── JSX ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-l from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
              إيرادات الموظفين
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              متابعة وإدارة إيرادات الموظفين حسب الفترة
            </p>
          </div>

          {/* ── Global Add Dialog ── */}
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-lg">
                <Plus className="w-4 h-4 ml-2" />
                إضافة إيراد جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                    <Plus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  إضافة إيراد جديد
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-4 mt-4">
                {/* Employee */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    الموظف <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    options={employees.map((e) => ({ value: e._id, label: e.name }))}
                    value={newEmployee ? { value: newEmployee, label: employees.find((e) => e._id === newEmployee)?.name || "" } : null}
                    onChange={(val: any) => setNewEmployee(val.value)}
                    placeholder="اختر الموظف"
                    styles={selectStyles}
                    isSearchable
                  />
                </div>

                {/* Activity */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <ActivityIcon className="w-4 h-4" />
                    النشاط <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    options={activities.map((a) => ({ value: a._id, label: a.name }))}
                    value={newActivity ? { value: newActivity, label: activities.find((a) => a._id === newActivity)?.name || "" } : null}
                    onChange={(val: any) => setNewActivity(val.value)}
                    placeholder="اختر النشاط"
                    styles={selectStyles}
                    isSearchable
                  />
                </div>

                {/* Multi-Currency */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    العملات والمبالغ <span className="text-red-500">*</span>
                  </Label>
                  <MultiCurrencyInput
                    entries={newCurrencies}
                    onChange={setNewCurrencies}
                    currencies={currencies}
                    selectStyles={selectStyles}
                  />
                  {/* Total EGP preview */}
                  {computeTotalEGP(newCurrencies) > 0 && (
                    <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                      <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold text-right">
                        الإجمالي بالجنيه المصري: {computeTotalEGP(newCurrencies).toLocaleString()} جنيه
                      </p>
                    </div>
                  )}
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    التاريخ
                  </Label>
                  <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <SharedFormFooter
                  onSubmit={handleSaveNewRevenue}
                  isLoading={saving}
                  loadingLabel="جاري الحفظ..."
                  submitLabel="حفظ"
                  submitIcon={<Plus className="w-4 h-4 ml-2" />}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* ── Statistics Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-emerald-200 dark:border-emerald-500/20 bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-slate-800 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">إجمالي الإيرادات</CardTitle>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {getTotalRevenue().toLocaleString()} جنيه
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">إجمالي إيرادات جميع الموظفين</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-cyan-200 dark:border-cyan-500/20 bg-gradient-to-br from-white to-cyan-50 dark:from-slate-900 dark:to-slate-800 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">عدد الموظفين</CardTitle>
              <div className="p-2 bg-cyan-100 dark:bg-cyan-500/10 rounded-lg">
                <User className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{data.length}</div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">موظف لديه إيرادات</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 dark:border-purple-500/20 bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-slate-800 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">الفترة الحالية</CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-500/10 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{getPeriodLabel()}</div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">عرض البيانات حسب الفترة</p>
            </CardContent>
          </Card>
        </div>

        {/* ── Filters ── */}
        <Card className="shadow-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                الفلاتر والتصفية
              </CardTitle>
              {hasActiveFilters && (
                <Badge className="bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30">فلاتر نشطة</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">الفترة الزمنية</Label>
                <Select
                  options={[
                    { value: "daily", label: "يومي" },
                    { value: "weekly", label: "أسبوعي" },
                    { value: "monthly", label: "شهري" },
                    { value: "yearly", label: "سنوي" },
                  ]}
                  value={{ value: period, label: getPeriodLabel() }}
                  onChange={(val: any) => setPeriod(val.value)}
                  styles={selectStyles}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">السنة</Label>
                <Select
                  options={yearOptions}
                  value={filterYear ? { value: filterYear, label: filterYear } : null}
                  onChange={(val: any) => setFilterYear(val?.value || "")}
                  placeholder="اختر السنة"
                  styles={selectStyles}
                  isClearable
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">الشهر</Label>
                <Select
                  options={monthOptions}
                  value={filterMonth ? monthOptions.find((m) => m.value === filterMonth) : null}
                  onChange={(val: any) => setFilterMonth(val?.value || "")}
                  placeholder="اختر الشهر"
                  styles={selectStyles}
                  isClearable
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">تاريخ محدد</Label>
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X className="w-4 h-4 ml-2" />
                  إعادة تعيين الفلاتر
                </Button>
              </div>
            )}

            {hasActiveFilters && (
              <div className="mt-4 p-3 bg-cyan-50 dark:bg-cyan-500/10 rounded-lg border border-cyan-200 dark:border-cyan-500/20">
                <p className="text-sm text-cyan-700 dark:text-cyan-300 text-right">
                  الفلاتر النشطة:
                  {filterYear && (
                    <Badge className="mr-2 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30">السنة: {filterYear}</Badge>
                  )}
                  {filterMonth && (
                    <Badge className="mr-2 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30">
                      الشهر: {monthOptions.find((m) => m.value === filterMonth)?.label}
                    </Badge>
                  )}
                  {filterDate && (
                    <Badge className="mr-2 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30">
                      التاريخ: {new Date(filterDate).toLocaleDateString("ar-EG")}
                    </Badge>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Main Table ── */}
        <Card className="shadow-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700">
            <CardTitle className="text-slate-900 dark:text-white">إيرادات الموظفين ({data.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800">
                    <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">الموظف</TableHead>
                    <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">إجمالي الإيرادات</TableHead>
                    <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">الإجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-12 h-12 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin"></div>
                          <p className="text-slate-600 dark:text-slate-400">جاري التحميل...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-10 h-10 text-slate-400 dark:text-slate-600" />
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 font-medium">لا توجد بيانات</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((emp, index) => (
                      <TableRow
                        key={emp._id}
                        className={`border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${
                          index % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-900/50"
                        }`}
                      >
                        <TableCell className="text-center">
                          <Badge className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30">
                            {emp.employee.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{emp?.total?.toLocaleString()}</span>
                          <span className="text-slate-500 dark:text-slate-500 text-sm mr-1">جنيه</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {/* ── Employee Detail Dialog ── */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                onClick={() => openEmployeeDetails(emp)}
                                variant="outline"
                                size="sm"
                                className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                              >
                                <Eye className="w-4 h-4 ml-2" />
                                عرض التفاصيل
                              </Button>
                            </DialogTrigger>
                            <DialogContent className=" !max-w-none !w-[50vw] max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                              <DialogHeader>
                                <div className="flex items-center justify-between">
                                  <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                                    تفاصيل الإيرادات - {emp.employee.name}
                                  </DialogTitle>

                                  {/* ── Per-employee Add Dialog ── */}
                                  <Dialog open={addEmployeeRevenueDialogOpen} onOpenChange={setAddEmployeeRevenueDialogOpen}>
                                    <DialogTrigger asChild>
                                      <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white">
                                        <Plus className="w-4 h-4 ml-2" />
                                        إضافة إيراد
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                                          إضافة إيراد لـ {emp.employee.name}
                                        </DialogTitle>
                                      </DialogHeader>

                                      <div className="flex flex-col gap-4 mt-4">
                                        {/* Activity */}
                                        <div className="space-y-2">
                                          <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <ActivityIcon className="w-4 h-4" />
                                            النشاط <span className="text-red-500">*</span>
                                          </Label>
                                          <Select
                                            options={activities.map((a) => ({ value: a._id, label: a.name }))}
                                            value={addEmployeeActivity ? { value: addEmployeeActivity, label: activities.find((a) => a._id === addEmployeeActivity)?.name || "" } : null}
                                            onChange={(val: any) => setAddEmployeeActivity(val.value)}
                                            placeholder="اختر النشاط"
                                            styles={selectStyles}
                                            isSearchable
                                          />
                                        </div>

                                        {/* Multi-Currency */}
                                        <div className="space-y-2">
                                          <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <Coins className="w-4 h-4" />
                                            العملات والمبالغ <span className="text-red-500">*</span>
                                          </Label>
                                          <MultiCurrencyInput
                                            entries={addEmployeeCurrencies}
                                            onChange={setAddEmployeeCurrencies}
                                            currencies={currencies}
                                            selectStyles={selectStyles}
                                          />
                                          {computeTotalEGP(addEmployeeCurrencies) > 0 && (
                                            <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                                              <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold text-right">
                                                الإجمالي بالجنيه المصري: {computeTotalEGP(addEmployeeCurrencies).toLocaleString()} جنيه
                                              </p>
                                            </div>
                                          )}
                                        </div>

                                        {/* Date */}
                                        <div className="space-y-2">
                                          <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            التاريخ
                                          </Label>
                                          <Input
                                            type="date"
                                            value={addEmployeeDate}
                                            onChange={(e) => setAddEmployeeDate(e.target.value)}
                                            className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                                          />
                                        </div>

                                        <SharedFormFooter
                                          onSubmit={handleAddEmployeeRevenue}
                                          isLoading={saving}
                                          loadingLabel="جاري الحفظ..."
                                          submitLabel="حفظ"
                                          submitIcon={<Plus className="w-4 h-4 ml-2" />}
                                        />
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </DialogHeader>

                              {loadingDetails ? (
                                <div className="flex flex-col items-center gap-4 py-12">
                                  <div className="w-12 h-12 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin"></div>
                                  <p className="text-slate-600 dark:text-slate-400">جاري التحميل...</p>
                                </div>
                              ) : details.length === 0 ? (
                                <div className="text-center py-12">
                                  <p className="text-slate-600 dark:text-slate-400">لا توجد تفاصيل</p>
                                </div>
                              ) : (
                                <>
                                  <div className="w-full">
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800">
                                          <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">التاريخ</TableHead>
                                          <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">النشاط</TableHead>
                                          <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">العملات والمبالغ</TableHead>
                                          <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">الإجمالي (جنيه)</TableHead>
                                          <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">الإجراءات</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {details.map((d, idx) => (
                                          <TableRow
                                            key={d._id}
                                            className={`border-slate-200 dark:border-slate-800 ${
                                              idx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-900/50"
                                            }`}
                                          >
                                            <TableCell className="text-center text-slate-700 dark:text-slate-300">
                                              {new Date(d.date).toLocaleDateString("ar-EG")}
                                            </TableCell>
                                            <TableCell className="text-center">
                                              <Badge className="bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30">
                                                {d.activity.name}
                                              </Badge>
                                            </TableCell>

                                            {/* Currencies breakdown */}
                                            <TableCell className="text-center">
                                              <div className="flex flex-col items-center gap-1">
                                                {d.currencies.map((c, ci) => (
                                                  <span key={ci} className="text-sm text-slate-700 dark:text-slate-300">
                                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                      {c.amount.toLocaleString()}
                                                    </span>{" "}
                                                    <Badge className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 text-xs">
                                                      {c.currency.code}
                                                    </Badge>
                                                    <span className="text-slate-400 dark:text-slate-500 text-xs mr-1">
                                                      (×{c.exchangeRate})
                                                    </span>
                                                  </span>
                                                ))}
                                              </div>
                                            </TableCell>

                                            {/* Total EGP – computed client-side as fallback */}
                                            <TableCell className="text-center">
                                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                {(
                                                  d.totalEGPAmount ??
                                                  d.currencies.reduce((s, c) => s + c.amount * c.exchangeRate, 0)
                                                ).toLocaleString()}
                                              </span>
                                              <span className="text-slate-500 dark:text-slate-500 text-sm mr-1">جنيه</span>
                                            </TableCell>

                                            <TableCell className="text-center">
                                              <div className="flex items-center justify-center gap-2">
                                                <Button
                                                  onClick={() => handleEditRevenue(d)}
                                                  variant="outline"
                                                  size="sm"
                                                  className="bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20"
                                                >
                                                  <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                  onClick={() => handleDeleteRevenue(d._id)}
                                                  variant="outline"
                                                  size="sm"
                                                  className="bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20"
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                </Button>
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>

                                  {/* Pagination */}
                                  <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <Button
                                      disabled={page === 1}
                                      onClick={() => handlePageChange(page - 1)}
                                      variant="outline"
                                      size="sm"
                                      className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                                    >
                                      <ChevronRight className="w-4 h-4" />
                                      السابق
                                    </Button>
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">الصفحة {page} من {totalPages}</span>
                                    <Button
                                      disabled={page === totalPages}
                                      onClick={() => handlePageChange(page + 1)}
                                      variant="outline"
                                      size="sm"
                                      className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                                    >
                                      التالي
                                      <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Edit Revenue Dialog (portal-level, outside scroll containers) ── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                <Edit className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              تعديل الإيراد
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-4">
            {/* Activity */}
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <ActivityIcon className="w-4 h-4" />
                النشاط <span className="text-red-500">*</span>
              </Label>
              <Select
                options={activities.map((a) => ({ value: a._id, label: a.name }))}
                value={editActivity ? { value: editActivity, label: activities.find((a) => a._id === editActivity)?.name || "" } : null}
                onChange={(val: any) => setEditActivity(val.value)}
                placeholder="اختر النشاط"
                styles={selectStyles}
                isSearchable
              />
            </div>

            {/* Multi-Currency */}
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Coins className="w-4 h-4" />
                العملات والمبالغ <span className="text-red-500">*</span>
              </Label>
              <MultiCurrencyInput
                entries={editCurrencies}
                onChange={setEditCurrencies}
                currencies={currencies}
                selectStyles={selectStyles}
              />
              {computeTotalEGP(editCurrencies) > 0 && (
                <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                  <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold text-right">
                    الإجمالي بالجنيه المصري: {computeTotalEGP(editCurrencies).toLocaleString()} جنيه
                  </p>
                </div>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                التاريخ
              </Label>
              <Input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <SharedFormFooter
              onSubmit={handleUpdateRevenue}
              isLoading={updating}
              loadingLabel="جاري التحديث..."
              submitLabel="تحديث"
              submitIcon={<Edit className="w-4 h-4 ml-2" />}
              gradientFrom="from-blue-600"
              gradientTo="to-cyan-600"
              hoverFrom="hover:from-blue-700"
              hoverTo="hover:to-cyan-700"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}