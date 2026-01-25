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

interface EmployeeRevenue {
  _id: string;
  total: number;
  employee: {
    _id: string;
    name: string;
  };
  currency?: {
    _id: string;
    name: string;
    code: string;
  };
}

interface EmployeeRevenueDetail {
  _id: string;
  activity: { _id: string; name: string };
  amount: number;
  EGPamount?: number;
  currency?: {
    _id: string;
    name: string;
    code: string;
  };
  date: string;
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

  // For new revenue popup
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [newEmployee, setNewEmployee] = useState<string | null>(null);
  const [newActivity, setNewActivity] = useState<string | null>(null);
  const [newCurrency, setNewCurrency] = useState<string | null>(null);
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newDate, setNewDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [saving, setSaving] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // For edit revenue
  const [editingRevenue, setEditingRevenue] = useState<EmployeeRevenueDetail | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editActivity, setEditActivity] = useState<string>("");
  const [editCurrency, setEditCurrency] = useState<string>("");
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editDate, setEditDate] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  // For add revenue to specific employee
  const [addEmployeeRevenueDialogOpen, setAddEmployeeRevenueDialogOpen] = useState(false);
  const [addEmployeeActivity, setAddEmployeeActivity] = useState<string | null>(null);
  const [addEmployeeCurrency, setAddEmployeeCurrency] = useState<string | null>(null);
  const [addEmployeeAmount, setAddEmployeeAmount] = useState<number>(0);
  const [addEmployeeDate, setAddEmployeeDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const selectStyles = {
    control: (styles: any, { isFocused }: any) => ({
      ...styles,
      backgroundColor: "hsl(var(--background))",
      borderColor: isFocused
        ? "hsl(var(--ring))"
        : "hsl(var(--border))",
      color: "hsl(var(--foreground))",
      boxShadow: isFocused ? "0 0 0 1px hsl(var(--ring))" : "none",
      "&:hover": {
        borderColor: "hsl(var(--ring))",
      },
    }),
    menu: (styles: any) => ({
      ...styles,
      backgroundColor: "hsl(var(--background))",
      border: "1px solid hsl(var(--border))",
      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
      zIndex: 99999,
    }),
    menuPortal: (styles: any) => ({
      ...styles,
      zIndex: 99999,
    }),
    menuList: (styles: any) => ({
      ...styles,
      backgroundColor: "gray",
      padding: 0,
      maxHeight: "200px",
      overflowY: "auto",
    }),
    singleValue: (styles: any) => ({
      ...styles,
      color: "hsl(var(--foreground))",
    }),
    option: (styles: any, { isSelected, isFocused }: any) => ({
      ...styles,
      backgroundColor: isSelected
        ? "hsl(var(--primary))"
        : isFocused
        ? "hsl(var(--accent))"
        : "hsl(var(--background))",
      color: isSelected
        ? "hsl(var(--primary-foreground))"
        : "hsl(var(--foreground))",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "hsl(var(--primary))",
      },
    }),
    input: (styles: any) => ({
      ...styles,
      color: "hsl(var(--foreground))",
    }),
    placeholder: (styles: any) => ({
      ...styles,
      color: "hsl(var(--muted-foreground))",
    }),
  };

  // Build query params
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append("period", period);
    if (filterYear) params.append("year", filterYear);
    if (filterMonth) params.append("month", filterMonth);
    if (filterDate) params.append("date", filterDate);
    return params.toString();
  };

  // fetch main employee revenue
  const fetchData = async () => {
    setLoading(true);
    try {
      const queryString = buildQueryParams();
      const res = await axios.get(`${BASE_URL}/emp-revenue/report?${queryString}`);
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

  const handleSaveNewRevenue = async () => {
    if (!newEmployee || !newActivity || !newCurrency || !newAmount) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${BASE_URL}/emp-revenue`, {
        employee: newEmployee,
        activity: newActivity,
        currency: newCurrency,
        amount: newAmount,
        date: newDate,
      });
      setNewEmployee(null);
      setNewActivity(null);
      setNewCurrency(null);
      setNewAmount(0);
      setNewDate(new Date().toISOString().split("T")[0]);
      setAddDialogOpen(false);
      fetchData(); // refresh main table
      alert("تم إضافة الإيراد بنجاح");
    } catch (error) {
      console.error("خطأ في حفظ الإيراد:", error);
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleEditRevenue = (revenue: EmployeeRevenueDetail) => {
    setEditingRevenue(revenue);
    setEditActivity(revenue.activity._id);
    setEditCurrency(revenue.currency?._id || "");
    setEditAmount(revenue.amount);
    setEditDate(revenue.date.split("T")[0]);
    setEditDialogOpen(true);
  };

  const handleUpdateRevenue = async () => {
    if (!editingRevenue || !editActivity || !editCurrency || !editAmount) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    setUpdating(true);
    try {
      await axios.patch(`${BASE_URL}/emp-revenue/${editingRevenue._id}`, {
        activity: editActivity,
        currency: editCurrency,
        amount: editAmount,
        date: editDate,
      });
      setEditDialogOpen(false);
      setEditingRevenue(null);
      if (selectedEmployee) {
        fetchDetails(selectedEmployee.employee._id, page);
      }
      fetchData(); // refresh main table
      alert("تم تحديث الإيراد بنجاح");
    } catch (error) {
      console.error("خطأ في تحديث الإيراد:", error);
      alert("حدث خطأ أثناء التحديث");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteRevenue = async (revenueId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإيراد؟")) {
      return;
    }
    try {
      await axios.delete(`${BASE_URL}/emp-revenue/${revenueId}`);
      if (selectedEmployee) {
        fetchDetails(selectedEmployee.employee._id, page);
      }
      fetchData(); // refresh main table
      alert("تم حذف الإيراد بنجاح");
    } catch (error) {
      console.error("خطأ في حذف الإيراد:", error);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const handleAddEmployeeRevenue = async () => {
    if (!selectedEmployee || !addEmployeeActivity || !addEmployeeCurrency || !addEmployeeAmount) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${BASE_URL}/emp-revenue`, {
        employee: selectedEmployee.employee._id,
        activity: addEmployeeActivity,
        currency: addEmployeeCurrency,
        amount: addEmployeeAmount,
        date: addEmployeeDate,
      });
      setAddEmployeeActivity(null);
      setAddEmployeeCurrency(null);
      setAddEmployeeAmount(0);
      setAddEmployeeDate(new Date().toISOString().split("T")[0]);
      setAddEmployeeRevenueDialogOpen(false);
      fetchDetails(selectedEmployee.employee._id, page);
      fetchData(); // refresh main table
      alert("تم إضافة الإيراد بنجاح");
    } catch (error) {
      console.error("خطأ في حفظ الإيراد:", error);
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => {
    setFilterYear("");
    setFilterMonth("");
    setFilterDate("");
  };

  const getTotalRevenue = () => {
    return data.reduce((sum, emp) => sum + emp.total, 0);
  };

  const getPeriodLabel = () => {
    const labels = {
      daily: "يومي",
      weekly: "أسبوعي",
      monthly: "شهري",
      yearly: "سنوي",
    };
    return labels[period];
  };

  const hasActiveFilters = filterYear || filterMonth || filterDate;

  // Generate year options (last 10 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  }));

  // Month options
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-l from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
              إيرادات الموظفين
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              متابعة وإدارة إيرادات الموظفين حسب الفترة
            </p>
          </div>

          {/* Add Revenue Dialog */}
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-lg">
                <Plus className="w-4 h-4 ml-2" />
                إضافة إيراد جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                    <Plus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  إضافة إيراد جديد
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-4 mt-4">
                {/* Employee Select */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    الموظف <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    options={employees.map((e) => ({ value: e._id, label: e.name }))}
                    value={
                      newEmployee
                        ? {
                            value: newEmployee,
                            label: employees.find((e) => e._id === newEmployee)?.name || "",
                          }
                        : null
                    }
                    onChange={(val: any) => setNewEmployee(val.value)}
                    placeholder="اختر الموظف"
                    styles={selectStyles}
                    isSearchable
                  />
                </div>

                {/* Activity Select */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <ActivityIcon className="w-4 h-4" />
                    النشاط <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    options={activities.map((a) => ({ value: a._id, label: a.name }))}
                    value={
                      newActivity
                        ? {
                            value: newActivity,
                            label: activities.find((a) => a._id === newActivity)?.name || "",
                          }
                        : null
                    }
                    onChange={(val: any) => setNewActivity(val.value)}
                    placeholder="اختر النشاط"
                    styles={selectStyles}
                    isSearchable
                  />
                </div>

                {/* Currency Select */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    العملة <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    options={currencies.map((c) => ({ 
                      value: c._id, 
                      label: `${c.name} (${c.code})` 
                    }))}
                    value={
                      newCurrency
                        ? {
                            value: newCurrency,
                            label: currencies.find((c) => c._id === newCurrency)
                              ? `${currencies.find((c) => c._id === newCurrency)?.name} (${currencies.find((c) => c._id === newCurrency)?.code})`
                              : "",
                          }
                        : null
                    }
                    onChange={(val: any) => setNewCurrency(val.value)}
                    placeholder="اختر العملة"
                    styles={selectStyles}
                    isSearchable
                  />
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    المبلغ <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="أدخل المبلغ"
                    value={newAmount || ""}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Date Input */}
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
                    onClick={handleSaveNewRevenue}
                    disabled={saving}
                    className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 ml-2" />
                        حفظ
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-emerald-200 dark:border-emerald-500/20 bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-slate-800 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
                إجمالي الإيرادات
              </CardTitle>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {getTotalRevenue().toLocaleString()} جنيه
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                إجمالي إيرادات جميع الموظفين
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-cyan-200 dark:border-cyan-500/20 bg-gradient-to-br from-white to-cyan-50 dark:from-slate-900 dark:to-slate-800 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
                عدد الموظفين
              </CardTitle>
              <div className="p-2 bg-cyan-100 dark:bg-cyan-500/10 rounded-lg">
                <User className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                {data.length}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                موظف لديه إيرادات
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 dark:border-purple-500/20 bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-slate-800 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
                الفترة الحالية
              </CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-500/10 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {getPeriodLabel()}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                عرض البيانات حسب الفترة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters Card */}
        <Card className="shadow-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                الفلاتر والتصفية
              </CardTitle>
              {hasActiveFilters && (
                <Badge className="bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30">
                  فلاتر نشطة
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Period Filter */}
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">
                  الفترة الزمنية
                </Label>
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

              {/* Year Filter */}
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">
                  السنة
                </Label>
                <Select
                  options={yearOptions}
                  value={filterYear ? { value: filterYear, label: filterYear } : null}
                  onChange={(val: any) => setFilterYear(val?.value || "")}
                  placeholder="اختر السنة"
                  styles={selectStyles}
                  isClearable
                />
              </div>

              {/* Month Filter */}
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">
                  الشهر
                </Label>
                <Select
                  options={monthOptions}
                  value={
                    filterMonth
                      ? monthOptions.find((m) => m.value === filterMonth)
                      : null
                  }
                  onChange={(val: any) => setFilterMonth(val?.value || "")}
                  placeholder="اختر الشهر"
                  styles={selectStyles}
                  isClearable
                />
              </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">
                  تاريخ محدد
                </Label>
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
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

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mt-4 p-3 bg-cyan-50 dark:bg-cyan-500/10 rounded-lg border border-cyan-200 dark:border-cyan-500/20">
                <p className="text-sm text-cyan-700 dark:text-cyan-300 text-right">
                  الفلاتر النشطة:
                  {filterYear && (
                    <Badge className="mr-2 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30">
                      السنة: {filterYear}
                    </Badge>
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

        {/* Employees Revenue Table */}
        <Card className="shadow-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700">
            <CardTitle className="text-slate-900 dark:text-white">
              إيرادات الموظفين ({data.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800">
                    <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">
                      الموظف
                    </TableHead>
                    <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">
                      إجمالي الإيرادات
                    </TableHead>
                    <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">
                      الإجراء
                    </TableHead>
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
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                            {emp.total.toLocaleString()}
                          </span>
                          <span className="text-slate-500 dark:text-slate-500 text-sm mr-1">
                            جنيه
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
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
                            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                              <DialogHeader>
                                <div className="flex items-center justify-between">
                                  <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                                    تفاصيل الإيرادات - {emp.employee.name}
                                  </DialogTitle>
                                  <Dialog open={addEmployeeRevenueDialogOpen} onOpenChange={setAddEmployeeRevenueDialogOpen}>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white"
                                      >
                                        <Plus className="w-4 h-4 ml-2" />
                                        إضافة إيراد
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                      <DialogHeader>
                                        <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                                          إضافة إيراد لـ {emp.employee.name}
                                        </DialogTitle>
                                      </DialogHeader>

                                      <div className="flex flex-col gap-4 mt-4">
                                        {/* Activity Select */}
                                        <div className="space-y-2">
                                          <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <ActivityIcon className="w-4 h-4" />
                                            النشاط <span className="text-red-500">*</span>
                                          </Label>
                                          <Select
                                            options={activities.map((a) => ({ value: a._id, label: a.name }))}
                                            value={
                                              addEmployeeActivity
                                                ? {
                                                    value: addEmployeeActivity,
                                                    label: activities.find((a) => a._id === addEmployeeActivity)?.name || "",
                                                  }
                                                : null
                                            }
                                            onChange={(val: any) => setAddEmployeeActivity(val.value)}
                                            placeholder="اختر النشاط"
                                            styles={selectStyles}
                                            isSearchable
                                          />
                                        </div>

                                        {/* Currency Select */}
                                        <div className="space-y-2">
                                          <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <Coins className="w-4 h-4" />
                                            العملة <span className="text-red-500">*</span>
                                          </Label>
                                          <Select
                                            options={currencies.map((c) => ({ 
                                              value: c._id, 
                                              label: `${c.name} (${c.code})` 
                                            }))}
                                            value={
                                              addEmployeeCurrency
                                                ? {
                                                    value: addEmployeeCurrency,
                                                    label: currencies.find((c) => c._id === addEmployeeCurrency)
                                                      ? `${currencies.find((c) => c._id === addEmployeeCurrency)?.name} (${currencies.find((c) => c._id === addEmployeeCurrency)?.code})`
                                                      : "",
                                                  }
                                                : null
                                            }
                                            onChange={(val: any) => setAddEmployeeCurrency(val.value)}
                                            placeholder="اختر العملة"
                                            styles={selectStyles}
                                            isSearchable
                                          />
                                        </div>

                                        {/* Amount Input */}
                                        <div className="space-y-2">
                                          <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" />
                                            المبلغ <span className="text-red-500">*</span>
                                          </Label>
                                          <Input
                                            type="number"
                                            placeholder="أدخل المبلغ"
                                            value={addEmployeeAmount || ""}
                                            onChange={(e) => setAddEmployeeAmount(Number(e.target.value))}
                                            className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                                          />
                                        </div>

                                        {/* Date Input */}
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
                                            onClick={handleAddEmployeeRevenue}
                                            disabled={saving}
                                            className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white"
                                          >
                                            {saving ? (
                                              <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                                                جاري الحفظ...
                                              </>
                                            ) : (
                                              <>
                                                <Plus className="w-4 h-4 ml-2" />
                                                حفظ
                                              </>
                                            )}
                                          </Button>
                                        </div>
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
                                  <div className="overflow-x-auto">
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800">
                                          <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">
                                            التاريخ
                                          </TableHead>
                                          <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">
                                            النشاط
                                          </TableHead>
                                          <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">
                                            المبلغ (جنيه مصري)
                                          </TableHead>
                                          <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">
                                            المبلغ
                                          </TableHead>
                                          <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">
                                            الإجراءات
                                          </TableHead>
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
                                            <TableCell className="text-center">
                                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                {d.EGPamount?.toLocaleString()}
                                              </span>
                                              <span className="text-slate-500 dark:text-slate-500 text-sm mr-1">
                                                جنيه
                                              </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                {d.amount.toLocaleString()}
                                              </span>
                                              <span className="text-slate-500 dark:text-slate-500 text-sm mr-1">
                                                {d.currency?.code}
                                              </span>
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
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                                      الصفحة {page} من {totalPages}
                                    </span>
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

      {/* Edit Revenue Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                <Edit className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              تعديل الإيراد
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-4">
            {/* Activity Select */}
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <ActivityIcon className="w-4 h-4" />
                النشاط <span className="text-red-500">*</span>
              </Label>
              <Select
                options={activities.map((a) => ({ value: a._id, label: a.name }))}
                value={
                  editActivity
                    ? {
                        value: editActivity,
                        label: activities.find((a) => a._id === editActivity)?.name || "",
                      }
                    : null
                }
                onChange={(val: any) => setEditActivity(val.value)}
                placeholder="اختر النشاط"
                styles={selectStyles}
                isSearchable
              />
            </div>

            {/* Currency Select */}
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Coins className="w-4 h-4" />
                العملة <span className="text-red-500">*</span>
              </Label>
              <Select
                options={currencies.map((c) => ({ 
                  value: c._id, 
                  label: `${c.name} (${c.code})` 
                }))}
                value={
                  editCurrency
                    ? {
                        value: editCurrency,
                        label: currencies.find((c) => c._id === editCurrency)
                          ? `${currencies.find((c) => c._id === editCurrency)?.name} (${currencies.find((c) => c._id === editCurrency)?.code})`
                          : "",
                      }
                    : null
                }
                onChange={(val: any) => setEditCurrency(val.value)}
                placeholder="اختر العملة"
                styles={selectStyles}
                isSearchable
              />
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                المبلغ <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="أدخل المبلغ"
                value={editAmount || ""}
                onChange={(e) => setEditAmount(Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            {/* Date Input */}
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
                onClick={handleUpdateRevenue}
                disabled={updating}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                {updating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                    جاري التحديث...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 ml-2" />
                    تحديث
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}