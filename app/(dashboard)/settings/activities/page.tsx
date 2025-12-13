"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";
import { BASE_URL } from "@/lib/constants";

interface Activity {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });

  const fetchActivities = async () => {
    setLoading(true);
    const res = await fetch(`${BASE_URL}/activities`);
    const data = await res.json();
    setActivities(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const openAdd = () => {
    setEditId(null);
    setForm({ name: "", description: "" });
    setOpen(true);
  };

  const openEdit = (activity: Activity) => {
    setEditId(activity._id);
    setForm({ name: activity.name, description: activity.description ?? "" });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (editId) {
      await fetch(`${BASE_URL}/activities/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch(`${BASE_URL}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setOpen(false);
    fetchActivities();
  };

  const deleteActivity = async (id: string) => {
    await fetch(`${BASE_URL}/activities/${id}`, {
      method: "DELETE",
    });
    fetchActivities();
  };

  return (
    <div className="p-8" dir="rtl">
      {/* العنوان */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">الأنشطة</h1>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 ml-2" /> إضافة نشاط
        </Button>
      </div>

      {/* الجدول */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">الوصف</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {activities.map((a) => (
              <TableRow key={a._id}>
                <TableCell className="text-right">{a.name}</TableCell>
                <TableCell className="text-right">
                  {a.description || "-"}
                </TableCell>
                <TableCell className="text-right">
                  {a.isActive ? "نشط" : "غير نشط"}
                </TableCell>

                <TableCell className="text-left">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEdit(a)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteActivity(a._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {editId ? "تعديل النشاط" : "إضافة نشاط جديد"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Input
              placeholder="اسم النشاط"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <Input
              placeholder="وصف النشاط"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <Button onClick={handleSubmit}>{editId ? "تحديث" : "إنشاء"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
