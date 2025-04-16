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
  const [sortOption, setSortOption] = useState<string>("newest");
  const [sortedBookings, setSortedBookings] = useState<BookingItem[]>([]);

  useEffect(() => {
    async function fetchBookingData() {
      try {
        const data = await bookingJson;
        setBookingJsonReady(data);
        
        // Initial sort when data loads
        sortBookings(data.data, sortOption);
      } catch (error) {
        console.error("Failed to load dentists:", error);
      }
    }
    fetchBookingData();
  }, [bookingJson]);

  const sortBookings = (bookings: BookingItem[], option: string) => {
    if (!bookings) return;
    
    let sorted = [...bookings];
    
    switch (option) {
      case "newest":
        sorted.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
        break;
      default:
        sorted.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
    }
    
    setSortedBookings(sorted);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortOption = e.target.value;
    setSortOption(newSortOption);
    
    if (bookingJsonReady) {
      sortBookings(bookingJsonReady.data, newSortOption);
    }
  };

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
      {/* Sorting dropdown */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2">
          <label htmlFor="sortBookings" className="text-gray-700 font-medium">
            Sort by:
          </label>
          <select
            id="sortBookings"
            value={sortOption}
            onChange={handleSortChange}
            className="flex items-center px-4 py-2 bg-[#4AA3BA] text-white rounded-lg hover:bg-[#3b8294] transition duration-300"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {sortedBookings.length > 0 ? (
        sortedBookings.map((bookingItem: BookingItem) => (
          <div
            key={bookingItem._id}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="flex w-full text-gray-500 items-center py-4">
              <div className="flex-1.5 min-w-[200px] px-4 border-r border-gray-300">
                <div className="font-bold text-black text-lg mb-1">
                  Booking ID
                </div>
                <div className="text-sm break-all">{bookingItem._id}</div>
              </div>
              <div className="flex-1 min-w-[200px] px-4 border-r border-gray-300">
                <div className="font-bold text-black text-lg mb-1">
                  Appointment Date
                </div>
                <div className="text-sm">
                  {formatDate(bookingItem.bookingDate)}
                </div>
              </div>
              <div className="flex-0.5 min-w-[180px] px-4 border-r border-gray-300">
                <div className="font-bold text-black text-lg mb-1">
                  Dentist Name
                </div>
                <div className="text-sm">{bookingItem.dentist.name}</div>
              </div>
              <div className="flex-0.5 min-w-[180px] px-4 border-r border-gray-300">
                <div className="font-bold text-black text-lg mb-1">
                  Patient ID
                </div>
                <div className="text-sm">{session.user._id || "Patient"}</div>
              </div>
              <div className="flex-1 min-w-[180px] px-4">
                <div className="font-bold text-black text-lg mb-1">
                  Booking Status
                </div>
                <div className="text-sm">{bookingItem.status || "Status"}</div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500">No bookings found.</div>
      )}
    </div>
  );
}