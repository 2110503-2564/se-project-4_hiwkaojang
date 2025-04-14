import Link from 'next/link';
import Image from 'next/image';

export default async function DentistCatalog({ dentistsJson }: { dentistsJson: Promise<DentistJson> }) {
  try {
    const dentistJsonReady = await dentistsJson;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {dentistJsonReady.data.map((dentistItem: DentistItem) => (
          <div key={dentistItem.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Image container with fixed aspect ratio */}
            <div className="relative w-full h-64"> {/* Changed from h-48 to h-64 for taller container */}
              <Image
                src={dentistItem.picture}
                alt={dentistItem.name}
                fill // This makes the image fill the container
                className="object-cover" // This ensures the image covers the area while maintaining aspect ratio
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{dentistItem.name}</h2>
              <p className="text-gray-600 mb-4">{dentistItem.area_expertise}</p>
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
    );
  } catch (error) {
    console.error('Failed to load dentists:', error);
    return <p className="text-center my-4 text-red-500">Failed to load dentists. Please try again later.</p>;
  }
}