"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";

interface AddCafeFormProps {
  onAdded: () => void; // callback to refresh list after adding
}

export default function AddCafeForm({ onAdded }: AddCafeFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", branch: "", description: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/cafes`, formData);
      setFormData({ name: "", branch: "", description: "" });
      setOpen(false);
      onAdded();
    } catch (err) {
      console.error("Failed to add cafe", err);
      alert("فشل في إضافة المقهى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">إضافة مقهى جديد</Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة مقهى جديد</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label>اسم المقهى</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label>الفرع</Label>
            <Input
              required
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
            />
          </div>

          <div>
            <Label>الوصف (اختياري)</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "جاري الإضافة..." : "إضافة"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
