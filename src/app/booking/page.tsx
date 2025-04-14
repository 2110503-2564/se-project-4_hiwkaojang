'use client';
import { useState, useEffect } from "react";
import DentistDateReserve from "@/components/DateReserve";
import dayjs, { Dayjs } from "dayjs";
import createBooking from "@/libs/createBooking";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import getUserProfile from "@/libs/getUserProfile";

export default function Reservations() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const didFromParams = searchParams.get("did");
  const [dentist, setDentist] = useState<string>(didFromParams || '');
  const [appointmentDate, setAppointmentDate] = useState<Dayjs | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (didFromParams) {
      setDentist(didFromParams);
    }
  }, [didFromParams]);
  
  const handleBooking = async () => {
    if (!dentist || !appointmentDate) {
      setError("Please select a dentist and appointment date.");
      return;
    }

    if (!session?.user?.token) {
      setError("You must be logged in to make a booking.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formattedDate = appointmentDate.toISOString();
      await createBooking(dentist, session.user.token, formattedDate);
      setSuccess("Booking successful!");
    } catch (err) {
      const userProfile = await getUserProfile(session.user.token);
      if(userProfile.data.role === "banned") {
        setError("Failed to create booking. You got banned");
      } else {
        setError("Failed to create booking. You already have a booking!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full flex flex-col items-center bg-white min-h-screen">
      {/* Header Banner */}
      <div className="w-full bg-gray-100 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Booking</h1>
        <div className="mt-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Home</Link> / <span>Booking</span>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">
            Schedule your <span className="text-[#4AA3BA]">Dental Booking</span>
          </h2>
        </div>
        
        {/* Booking Card */}
        <div className="bg-white rounded-lg shadow-lg max-w-lg mx-auto p-8">
          <DentistDateReserve
            onDateChange={(value: Dayjs) => setAppointmentDate(value)}
            onDentistChange={(value: string) => setDentist(value)}
            selectedDentist={dentist}
          />

          {/* Centered Messages */}
          <div className="text-center">
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {success && <p className="text-green-500 mt-4">{success}</p>}
          </div>

          <div className="mt-8">
            <button
              className="w-full bg-[#5EBFD3] hover:bg-[#4AA3BA] text-white font-medium py-3 px-4 rounded-full transition-colors duration-200"
              onClick={handleBooking}
              disabled={loading}
            >
              {loading ? "Booking..." : "Make an appointment"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}