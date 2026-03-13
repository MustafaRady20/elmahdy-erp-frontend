'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
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
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Sparkles,
  Edit,
  Trash2,
  Coins,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { BASE_URL } from '@/lib/constants';

/* ===================== Types ===================== */

interface Currency {
  _id: string;
  name: string;
  code: string;
  exchangeRate: number;
}

interface Employee {
  _id: string;
  name: string;
}

interface CurrencyEntry {
  currency: string;
  amount: number;
  exchangeRate?: number;
}

interface PopulatedCurrencyEntry {
  currency: { _id: string; name: string; code: string };
  amount: number;
  exchangeRate: number;
  egpAmount: number;
}

interface VipRevenue {
  _id: string;
  currencies: PopulatedCurrencyEntry[];
  amount: number;
  date: string;
  employee: Employee;
}

/* ===================== Employee Combobox (defined outside page component) ===================== */

interface EmployeeComboboxProps {
  value: string;
  label: string;
  employees: Employee[];
  onSelect: (id: string, name: string) => void;
  placeholder?: string;
}

function EmployeeCombobox({
  value,
  label,
  employees,
  onSelect,
  placeholder = 'اختر الموظف',
}: EmployeeComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          {label || placeholder}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <Command className="bg-white dark:bg-slate-800">
          <CommandInput placeholder="ابحث عن موظف..." className="text-slate-900 dark:text-white" />
          <CommandEmpty className="text-slate-500 dark:text-slate-400">لا يوجد نتائج</CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-y-auto">
            {employees.map((emp) => (
              <CommandItem
                key={emp._id}
                value={emp.name}
                onSelect={() => { onSelect(emp._id, emp.name); setOpen(false); }}
                className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Check className={cn('ml-2 h-4 w-4', emp._id === value ? 'opacity-100' : 'opacity-0')} />
                {emp.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/* ===================== Multi-Currency Input ===================== */

interface MultiCurrencyInputProps {
  entries: CurrencyEntry[];
  onChange: (entries: CurrencyEntry[]) => void;
  currencies: Currency[];
}

function CurrencyPopover({
  entry,
  index,
  currencies,
  usedIds,
  onSelect,
}: {
  entry: CurrencyEntry;
  index: number;
  currencies: Currency[];
  usedIds: string[];
  onSelect: (index: number, currencyId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedCurrency = currencies.find((c) => c._id === entry.currency);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600"
        >
          {selectedCurrency
            ? `${selectedCurrency.name} (${selectedCurrency.code})`
            : 'اختر العملة'}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <Command className="bg-white dark:bg-slate-800">
          <CommandInput placeholder="ابحث عن عملة..." className="text-slate-900 dark:text-white" />
          <CommandEmpty className="text-slate-500 dark:text-slate-400">لا يوجد نتائج</CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-y-auto">
            {currencies.map((c) => (
              <CommandItem
                key={c._id}
                value={c.name}
                disabled={usedIds.includes(c._id) && entry.currency !== c._id}
                onSelect={() => { onSelect(index, c._id); setOpen(false); }}
                className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Check
                  className={cn(
                    'ml-2 h-4 w-4',
                    entry.currency === c._id ? 'opacity-100' : 'opacity-0',
                  )}
                />
                {c.name} ({c.code})
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function MultiCurrencyInput({ entries, onChange, currencies }: MultiCurrencyInputProps) {
  const addEntry = () => onChange([...entries, { currency: '', amount: 0 }]);

  const removeEntry = (i: number) => onChange(entries.filter((_, idx) => idx !== i));

  const updateEntry = (i: number, field: keyof CurrencyEntry, value: string | number) =>
    onChange(entries.map((e, idx) => (idx === i ? { ...e, [field]: value } : e)));

  const handleCurrencyChange = (i: number, currencyId: string) =>
    onChange(
      entries.map((e, idx) =>
        idx === i ? { ...e, currency: currencyId } : e,
      ),
    );

  const getEffectiveRate = (entry: CurrencyEntry): number => {
    if (entry.exchangeRate && entry.exchangeRate > 0) return entry.exchangeRate;
    return currencies.find((c) => c._id === entry.currency)?.exchangeRate || 0;
  };

  const usedIds = entries.map((e) => e.currency).filter(Boolean);

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry, index) => {
        const effectiveRate = getEffectiveRate(entry);
        const selectedCurrency = currencies.find((c) => c._id === entry.currency);
        const isUsingDefault = !entry.exchangeRate || entry.exchangeRate === 0;

        return (
          <div
            key={index}
            className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3"
          >
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

            <CurrencyPopover
              entry={entry}
              index={index}
              currencies={currencies}
              usedIds={usedIds}
              onSelect={handleCurrencyChange}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-600 dark:text-slate-400">
                  المبلغ <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder="المبلغ"
                  value={entry.amount || ''}
                  onChange={(e) => updateEntry(index, 'amount', Number(e.target.value))}
                  className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-600 dark:text-slate-400">
                  سعر الصرف (اختياري)
                </Label>
                <Input
                  type="number"
                  placeholder={
                    selectedCurrency?.exchangeRate
                      ? `افتراضي: ${selectedCurrency.exchangeRate}`
                      : 'سعر الصرف'
                  }
                  value={entry.exchangeRate || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || val === '0') {
                      const newEntry = { ...entry };
                      delete newEntry.exchangeRate;
                      onChange(entries.map((ent, i) => (i === index ? newEntry : ent)));
                    } else {
                      updateEntry(index, 'exchangeRate', Number(val));
                    }
                  }}
                  className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>

            {entry.currency && effectiveRate > 0 && (
              <div className="text-xs flex items-center gap-2">
                {isUsingDefault ? (
                  <>
                    <span className="text-emerald-600 dark:text-emerald-400">⚡</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      سعر تلقائي:{' '}
                      <span className="font-semibold">{selectedCurrency?.exchangeRate}</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-blue-600 dark:text-blue-400">📝</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      سعر مخصص:{' '}
                      <span className="font-semibold">{entry.exchangeRate}</span>
                    </span>
                  </>
                )}
              </div>
            )}

            {entry.amount && effectiveRate ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                = {(entry.amount * effectiveRate).toLocaleString()} جنيه مصري
              </p>
            ) : null}
          </div>
        );
      })}

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

/* ===================== Shared form footer ===================== */

interface SharedFormFooterProps {
  onSubmit: () => void;
  isLoading: boolean;
  loadingLabel: string;
  submitLabel: string;
  submitIcon: React.ReactNode;
  gradientFrom?: string;
  gradientTo?: string;
  hoverFrom?: string;
  hoverTo?: string;
}

function SharedFormFooter({
  onSubmit,
  isLoading,
  loadingLabel,
  submitLabel,
  submitIcon,
  gradientFrom = 'from-emerald-600',
  gradientTo = 'to-cyan-600',
  hoverFrom = 'hover:from-emerald-700',
  hoverTo = 'hover:to-cyan-700',
}: SharedFormFooterProps) {
  return (
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
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
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
}

/* ===================== Add Revenue Form ===================== */

interface AddRevenueFormProps {
  employees: Employee[];
  currencies: Currency[];
  onSuccess: () => void;
  onClose: () => void;
  apiUrl: string;
}

const EMPTY_CURRENCY_ENTRY: CurrencyEntry = { currency: '', amount: 0 };

function AddRevenueForm({ employees, currencies, onSuccess, onClose, apiUrl }: AddRevenueFormProps) {
  const [currencyEntries, setCurrencyEntries] = useState<CurrencyEntry[]>([{ ...EMPTY_CURRENCY_ENTRY }]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [employee, setEmployee] = useState('');
  const [employeeLabel, setEmployeeLabel] = useState('');
  const [saving, setSaving] = useState(false);

  const getEffectiveRate = (entry: CurrencyEntry): number => {
    if (entry.exchangeRate && entry.exchangeRate > 0) return entry.exchangeRate;
    return currencies.find((c) => c._id === entry.currency)?.exchangeRate || 0;
  };

  const computeTotalEGP = (entries: CurrencyEntry[]) =>
    entries.reduce((sum, e) => sum + (e.amount || 0) * getEffectiveRate(e), 0);

  const validateCurrencies = (entries: CurrencyEntry[]) =>
    entries.length > 0 && entries.every((e) => !!e.currency && e.currency.trim() !== '' && e.amount > 0);

  const prepareCurrenciesForSubmit = (entries: CurrencyEntry[]) =>
    entries.map((e) => ({
      currency: e.currency,
      amount: e.amount,
      exchangeRate:
        e.exchangeRate && e.exchangeRate > 0
          ? e.exchangeRate
          : currencies.find((c) => c._id === e.currency)?.exchangeRate || 0,
    }));

  const handleSubmit = async () => {
    if (!employee || !validateCurrencies(currencyEntries)) {
      alert('يرجى ملء جميع الحقول المطلوبة بشكل صحيح');
      return;
    }
    setSaving(true);
    try {
      await axios.post(apiUrl, {
        currencies: prepareCurrenciesForSubmit(currencyEntries),
        date,
        employee,
      });
      onSuccess();
      onClose();
    } catch {
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const egpTotal = computeTotalEGP(currencyEntries);

  return (
    <div className="flex flex-col gap-5 py-4">
      <div className="space-y-2">
        <Label className="text-right block text-slate-700 dark:text-slate-300">
          الموظف <span className="text-red-500">*</span>
        </Label>
        <EmployeeCombobox
          value={employee}
          label={employeeLabel}
          employees={employees}
          onSelect={(id, name) => { setEmployee(id); setEmployeeLabel(name); }}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-right block text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Coins className="w-4 h-4" />
          العملات والمبالغ <span className="text-red-500">*</span>
        </Label>
        <MultiCurrencyInput
          entries={currencyEntries}
          onChange={setCurrencyEntries}
          currencies={currencies}
        />
        {egpTotal > 0 && (
          <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
            <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold text-right">
              الإجمالي بالجنيه المصري: {egpTotal.toLocaleString()} جنيه
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-right block text-slate-700 dark:text-slate-300">التاريخ</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="text-right bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
        />
      </div>

      <SharedFormFooter
        onSubmit={handleSubmit}
        isLoading={saving}
        loadingLabel="جاري الحفظ..."
        submitLabel="حفظ الإيراد"
        submitIcon={<Plus className="ml-2 h-4 w-4" />}
      />
    </div>
  );
}

/* ===================== Edit Revenue Form ===================== */

interface EditRevenueFormProps {
  revenue: VipRevenue;
  employees: Employee[];
  currencies: Currency[];
  onSuccess: () => void;
  onClose: () => void;
  apiUrl: string;
}

function EditRevenueForm({ revenue, employees, currencies, onSuccess, onClose, apiUrl }: EditRevenueFormProps) {
  const [currencyEntries, setCurrencyEntries] = useState<CurrencyEntry[]>(() =>
    revenue.currencies.map((c) => ({
      // Handle both populated ({ _id, name, code }) and plain string ID from API
      currency: typeof c.currency === 'string' ? c.currency : c.currency?._id ?? '',
      amount: c.amount,
      exchangeRate: c.exchangeRate,
    })),
  );
  const [date, setDate] = useState(revenue.date.split('T')[0]);
  const [employee, setEmployee] = useState(revenue.employee._id);
  const [employeeLabel, setEmployeeLabel] = useState(revenue.employee.name);
  const [updating, setUpdating] = useState(false);

  const getEffectiveRate = (entry: CurrencyEntry): number => {
    if (entry.exchangeRate && entry.exchangeRate > 0) return entry.exchangeRate;
    return currencies.find((c) => c._id === entry.currency)?.exchangeRate || 0;
  };

  const computeTotalEGP = (entries: CurrencyEntry[]) =>
    entries.reduce((sum, e) => sum + (e.amount || 0) * getEffectiveRate(e), 0);

  const validateCurrencies = (entries: CurrencyEntry[]) =>
    entries.length > 0 && entries.every((e) => !!e.currency && e.currency.trim() !== '' && e.amount > 0);

  const prepareCurrenciesForSubmit = (entries: CurrencyEntry[]) =>
    entries.map((e) => ({
      currency: e.currency,
      amount: e.amount,
      exchangeRate:
        e.exchangeRate && e.exchangeRate > 0
          ? e.exchangeRate
          : currencies.find((c) => c._id === e.currency)?.exchangeRate || 0,
    }));

  const handleSubmit = async () => {
    if (!employee || !validateCurrencies(currencyEntries)) {
      alert('يرجى ملء جميع الحقول المطلوبة بشكل صحيح');
      return;
    }
    setUpdating(true);
    try {
      await axios.patch(`${apiUrl}/${revenue._id}`, {
        currencies: prepareCurrenciesForSubmit(currencyEntries),
        date,
        employee,
      });
      onSuccess();
      onClose();
    } catch {
      alert('حدث خطأ أثناء التحديث');
    } finally {
      setUpdating(false);
    }
  };

  const egpTotal = computeTotalEGP(currencyEntries);

  return (
    <div className="flex flex-col gap-5 py-4">
      <div className="space-y-2">
        <Label className="text-right block text-slate-700 dark:text-slate-300">
          الموظف <span className="text-red-500">*</span>
        </Label>
        <EmployeeCombobox
          value={employee}
          label={employeeLabel}
          employees={employees}
          onSelect={(id, name) => { setEmployee(id); setEmployeeLabel(name); }}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-right block text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Coins className="w-4 h-4" />
          العملات والمبالغ <span className="text-red-500">*</span>
        </Label>
        <MultiCurrencyInput
          entries={currencyEntries}
          onChange={setCurrencyEntries}
          currencies={currencies}
        />
        {egpTotal > 0 && (
          <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
            <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold text-right">
              الإجمالي بالجنيه المصري: {egpTotal.toLocaleString()} جنيه
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-right block text-slate-700 dark:text-slate-300">التاريخ</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="text-right bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
        />
      </div>

      <SharedFormFooter
        onSubmit={handleSubmit}
        isLoading={updating}
        loadingLabel="جاري التحديث..."
        submitLabel="تحديث الإيراد"
        submitIcon={<Edit className="ml-2 h-4 w-4" />}
        gradientFrom="from-blue-600"
        gradientTo="to-cyan-600"
        hoverFrom="hover:from-blue-700"
        hoverTo="hover:to-cyan-700"
      />
    </div>
  );
}

/* ===================== Page ===================== */

export default function VipRevenuesPage() {
  const API = `${BASE_URL}/vip-revenues`;
  const EMP_API = `${BASE_URL}/employees`;
  const CURR_API = `${BASE_URL}/currencies`;

  /* ── Data ── */
  const [revenues, setRevenues] = useState<VipRevenue[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [total, setTotal] = useState(0);
  const [filteredTotal, setFilteredTotal] = useState(0);

  /* ── Filters ── */
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterEmployeeLabel, setFilterEmployeeLabel] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isFilterActive, setIsFilterActive] = useState(false);

  /* ── Dialogs ── */
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<VipRevenue | null>(null);

  /* ── Fetch ── */

  const fetchRevenues = useCallback(async (
    empId = filterEmployee,
    from = fromDate,
    to = toDate,
  ) => {
    const params: Record<string, string> = {};
    if (empId) params.employee = empId;
    if (from) params.fromDate = from;
    if (to) params.toDate = to;

    const res = await axios.get(API, { params });
    const data: VipRevenue[] = Array.isArray(res.data) ? res.data : [];
    setRevenues(data);
    setFilteredTotal(data.reduce((sum, r) => sum + r.amount, 0));
    setIsFilterActive(!!(empId || from || to));
  }, [API, filterEmployee, fromDate, toDate]);

  const fetchTotal = useCallback(async () => {
    const res = await axios.get(`${API}/statistics/total`);
    setTotal(res.data?.total || 0);
  }, [API]);

  const fetchLookups = useCallback(async () => {
    const [empRes, currRes] = await Promise.all([
      axios.get(EMP_API),
      axios.get(CURR_API),
    ]);
    setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
    setCurrencies(Array.isArray(currRes.data) ? currRes.data : []);
  }, [EMP_API, CURR_API]);

  useEffect(() => {
    fetchRevenues();
    fetchTotal();
    fetchLookups();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Handlers ── */

  const handleApplyFilters = () => {
    fetchRevenues(filterEmployee, fromDate, toDate);
  };

  const handleClearFilters = () => {
    setFilterEmployee('');
    setFilterEmployeeLabel('');
    setFromDate('');
    setToDate('');
    fetchRevenues('', '', '');
  };

  const handleDeleteRevenue = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإيراد؟')) return;
    try {
      await axios.delete(`${API}/${id}`);
      fetchRevenues();
      fetchTotal();
    } catch {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const handleAddSuccess = () => {
    fetchRevenues();
    fetchTotal();
  };

  const handleEditSuccess = () => {
    fetchRevenues();
    fetchTotal();
  };

  /* ── JSX ── */

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-8"
      dir="rtl"
    >
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

          {/* Add Dialog */}
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-lg shadow-emerald-500/20"
                size="lg"
              >
                <Plus className="ml-2 h-5 w-5" />
                إضافة إيراد جديد
              </Button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-[560px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
              dir="rtl"
            >
              <DialogHeader>
                <DialogTitle className="text-right text-2xl flex items-center gap-2 justify-end text-slate-900 dark:text-white">
                  <span>إضافة إيراد VIP جديد</span>
                  <Sparkles className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                </DialogTitle>
              </DialogHeader>
              {addDialogOpen && (
                <AddRevenueForm
                  employees={employees}
                  currencies={currencies}
                  onSuccess={handleAddSuccess}
                  onClose={() => setAddDialogOpen(false)}
                  apiUrl={API}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-emerald-200 dark:border-emerald-500/20 bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-slate-800 border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">إجمالي الإيرادات</CardTitle>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {total.toLocaleString()} جنيه
              </div>
              <p className="text-xs text-slate-500 mt-2">جميع الإيرادات المسجلة</p>
            </CardContent>
          </Card>

          <Card className="border-cyan-200 dark:border-cyan-500/20 bg-gradient-to-br from-white to-cyan-50 dark:from-slate-900 dark:to-slate-800 border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">الإيرادات المعروضة</CardTitle>
              <div className="p-2 bg-cyan-100 dark:bg-cyan-500/10 rounded-lg">
                <Filter className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                {filteredTotal.toLocaleString()} جنيه
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {isFilterActive ? 'بعد تطبيق الفلاتر' : 'جميع البيانات'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-500/20 bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-slate-800 border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">عدد السجلات</CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {revenues.length}
              </div>
              <p className="text-xs text-slate-500 mt-2">سجل معروض حالياً</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
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
                  <User className="h-4 w-4 text-slate-500" />
                  تصفية حسب الموظف
                </Label>
                <EmployeeCombobox
                  value={filterEmployee}
                  label={filterEmployeeLabel}
                  employees={employees}
                  placeholder="جميع الموظفين"
                  onSelect={(id, name) => { setFilterEmployee(id); setFilterEmployeeLabel(name); }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromDate" className="text-right block flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Calendar className="h-4 w-4 text-slate-500" />
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
                  <Calendar className="h-4 w-4 text-slate-500" />
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
                <Label className="text-right block opacity-0">actions</Label>
                <div className="flex gap-2">
                  <Button
                    onClick={handleApplyFilters}
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                  >
                    <Filter className="ml-2 h-4 w-4" />
                    تطبيق
                  </Button>
                  {isFilterActive && (
                    <Button
                      onClick={handleClearFilters}
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
        <Card className="shadow-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
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
                <p className="text-sm mt-2 text-slate-400">
                  {isFilterActive ? 'جرب تعديل الفلاتر للحصول على نتائج' : 'ابدأ بإضافة إيراد جديد'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800">
                      <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">العملات والمبالغ</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">الإجمالي (جنيه)</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">التاريخ</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">الموظف</TableHead>
                      <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenues.map((r, index) => (
                      <TableRow
                        key={r._id}
                        className={cn(
                          'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors',
                          index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-900/50',
                        )}
                      >
                        <TableCell className="text-right">
                          <div className="flex flex-col gap-1">
                            {r.currencies.map((c, ci) => (
                              <span key={ci} className="text-sm text-slate-700 dark:text-slate-300">
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                  {c.amount.toLocaleString()}
                                </span>{' '}
                                <Badge className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 text-xs">
                                  {c.currency?.code}
                                </Badge>
                                <span className="text-slate-400 dark:text-slate-500 text-xs mr-1">
                                  (×{c.exchangeRate})
                                </span>
                              </span>
                            ))}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {r.amount.toLocaleString()}
                          </span>
                          <span className="text-slate-500 text-sm mr-1">جنيه</span>
                        </TableCell>

                        <TableCell className="text-right text-slate-700 dark:text-slate-300">
                          {new Date(r.date).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </TableCell>

                        <TableCell className="text-right">
                          <Badge className="bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30">
                            {r.employee?.name || 'غير محدد'}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              onClick={() => setEditingRevenue(r)}
                              variant="outline"
                              size="sm"
                              className="bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteRevenue(r._id)}
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingRevenue} onOpenChange={(open) => { if (!open) setEditingRevenue(null); }}>
        <DialogContent
          className="max-w-[560px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle className="text-right text-2xl flex items-center gap-2 justify-end text-slate-900 dark:text-white">
              <span>تعديل الإيراد</span>
              <Edit className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </DialogTitle>
          </DialogHeader>

          {editingRevenue && (
            <EditRevenueForm
              key={editingRevenue._id}
              revenue={editingRevenue}
              employees={employees}
              currencies={currencies}
              onSuccess={handleEditSuccess}
              onClose={() => setEditingRevenue(null)}
              apiUrl={API}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}