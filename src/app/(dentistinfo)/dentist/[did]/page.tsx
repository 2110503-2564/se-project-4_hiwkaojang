import Image from 'next/image';
import getDentist from '@/libs/getDentist';
import Link from 'next/link';

export default async function DentistDetailPage({ params }: { params: { did: string } }) {
  const dentistDetail = await getDentist(params.did);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="w-full bg-gray-100 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Dentists</h1>
        <div className="mt-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Home </Link> /
          <Link href="/dentist" className="hover:text-blue-600"> Dentists </Link> /
          <span className="text-gray-900"> {dentistDetail.data.name}</span>
        </div>
      </div>

      {/* Dentist Details */}
      <div className="max-w-4xl mx-auto my-10 bg-white p-8 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Image */}
          <Image
            src={dentistDetail.data.picture}
            alt="Dentist Image"
            width={250}
            height={250}
            className="rounded-lg shadow-md"
          />

          {/* Details */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900">{dentistDetail.data.name}</h2>
            <p className="text-gray-600 mt-2">
              <span className="font-semibold text-gray-900">Area of expertise:</span> {dentistDetail.data.area_expertise}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">Years of experience:</span> {dentistDetail.data.year_experience} Years
            </p>
            
            {/* Appointment Button */}
            <Link href={`/booking?did=${params.did}`}>
              <button className="mt-5 rounded-md bg-sky-600 px-5 py-2 text-white text-lg font-medium hover:bg-indigo-600 shadow-md">
                Make an Appointment
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
