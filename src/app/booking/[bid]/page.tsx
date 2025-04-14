"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import dayjs, { Dayjs } from "dayjs";
import getBooking from "@/libs/getBooking";
import { useRouter } from "next/navigation";
import DentistDateReserve from "@/components/DateReserve";
import updateBooking from "@/libs/updateBooking";

export default function EditBooking({ params }: { params: { bid: string } }) {
  const { data: session } = useSession();
  const router = useRouter();

  const [bookingJson, setBookingJson] = useState<any>(null);
  const [dentist, setDentist] = useState<string>("");
  const [appointmentDate, setAppointmentDate] = useState<Dayjs | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!session || !session.user?.token) {
      router.push("/auth/signin");
    }
  }, [session, router]);

  useEffect(() => {
    if (session?.user?.token) {
      getBooking(session.user.token, params.bid)
        .then((data) => {
          setBookingJson(data);
          setDentist(data.data.dentist._id || "");
          setAppointmentDate(dayjs(data.data.bookingDate));
        })
        .catch(() => setError("Failed to load booking data"));
    }
  }, [session, params.bid]);

  const handleEditBooking = async () => {
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
      await updateBooking(bookingJson.data._id, session.user.token, formattedDate, dentist);
      setSuccess("Booking Edited!");
    } catch (err) {
      setError("Failed to edit booking.");
    } finally {
      setLoading(false);
    }
  };

  if (!bookingJson) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl animate-fade-in">
          <div className="flex justify-center space-x-2 mb-5">
            <div className="h-3 w-3 bg-[#5EBFD3] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-3 w-3 bg-[#5EBFD3] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-3 w-3 bg-[#5EBFD3] rounded-full animate-bounce"></div>
          </div>
          
          <p className="text-lg font-medium text-gray-700 animate-pulse">
            Loading booking details<span className="animate-ellipsis">...</span>
          </p>
          
          <div className="mt-6 w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-[#5EBFD3] rounded-full animate-progress"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full flex flex-col items-center bg-white min-h-screen">
      <div className="w-full bg-gray-100 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Edit Booking</h1>
        <div className="mt-2 text-sm text-gray-600">
          <Link href="/booking" className="hover:text-blue-600">
            Booking
          </Link>{" "}
          / <span>Edit Booking</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">
            Edit your <span className="text-[#4AA3BA]">Dental Booking</span>
          </h2>
        </div>

        <div className="bg-white rounded-lg shadow-lg max-w-lg mx-auto p-8">
          <DentistDateReserve
            onDateChange={(value: Dayjs) => setAppointmentDate(value)}
            onDentistChange={(value: string) => setDentist(value)}
            selectedDentist={dentist}
            selectedDate={appointmentDate}
          />

          {error && <p className="text-red-500 mt-4">{error}</p>}
          {success && <p className="text-green-500 mt-4">{success}</p>}

          <div className="mt-8">
            <button
              className="w-full bg-[#5EBFD3] hover:bg-[#4AA3BA] text-white font-medium py-3 px-4 rounded-full transition-colors duration-200"
              onClick={handleEditBooking}
              disabled={loading}
            >
              {loading ? "Editing Booking..." : "Edit Appointment"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}