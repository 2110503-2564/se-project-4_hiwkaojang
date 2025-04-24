import Image from 'next/image';
import getDentist from '@/libs/getDentist';
import Link from 'next/link';
import Rating from '@/components/Rating';

export default async function DentistDetailPage({ params }: { params: { did: string } }) {
  const dentistDetail = await getDentist(params.did);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="w-full bg-gray-100 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Dentists</h1>
        <div className="mt-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Home </Link> /
          <Link href="/dentist" className="hover:text-blue-600"> Dentists </Link> /
          <span className="text-gray-900"> {dentistDetail.data.name}</span>
        </div>
      </div>

      {/* Dentist Details */}
      <div className=" mx-auto my-auto bg-white ">
        <div className="flex items-center gap-10 px-40 py-10 max-w-7xl mx-auto gap-40">
          {/* Image */}
          <Image
            src={dentistDetail.data.picture}
            alt="Dentist Image"
            width={350}
            height={350}
            className="rounded-lg shadow-md"
          />

          {/* Details */}
          <div className="text-center md:text-left space-y-10">
            <h1 className="text-5xl font-bold text-gray-900">{dentistDetail.data.name}</h1>
            <p className="text-gray-600 mt-2">
              <span className="font-semibold text-gray-900">Area of expertise:</span> {dentistDetail.data.area_expertise}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">Years of experience:</span> {dentistDetail.data.year_experience} Years
            </p>
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">Starting price:</span> {dentistDetail.data.StartingPrice}
            </p>
            
            {/* Appointment Button */}
            <Link href={`/booking?did=${params.did}`}>
              <button className="mt-12 rounded-3xl bg-[#4AA3BA] text-white px-4 py-2 text-lg font-medium hover:bg-[#3b8294] transition-colors">
                Make an Appointment
              </button>
            </Link>
          </div>
        </div>

        {/* Reviews */}
        <Rating dentistId={params.did} />

        
      </div> 
      
    </main>
  );
}
