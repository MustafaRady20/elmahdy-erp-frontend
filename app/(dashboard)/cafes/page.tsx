"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AddCafeForm from "./AddCafeForm";
import { BASE_URL } from "@/lib/constants";

type Cafe = {
  _id: string;
  name: string;
  branch: string;
  description?: string;
};

export default function CafesPage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCafes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/cafes`);
      const data = await res.json();
      setCafes(data);
    } catch (err) {
      console.error("Failed to load cafes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCafes();
  }, []);

  if (loading) return <p className="p-5 text-xl">Loading...</p>;

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Cafes</h1>
        <AddCafeForm onAdded={fetchCafes} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cafes.map((cafe) => (
          <Link
            href={`/cafes/${cafe._id}`}
            key={cafe._id}
            className="p-4 border rounded-lg shadow hover:bg-gray-100 transition"
          >
            <h2 className="text-xl font-semibold">{cafe.name}</h2>
            <p className="text-gray-600">Branch: {cafe.branch}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
