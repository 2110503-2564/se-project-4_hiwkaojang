'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function DentistCatalog({ dentistsJson }: { dentistsJson: Promise<DentistJson> }) {
  const [search, setSearch] = useState('');
  const [dentists, setDentists] = useState<DentistItem[]>([]);
  const [filteredDentists, setFilteredDentists] = useState<DentistItem[]>([]);

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

  return (
    <>
      <div className="flex justify-center my-6">
        <input
          type="text"
          placeholder="Search dentists..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4AA3BA]"
        />
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
