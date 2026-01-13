'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { 
  Check, 
  ChevronsUpDown, 
  Filter, 
  X, 
  Plus,
  TrendingUp,
  Calendar,
  User,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { BASE_URL } from '@/lib/constants';

/* ===================== Types ===================== */

type Employee = {
  _id: string;
  name: string;
};

type VipRevenue = {
  _id: string;
  serialNumber: string;
  amount: number;
  date: string;
  employee: Employee;
};

/* ===================== Page ===================== */

export default function VipRevenuesPage() {
  const API = `${BASE_URL}/vip-revenues`;
  const EMP_API = `${BASE_URL}http://localhost:8080/employees`;

  /* ===================== State ===================== */

  const [revenues, setRevenues] = useState<VipRevenue[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [filteredTotal, setFilteredTotal] = useState(0);

  // filters
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterEmployeeLabel, setFilterEmployeeLabel] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isFilterActive, setIsFilterActive] = useState(false);

  // add form
  const [serialNumber, setSerialNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [employee, setEmployee] = useState('');
  const [employeeLabel, setEmployeeLabel] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  /* ===================== Fetch ===================== */

  const fetchRevenues = async () => {
    const params = new URLSearchParams();

    if (filterEmployee) params.append('employee', filterEmployee);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const res = await fetch(`${API}?${params.toString()}`);
    const json = await res.json();

    const revenuesData = Array.isArray(json) ? json : [];
    setRevenues(revenuesData);
    
    // Calculate filtered total
    const filtered = revenuesData.reduce((sum, r) => sum + r.amount, 0);
    setFilteredTotal(filtered);
    
    setIsFilterActive(!!(filterEmployee || fromDate || toDate));
  };

  const fetchTotal = async () => {
    const res = await fetch(`${API}/statistics/total`);
    const json = await res.json();
    setTotal(json?.total || 0);
  };

  const fetchEmployees = async () => {
    const res = await fetch(EMP_API);
    const json = await res.json();
    setEmployees(Array.isArray(json) ? json : []);
  };

  useEffect(() => {
    fetchRevenues();
    fetchTotal();
    fetchEmployees();
  }, []);

  /* ===================== Actions ===================== */

  const addRevenue = async () => {
    if (!serialNumber || !amount || !employee) return;

    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serialNumber,
        amount: Number(amount),
        date,
        employee,
      }),
    });

    setSerialNumber('');
    setAmount('');
    setEmployee('');
    setEmployeeLabel('');
    setDate(new Date().toISOString().split('T')[0]);
    setDialogOpen(false);

    fetchRevenues();
    fetchTotal();
  };

  const clearFilters = () => {
    setFilterEmployee('');
    setFilterEmployeeLabel('');
    setFromDate('');
    setToDate('');
    setIsFilterActive(false);
    
    // Refetch without filters
    setTimeout(() => {
      fetchRevenues();
    }, 0);
  };

  const applyFilters = () => {
    fetchRevenues();
  };

  /* ===================== UI ===================== */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-l from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent text-right">
              إيرادات كبار العملاء (VIP)
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-right">
              إدارة ومتابعة إيرادات العملاء المميزين
            </p>
          </div>
          
          {/* Add Revenue Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-lg shadow-emerald-500/20"
                size="lg"
              >
                <Plus className="ml-2 h-5 w-5" />
                إضافة إيراد جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right text-2xl flex items-center gap-2 justify-end text-slate-900 dark:text-white">
                  <span>إضافة إيراد VIP جديد</span>
                  <Sparkles className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                </DialogTitle>
                <DialogDescription className="text-right text-slate-600 dark:text-slate-400">
                  أدخل تفاصيل الإيراد الجديد لكبار العملاء
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="dialog-serialNumber" className="text-right block text-slate-700 dark:text-slate-300">
                    الرقم التسلسلي
                  </Label>
                  <Input
                    id="dialog-serialNumber"
                    placeholder="أدخل الرقم التسلسلي"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="text-right bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dialog-amount" className="text-right block text-slate-700 dark:text-slate-300">
                    المبلغ (جنيه)
                  </Label>
                  <Input
                    id="dialog-amount"
                    type="number"
                    placeholder="أدخل المبلغ"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-right bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dialog-date" className="text-right block text-slate-700 dark:text-slate-300">
                    التاريخ
                  </Label>
                  <Input
                    id="dialog-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="text-right bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-right block text-slate-700 dark:text-slate-300">الموظف</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        {employeeLabel || 'اختر الموظف'}
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      <Command className="bg-white dark:bg-slate-800">
                        <CommandInput 
                          placeholder="ابحث عن موظف..." 
                          className="text-slate-900 dark:text-white"
                        />
                        <CommandEmpty className="text-slate-500 dark:text-slate-400">لا يوجد نتائج</CommandEmpty>
                        <CommandGroup>
                          {employees.map((emp) => (
                            <CommandItem
                              key={emp._id}
                              value={emp.name}
                              onSelect={() => {
                                setEmployee(emp._id);
                                setEmployeeLabel(emp.name);
                              }}
                              className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              <Check
                                className={cn(
                                  'ml-2 h-4 w-4',
                                  emp._id === employee
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              {emp.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <DialogFooter className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSerialNumber('');
                    setAmount('');
                    setEmployee('');
                    setEmployeeLabel('');
                    setDate(new Date().toISOString().split('T')[0]);
                    setDialogOpen(false);
                  }}
                  className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={addRevenue}
                  className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white"
                  disabled={!serialNumber || !amount || !employee}
                >
                  <Plus className="ml-2 h-4 w-4" />
                  حفظ الإيراد
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-emerald-200 dark:border-emerald-500/20 bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-slate-800 border-2 shadow-lg dark:shadow-xl dark:shadow-emerald-500/10 hover:shadow-xl dark:hover:shadow-emerald-500/20 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
                إجمالي الإيرادات
              </CardTitle>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {total.toLocaleString()} جنيه
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                جميع الإيرادات المسجلة
              </p>
            </CardContent>
          </Card>

          <Card className="border-cyan-200 dark:border-cyan-500/20 bg-gradient-to-br from-white to-cyan-50 dark:from-slate-900 dark:to-slate-800 border-2 shadow-lg dark:shadow-xl dark:shadow-cyan-500/10 hover:shadow-xl dark:hover:shadow-cyan-500/20 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
                الإيرادات المعروضة
              </CardTitle>
              <div className="p-2 bg-cyan-100 dark:bg-cyan-500/10 rounded-lg">
                <Filter className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                {filteredTotal.toLocaleString()} جنيه
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                {isFilterActive ? 'بعد تطبيق الفلاتر' : 'جميع البيانات'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-500/20 bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-slate-800 border-2 shadow-lg dark:shadow-xl dark:shadow-purple-500/10 hover:shadow-xl dark:hover:shadow-purple-500/20 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
                عدد السجلات
              </CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {revenues.length}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                سجل معروض حالياً
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-lg dark:shadow-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="text-right flex items-center justify-between text-slate-900 dark:text-white">
              <span className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                تصفية البيانات
              </span>
              {isFilterActive && (
                <Badge className="bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30">
                  فلاتر نشطة
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-right block flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  تصفية حسب الموظف
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      {filterEmployeeLabel || 'جميع الموظفين'}
                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <Command className="bg-white dark:bg-slate-800">
                      <CommandInput 
                        placeholder="ابحث عن موظف..." 
                        className="text-slate-900 dark:text-white"
                      />
                      <CommandEmpty className="text-slate-500 dark:text-slate-400">لا يوجد نتائج</CommandEmpty>
                      <CommandGroup>
                        {employees.map((emp) => (
                          <CommandItem
                            key={emp._id}
                            value={emp.name}
                            onSelect={() => {
                              setFilterEmployee(emp._id);
                              setFilterEmployeeLabel(emp.name);
                            }}
                            className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <Check
                              className={cn(
                                'ml-2 h-4 w-4',
                                emp._id === filterEmployee
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                            {emp.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromDate" className="text-right block flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  من تاريخ
                </Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="text-right bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="toDate" className="text-right block flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  إلى تاريخ
                </Label>
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="text-right bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-right block opacity-0">Actions</Label>
                <div className="flex gap-2">
                  <Button 
                    onClick={applyFilters}
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                  >
                    <Filter className="ml-2 h-4 w-4" />
                    تطبيق
                  </Button>
                  {isFilterActive && (
                    <Button 
                      onClick={clearFilters}
                      variant="outline"
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <X className="ml-2 h-4 w-4" />
                      إعادة تعيين
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {isFilterActive && (
              <div className="mt-4 p-3 bg-cyan-50 dark:bg-cyan-500/10 rounded-lg border border-cyan-200 dark:border-cyan-500/20">
                <p className="text-sm text-cyan-700 dark:text-cyan-300 text-right">
                  الفلاتر النشطة:
                  {filterEmployeeLabel && (
                    <Badge className="mr-2 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30">
                      الموظف: {filterEmployeeLabel}
                    </Badge>
                  )}
                  {fromDate && (
                    <Badge className="mr-2 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30">
                      من: {new Date(fromDate).toLocaleDateString('ar-EG')}
                    </Badge>
                  )}
                  {toDate && (
                    <Badge className="mr-2 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30">
                      إلى: {new Date(toDate).toLocaleDateString('ar-EG')}
                    </Badge>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-lg dark:shadow-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="text-right text-slate-900 dark:text-white">
              جميع الإيرادات ({revenues.length} سجل)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {revenues.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="h-12 w-12 text-slate-400 dark:text-slate-600" />
                </div>
                <p className="text-lg font-medium">لا توجد بيانات لعرضها</p>
                <p className="text-sm mt-2 text-slate-400 dark:text-slate-500">
                  {isFilterActive 
                    ? 'جرب تعديل الفلاتر للحصول على نتائج'
                    : 'ابدأ بإضافة إيراد جديد'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800">
                      <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                        الرقم التسلسلي
                      </TableHead>
                      <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                        المبلغ
                      </TableHead>
                      <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                        التاريخ
                      </TableHead>
                      <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                        الموظف
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenues.map((r, index) => (
                      <TableRow 
                        key={r._id}
                        className={cn(
                          "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors",
                          index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-900/50'
                        )}
                      >
                        <TableCell className="text-right font-mono text-slate-700 dark:text-slate-300">
                          {r.serialNumber}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {r.amount.toLocaleString()}
                          </span>
                          <span className="text-slate-500 dark:text-slate-500 text-sm mr-1">
                            جنيه
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-slate-700 dark:text-slate-300">
                          {new Date(r.date).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30">
                            {r.employee?.name || 'غير محدد'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}