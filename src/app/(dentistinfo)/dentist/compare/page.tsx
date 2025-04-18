"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import getDentist from "@/libs/getDentist";
import TopMenu from "@/components/TopMenu";

interface Dentist {
  id: number;
  name: string;
  area_expertise: string;
  year_experience: number;
  StartingPrice: number;
  picture: string;
}

export default function CompareDentistPage() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids");

  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!idsParam) return;

        const ids = idsParam.split(",").map((id) => id.trim());
        const dentistData = await Promise.all(
          ids.map(async (id) => {
            const res = await getDentist(id);
            return res.data;
          })
        );

        setDentists(dentistData);
      } catch (err) {
        setError("Failed to load comparison data.");
      }
    };

    fetchData();
  }, [idsParam]);

  if (error)
    return <div className="text-red-600 text-center mt-10">{error}</div>;
  if (dentists.length < 2)
    return <div className="text-center mt-10">Loading comparison...</div>;

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="min-h-screen bg-gray-50">
        <TopMenu />

        <div className="w-full bg-gray-100 py-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Compare Dentists</h1>
          <div className="mt-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>{" "}
            /{" "}
            <Link href="/dentist" className="hover:text-blue-600">
              Dentists
            </Link>{" "}
            / <span>Compare</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-3xl font-bold text-gray-800">
            Your smile, your choice
          </h2>
          <p className="text-3xl font-bold text-[#4AA3BA]">
            compare and find the dentist who suits you best
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-stretch gap-0 max-w-6xl mx-auto border rounded-xl shadow-md bg-white overflow-hidden">
          {dentists.map((dentist, idx) => (
            <div
              key={idx}
              className={`flex-1 p-6 flex flex-col items-center ${
                idx === 0 ? "md:border-r-2 md:border-gray-500" : ""
              }`}
            >
              <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">
              <Image
                src={dentist.picture}
                alt={dentist.name}
                width={250}
                height={250}
                className="w-md h-64 rounded-lg shadow-md object-cover"
              /></div>
              <h2 className="text-2xl font-bold text-center text-gray-800 mt-4">
                {dentist.name}
              </h2>
              <div className="text-gray-600 mt-4 space-y-2 text-center">
                <p>
                  <strong>Area of Expertise:</strong> {dentist.area_expertise}
                </p>
                <p>
                  <strong>Years of Experience:</strong>{" "}
                  {dentist.year_experience} Years
                </p>
                <p>
                  <strong>Starting Price:</strong> {dentist.StartingPrice} ฿
                </p>
              </div>
              <div className="mt-6">
                <Link href={`/booking?did=${dentist.id}`}>
                  <button className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-6 rounded-full shadow-md">
                    Book Appointment
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
