"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-react";
import { BASE_URL } from "@/lib/constants";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fetch categories
  const fetchCategories = async () => {
    const res = await fetch(`${BASE_URL}/categories`);
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Create or update category
  const handleSubmit = async () => {
    if (editMode) {
      await fetch(`${BASE_URL}/categories/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName }),
      });
    } else {
      await fetch(`${BASE_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName }),
      });
    }

    setOpen(false);
    setCategoryName("");
    setEditMode(false);
    setSelectedId(null);
    fetchCategories();
  };

  const handleEdit = (cat: any) => {
    setCategoryName(cat.name);
    setSelectedId(cat._id);
    setEditMode(true);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا التصنيف؟")) return;
    await fetch(`${BASE_URL}/categories/${id}`, {
      method: "DELETE",
    });
    fetchCategories();
  };

  return (
    <div className="p-6">

      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">إدارة التصنيفات</h1>
        <Button
          onClick={() => {
            setEditMode(false);
            setCategoryName("");
            setOpen(true);
          }}
        >
          <Plus className="me-2 h-4 w-4" />
          إضافة تصنيف
        </Button>
      </div>

      {/* Categories Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right w-1/2">اسم التصنيف</TableHead>
            <TableHead className="text-center w-1/4">تعديل</TableHead>
            <TableHead className="text-center w-1/4">حذف</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {categories.map((cat: any) => (
            <TableRow key={cat._id}>
              <TableCell className="text-right">{cat.name}</TableCell>

              <TableCell className="text-center">
                <Button
                  variant="outline"
                  onClick={() => handleEdit(cat)}
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  تعديل
                </Button>
              </TableCell>

              <TableCell className="text-center">
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(cat._id)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "تعديل التصنيف" : "إضافة تصنيف جديد"}
            </DialogTitle>
          </DialogHeader>

          <Input
            placeholder="اسم التصنيف"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />

          <Button className="w-full" onClick={handleSubmit}>
            {editMode ? "تحديث" : "إضافة"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
