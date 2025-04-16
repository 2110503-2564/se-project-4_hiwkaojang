'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface DentistItem {
  id: number;
  name: string;
  area_expertise: string;
  StartingPrice: number; // เปลี่ยนเป็น number
  picture: string;
}

interface DentistCatalogProps {
  dentistsJson: Promise<{ data: DentistItem[] }>;
}

export default function DentistCatalog({ dentistsJson }: DentistCatalogProps) {
  const [search, setSearch] = useState<string>('');
  const [dentists, setDentists] = useState<DentistItem[]>([]);
  const [filteredDentists, setFilteredDentists] = useState<DentistItem[]>([]);
  const [sortAscending, setSortAscending] = useState<boolean>(true);

  useEffect(() => {
    dentistsJson.then(data => {
      setDentists(data.data);
      setFilteredDentists(data.data);
    });
  }, [dentistsJson]);

  useEffect(() => {
    const filtered = dentists.filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.area_expertise.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredDentists(filtered);
  }, [search, dentists]);

  const handleSort = () => {
    const sorted = [...filteredDentists].sort((a, b) => {
      return sortAscending ? a.StartingPrice - b.StartingPrice : b.StartingPrice - a.StartingPrice;
    });
    setFilteredDentists(sorted);
    setSortAscending(!sortAscending);
  };

  return (
    <>
      <div className="flex justify-center items-center my-6">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search dentists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4AA3BA] pl-10"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <button
          onClick={handleSort}
          className="flex items-center px-4 py-2 bg-[#4AA3BA] text-white rounded-lg hover:bg-[#3b8294] transition duration-300"
        >
          Sort
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDentists.map((dentistItem: DentistItem) => (
          <div key={dentistItem.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative w-full h-64">
              <Image
                src={dentistItem.picture}
                alt={dentistItem.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{dentistItem.name}</h2>
              <p className="text-gray-600 mb-4">{dentistItem.area_expertise}</p>
              <p className="text-gray-600 mb-4">Starting price: {dentistItem.StartingPrice} ฿</p>
              <Link
                href={`/dentist/${dentistItem.id}`}
                className="inline-block bg-[#4AA3BA] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#3b8294] transition duration-300"
              >
                View Profile and Booking
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}