"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function BookingHistoryCatalog({
  bookingJson,
}: {
  bookingJson: Promise<BookingJson>;
}) {
  const { data: session } = useSession();
  const [bookingJsonReady, setBookingJsonReady] = useState<BookingJson | null>(
    null
  );

  useEffect(() => {
    async function fetchBookingData() {
      try {
        const data = await bookingJson;
        setBookingJsonReady(data);
      } catch (error) {
        console.error("Failed to load dentists:", error);
      }
    }
    fetchBookingData();
  }, [bookingJson]);

  if (!session?.user?.token) {
    return (
      <p className="text-center my-4 text-red-500">
        You must be logged in to see your booking History.
      </p>
    );
  }

  if (!bookingJsonReady) {
    return <p className="text-center my-4">Loading...</p>;
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      {bookingJsonReady.data.map((bookingItem: BookingItem) => (
        <div
          key={bookingItem._id}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="flex w-full text-gray-500 items-center py-4">
            {/* Booking ID */}
            <div className="flex-1.5 min-w-[200px] px-4 border-r border-gray-300">
              <div className="font-bold text-black text-lg mb-1">
                Booking ID
              </div>
              <div className="text-sm break-all">{bookingItem._id}</div>
            </div>

            {/* Appointment Date */}
            <div className="flex-1 min-w-[200px] px-4 border-r border-gray-300">
              <div className="font-bold text-black text-lg mb-1">
                Appointment Date
              </div>
              <div className="text-sm">
                {formatDate(bookingItem.bookingDate)}
              </div>
            </div>

            {/* Dentist Name */}
            <div className="flex-0.5 min-w-[180px] px-4 border-r border-gray-300">
              <div className="font-bold text-black text-lg mb-1">
                Dentist Name
              </div>
              <div className="text-sm">{bookingItem.dentist.name}</div>
            </div>

            {/* Patient ID */}
            <div className="flex-0.5 min-w-[180px] px-4 border-r border-gray-300">
              <div className="font-bold text-black text-lg mb-1">
                Patient ID
              </div>
              <div className="text-sm">{session.user._id || "Patient"}</div>
            </div>

            {/* Status */}
            <div className="flex-1 min-w-[180px] px-4">
              <div className="font-bold text-black text-lg mb-1">
                Booking Status
              </div>
              <div className="text-sm">{bookingItem.status || "Status"}</div>
            </div>

          </div>
        </div>
      ))}

      {bookingJsonReady.data.length === 0 && (
        <div className="text-center text-gray-500">No bookings found.</div>
      )}
    </div>
  );
}