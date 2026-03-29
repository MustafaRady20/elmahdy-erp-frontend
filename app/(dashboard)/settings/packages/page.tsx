"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  Crown,
  DollarSign,
  X,
  Loader2,
  Package,
  CheckCircle2,
} from "lucide-react";
import { BASE_URL } from "@/lib/constants";

interface LocalizedContent {
  name: string;
  description: string;
  features: string[];
}

interface TravelPackage {
  _id: string;
  ar: LocalizedContent;
  en: LocalizedContent;
  price: number;
  popular: boolean;
  premium: boolean;
}

type PackageFormData = Omit<TravelPackage, "_id">;

const EMPTY_FORM: PackageFormData = {
  ar: { name: "", description: "", features: [] },
  en: { name: "", description: "", features: [] },
  price: 0,
  popular: false,
  premium: false,
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

const api = {
  getAll: () => apiFetch<TravelPackage[]>("/packages"),
  create: (body: PackageFormData) =>
    apiFetch<TravelPackage>("/packages", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: string, body: Partial<PackageFormData>) =>
    apiFetch<TravelPackage>(`/packages/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    apiFetch<{ message: string }>(`/packages/${id}`, { method: "DELETE" }),
};

function FeatureTagInput({
  features,
  onChange,
  dir,
}: {
  features: string[];
  onChange: (f: string[]) => void;
  dir?: "ltr" | "rtl";
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (v && !features.includes(v)) {
      onChange([...features, v]);
      setInput("");
    }
  };
  return (
    <div className="space-y-2" dir={dir}>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Type a feature, press Enter"
          className="flex-1 h-9"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 px-3"
          onClick={add}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {features.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {features.map((f, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="gap-1 pr-1 font-normal text-xs h-6"
            >
              {f}
              <button
                type="button"
                onClick={() => onChange(features.filter((_, j) => j !== i))}
                className="ml-0.5 opacity-50 hover:opacity-100 hover:text-destructive transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function EditDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: TravelPackage;
  onSave: (data: PackageFormData) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PackageFormData>(EMPTY_FORM);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              ar: { ...initial.ar, features: [...initial.ar.features] },
              en: { ...initial.en, features: [...initial.en.features] },
              price: initial.price,
              popular: initial.popular,
              premium: initial.premium,
            }
          : EMPTY_FORM,
      );
    }
  }, [open, initial]);

  const setLang = (lang: "en" | "ar") => (patch: Partial<LocalizedContent>) =>
    setForm((f) => ({ ...f, [lang]: { ...f[lang], ...patch } }));

  const handleSave = async () => {
    if (!form.en.name.trim() || !form.ar.name.trim()) {
      toast.error("Both English and Arabic names are required.");
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      onOpenChange(false);
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit package" : "New package"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="grid grid-cols-3 gap-3 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-sm">
                Price *
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  min={0}
                  className="pl-8 h-9"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: Number(e.target.value) }))
                  }
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer rounded-md border px-3 py-2 h-9">
              <Switch
                checked={form.popular}
                onCheckedChange={(v) => setForm((f) => ({ ...f, popular: v }))}
              />
              <span className="text-sm flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-amber-500" /> Popular
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer rounded-md border px-3 py-2 h-9">
              <Switch
                checked={form.premium}
                onCheckedChange={(v) => setForm((f) => ({ ...f, premium: v }))}
              />
              <span className="text-sm flex items-center gap-1.5">
                <Crown className="h-3.5 w-3.5 text-violet-500" /> Premium
              </span>
            </label>
          </div>

          <Separator />

          <Tabs defaultValue="en">
            <TabsList className="w-full h-9">
              <TabsTrigger value="en" className="flex-1 text-sm">
                🇬🇧 English
              </TabsTrigger>
              <TabsTrigger value="ar" className="flex-1 text-sm">
                🇸🇦 Arabic
              </TabsTrigger>
            </TabsList>
            {(["en", "ar"] as const).map((lang) => (
              <TabsContent key={lang} value={lang} className="space-y-3 pt-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Name *</Label>
                  <Input
                    dir={lang === "ar" ? "rtl" : "ltr"}
                    className="h-9"
                    value={form[lang].name}
                    onChange={(e) => setLang(lang)({ name: e.target.value })}
                    placeholder={lang === "ar" ? "اسم الباقة" : "Package name"}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Description</Label>
                  <Textarea
                    dir={lang === "ar" ? "rtl" : "ltr"}
                    rows={2}
                    className="resize-none text-sm"
                    value={form[lang].description}
                    onChange={(e) =>
                      setLang(lang)({ description: e.target.value })
                    }
                    placeholder={
                      lang === "ar" ? "وصف الباقة" : "Short description…"
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Features</Label>
                  <FeatureTagInput
                    dir={lang === "ar" ? "rtl" : "ltr"}
                    features={form[lang].features}
                    onChange={(features) => setLang(lang)({ features })}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            {initial ? "Save changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TravelPackage | undefined>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPackages(await api.getAll());
    } catch {
      toast.error("Failed to load packages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };
  const openEdit = (pkg: TravelPackage) => {
    setEditing(pkg);
    setDialogOpen(true);
  };

  const handleSave = async (data: PackageFormData) => {
    if (editing) {
      const updated = await api.update(editing._id, data);
      setPackages((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p)),
      );
      toast.success("Package updated.");
    } else {
      const created = await api.create(data);
      setPackages((prev) =>
        [...prev, created].sort((a, b) => a.price - b.price),
      );
      toast.success("Package created.");
    }
  };

  const handleDelete = async (pkg: TravelPackage) => {
    if (!confirm(`Delete "${pkg.en.name}"?`)) return;
    setDeletingId(pkg._id);
    try {
      await api.remove(pkg._id);
      setPackages((prev) => prev.filter((p) => p._id !== pkg._id));
      toast.success("Deleted.");
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Travel Packages</h1>
          {!loading && (
            <span className="text-sm text-muted-foreground tabular-nums">
              {packages.length}
            </span>
          )}
        </div>
        <Button size="sm" onClick={openCreate} className="gap-1.5 h-8">
          <Plus className="h-3.5 w-3.5" /> Add package
        </Button>
      </div>

      {/* List */}
      <div className="divide-y rounded-lg border">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3.5"
            >
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-7 w-16" />
            </div>
          ))
        ) : packages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
            <Package className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No packages yet.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={openCreate}
              className="mt-1 gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Add your first package
            </Button>
          </div>
        ) : (
          packages.map((pkg) => (
            <div
              key={pkg._id}
              className="flex items-center gap-4 px-4 py-3.5 hover:bg-muted/40 transition-colors group"
            >
              {/* Name + meta */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm truncate">
                    {pkg.en.name}
                  </span>
                  <span className="text-xs text-muted-foreground" dir="rtl">
                    {pkg.ar.name}
                  </span>
                  {pkg.popular && (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                      <Star className="h-3 w-3" /> Popular
                    </span>
                  )}
                  {pkg.premium && (
                    <span className="inline-flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400">
                      <Crown className="h-3 w-3" /> Premium
                    </span>
                  )}
                </div>
                {pkg.en.features.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {pkg.en.features.slice(0, 4).map((f, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 text-xs text-muted-foreground"
                      >
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                        {f}
                      </span>
                    ))}
                    {pkg.en.features.length > 4 && (
                      <span className="text-xs text-muted-foreground">
                        +{pkg.en.features.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Price */}
              <span className="text-sm font-mono font-medium shrink-0">
                ${pkg.price.toLocaleString()}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0  transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => openEdit(pkg)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(pkg)}
                  disabled={deletingId === pkg._id}
                >
                  {deletingId === pkg._id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <EditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSave={handleSave}
      />
    </div>
  );
}
