"use client";

import { BASE_URL } from "@/lib/constants";
import { useEffect, useState } from "react";

type Cafe = {
  _id: string;
  name: string;
  branch: string;
  description?: string;
};

export default function CafeDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCafe = async () => {
      try {
        const res = await fetch(`${BASE_URL}/cafes/${params.id}`);
        const data = await res.json();
        setCafe(data);
      } catch (err) {
        console.error("Failed to load cafe", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCafe();
  }, [params.id]);

  if (loading) return <p className="p-5 text-xl">Loading...</p>;
  if (!cafe) return <p className="p-5 text-xl text-red-500">Cafe not found</p>;

  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold mb-4">{cafe.name}</h1>

      <p className="text-lg">
        <strong>Branch:</strong> {cafe.branch}
      </p>

      {cafe.description && (
        <p className="mt-3 text-gray-700">{cafe.description}</p>
      )}
    </div>
  );
}
