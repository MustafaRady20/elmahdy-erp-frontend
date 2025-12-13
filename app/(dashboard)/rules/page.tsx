"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BASE_URL } from "@/lib/constants";

interface Rule {
  _id: string;
  title: string;
  description: string;
  type: "rule" | "instruction";
}

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "rule",
  });

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        const parsed = JSON.parse(userCookie);
        setUserRole(parsed.role);
      } catch {}
    }

    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/rules`);
      setRules(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async () => {
    try {
      const res = await axios.post(`${BASE_URL}}/rules`, form);
      setRules([res.data, ...rules]);
      setShowModal(false);
      setForm({ title: "", description: "", type: "rule" });
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إضافة القاعدة.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد حذف هذه القاعدة؟")) return;
    try {
      await axios.delete(`${BASE_URL}/rules/${id}`);
      setRules(rules.filter((r) => r._id !== id));
    } catch {
      alert("فشل حذف البيانات");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        قواعد وتعليمات الشركة
      </h1>

      {userRole === "manager" && (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button className="mb-4 w-full">إضافة قاعدة أو تعليمات</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة قاعدة جديدة</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 mt-3">
              <div>
                <label className="text-sm font-semibold">العنوان</label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-semibold">الوصف</label>
                <Textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-semibold block">
                  النوع
                </label>
                <select
                  className="border p-2 rounded w-full"
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                >
                  <option value="rule">قاعدة</option>
                  <option value="instruction">تعليمات</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                إلغاء
              </Button>

              <Button onClick={handleAddRule}>حفظ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {loading ? (
        <p className="text-center">جاري التحميل...</p>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <Card key={rule._id} className="shadow-md">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>{rule.title}</CardTitle>
                <span className="text-sm text-gray-500">
                  {rule.type === "rule" ? "قاعدة" : "تعليمات"}
                </span>
              </CardHeader>
              <CardContent>
                <p>{rule.description}</p>

                {userRole === "manager" && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(rule._id)}
                    >
                      حذف
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
