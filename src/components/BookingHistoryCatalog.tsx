"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Rating from "@mui/material/Rating";
import submitDentistReview from "@/libs/createReview";

interface BookingItem {
  _id: string;
  bookingDate: string;
  status: string;
  dentist: {
    _id: string;
    name: string;
  };
}

interface BookingJson {
  data: BookingItem[];
}

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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [filteredBookings, setFilteredBookings] = useState<BookingItem[]>([]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [displayedBookings, setDisplayedBookings] = useState<BookingItem[]>([]);

  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

  useEffect(() => {
    async function fetchBookingData() {
      try {
        const data = await bookingJson;
        setBookingJsonReady(data);
        applyFiltersAndSort(data.data);
      } catch (error) {
        console.error("Failed to load bookings:", error);
      }
    }
    fetchBookingData();
  }, [bookingJson]);

  useEffect(() => {
    if (bookingJsonReady) {
      setCurrentPage(1);
      applyFiltersAndSort(bookingJsonReady.data);
    }
  }, [sortOption, statusFilter, searchTerm, dateRange, bookingJsonReady]);

  useEffect(() => {
    updateDisplayedBookings();
  }, [filteredBookings, currentPage, itemsPerPage]);

  const applyFiltersAndSort = (bookings: BookingItem[]) => {
    if (!bookings) return;

    let filtered = bookings;
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(
        (booking) => new Date(booking.bookingDate) >= startDate
      );
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (booking) => new Date(booking.bookingDate) <= endDate
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.dentist.name.toLowerCase().includes(term) ||
          booking._id.toLowerCase().includes(term)
      );
    }

    switch (sortOption) {
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.bookingDate).getTime() -
            new Date(a.bookingDate).getTime()
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.bookingDate).getTime() -
            new Date(b.bookingDate).getTime()
        );
        break;
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.bookingDate).getTime() -
            new Date(a.bookingDate).getTime()
        );
    }

    setFilteredBookings(filtered);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / itemsPerPage)));
  };

  const updateDisplayedBookings = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedBookings(filteredBookings.slice(startIndex, endIndex));
  };

  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const viewBookingDetails = (booking: BookingItem) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedBooking(null);
  };

  const openReviewModal = (booking: BookingItem) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedBooking(null);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const resetFilters = () => {
    setSortOption("newest");
    setStatusFilter("all");
    setSearchTerm("");
    setDateRange({ start: "", end: "" });
    setCurrentPage(1);
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;

    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisibleButtons / 2)
    );
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    buttons.push(
      <button
        key="prev"
        onClick={goToPreviousPage}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded ${
          currentPage === 1
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-white text-[#4AA3BA] hover:bg-gray-100"
        }`}
      >
        &lt;
      </button>
    );

    if (startPage > 1) {
      buttons.push(
        <button
          key="1"
          onClick={() => goToPage(1)}
          className="px-3 py-1 bg-white text-[#4AA3BA] hover:bg-gray-100 rounded"
        >
          1
        </button>
      );

      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-2">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 rounded ${
            currentPage === i
              ? "bg-[#4AA3BA] text-white"
              : "bg-white text-[#4AA3BA] hover:bg-gray-100"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages - 1) {
      buttons.push(
        <span key="ellipsis2" className="px-2">
          ...
        </span>
      );
    }

    if (endPage < totalPages) {
      buttons.push(
        <button
          key={totalPages}
          onClick={() => goToPage(totalPages)}
          className="px-3 py-1 bg-white text-[#4AA3BA] hover:bg-gray-100 rounded"
        >
          {totalPages}
        </button>
      );
    }

    buttons.push(
      <button
        key="next"
        onClick={goToNextPage}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded ${
          currentPage === totalPages
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-white text-[#4AA3BA] hover:bg-gray-100"
        }`}
      >
        &gt;
      </button>
    );

    return buttons;
  };

  const BookingDetailModal = () => {
    if (!selectedBooking || !showDetailModal) return null;

    const statusClass = getStatusColor(selectedBooking.status);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#4AA3BA]">
              Appointment Details
            </h2>
            <button
              onClick={closeDetailModal}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold">Booking ID</h3>
                <p className="text-gray-700 break-all">{selectedBooking._id}</p>
              </div>
              <div className="mt-2 md:mt-0">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}
                >
                  {selectedBooking.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Appointment Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium">
                      {formatDate(selectedBooking.bookingDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Dentist Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Dentist Name</p>
                    <p className="font-medium">
                      {selectedBooking.dentist?.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  //แก้ review dentist
  const ReviewModal = () => {
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error" | "">(
      ""
    );

    if (!selectedBooking || !showReviewModal) return null;

    const handleSubmit = async () => {
      try {
        setLoading(true);
        await submitDentistReview(
          selectedBooking.dentist._id,
          session.user.token,
          rating,
          reviewText
        );
        setMessage("Review submitted successfully!");
        setMessageType("success");
        setReviewText("");
        setRating(5);
        // Optional: close modal after delay
        setTimeout(() => {
          closeReviewModal();
          setMessage("");
          setMessageType("");
        }, 2000);
      } catch (err) {
        setMessage("Failed to submit review. Please try again.");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#4AA3BA]">Review Dentist</h2>
            <button
              onClick={closeReviewModal}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* In-modal Alert */}
            {message && (
              <div
                className={`p-2 rounded-md text-sm ${
                  messageType === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <textarea
              className="w-full border-b border-gray-400 p-2 text-gray-600 placeholder-gray-400 focus:outline-none focus:border-black resize-none"
              placeholder="Add Review..."
              rows={2}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <Rating
              value={rating}
              onChange={(e, newValue) => setRating(newValue || 0)}
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#4AA3BA] text-white px-4 py-2 rounded-md hover:bg-[#3A92A9] transition duration-300 w-full"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h2 className="text-lg font-bold mb-3">Filter Appointments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="searchTerm"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              Search
            </label>
            <input
              type="text"
              id="searchTerm"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by dentist or ID"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#4AA3BA] focus:border-[#4AA3BA]"
            />
          </div>

          <div>
            <label
              htmlFor="statusFilter"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              Status
            </label>
            <div className="relative">
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-[#4AA3BA] focus:border-[#4AA3BA] appearance-none"
              >
                <option value="all">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="startDate"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              From Date
            </label>
            <input
              type="date"
              id="startDate"
              name="start"
              value={dateRange.start}
              onChange={handleDateChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#4AA3BA] focus:border-[#4AA3BA]"
            />
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              To Date
            </label>
            <input
              type="date"
              id="endDate"
              name="end"
              value={dateRange.end}
              onChange={handleDateChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#4AA3BA] focus:border-[#4AA3BA]"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-4">
          <button
            onClick={resetFilters}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition duration-300 mb-2 md:mb-0"
          >
            Reset Filters
          </button>

          <div className="flex items-center gap-2">
            <label htmlFor="sortBookings" className="text-gray-700 font-medium">
              Sort by:
            </label>
            <div className="relative">
              <select
                id="sortBookings"
                value={sortOption}
                onChange={handleSortChange}
                className="bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-[#4AA3BA] focus:border-[#4AA3BA] appearance-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-gray-600 mb-2 md:mb-0">
          Showing {displayedBookings.length} of {filteredBookings.length}{" "}
          {filteredBookings.length === 1 ? "appointment" : "appointments"}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="itemsPerPage"
              className="text-gray-700 text-sm whitespace-nowrap"
            >
              Show:
            </label>
            <div className="relative">
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="bg-white border border-gray-300 rounded-md py-1 pl-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#4AA3BA] focus:border-[#4AA3BA] appearance-none text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-3 w-3"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {displayedBookings.length > 0 ? (
        displayedBookings.map((bookingItem: BookingItem) => (
          <div
            key={bookingItem._id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300"
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
              <div className="flex-0.5 min-w-[150px] px-4 border-r border-gray-300">
                <div className="font-bold text-black text-lg mb-1">
                  Patient ID
                </div>
                <div className="text-sm">{session.user._id || "Patient"}</div>
              </div>
              <div className="flex-0.5 min-w-[150px] px-4 border-r border-gray-300">
                <div className="font-bold text-black text-lg mb-1">Status</div>
                <div className="text-sm">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      bookingItem.status
                    )}`}
                  >
                    {bookingItem.status || "Status"}
                  </span>
                </div>
              </div>
              <div className="flex-0.5 min-w-[120px] px-4">
                <button
                  onClick={() => viewBookingDetails(bookingItem)}
                  className={`bg-[#4AA3BA] text-white px-4 py-2 rounded-md hover:bg-[#3A92A9] transition duration-300 ${
                    bookingItem.status === "completed"
                      ? "w-full h-1/3 text-sm mb-2"
                      : "W-full"
                  }`}
                >
                  View Details
                </button>
                <br />
                {bookingItem.status === "completed" && (
                  <button
                    onClick={() => openReviewModal(bookingItem)}
                    className="bg-[#4AA3BA] text-white px-4 py-2 rounded-md hover:bg-[#3A92A9] transition duration-300 w-full h-1/3 text-sm"
                  >
                    Review Dentist
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 bg-white p-8 rounded-xl shadow-md">
          No appointments found matching your filters.
        </div>
      )}

      {filteredBookings.length > 0 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-1">{renderPaginationButtons()}</div>
        </div>
      )}

      {filteredBookings.length > 0 && (
        <div className="text-center text-gray-500 text-sm">
          Page {currentPage} of {totalPages}
        </div>
      )}

      <BookingDetailModal />
      <ReviewModal />
    </div>
  );
}
