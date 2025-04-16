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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: "", 
    end: ""
  });
  const [filteredBookings, setFilteredBookings] = useState<BookingItem[]>([]);
  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [displayedBookings, setDisplayedBookings] = useState<BookingItem[]>([]);

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
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(booking => new Date(booking.bookingDate) >= startDate);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(booking => new Date(booking.bookingDate) <= endDate);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.dentist.name.toLowerCase().includes(term) || 
        booking._id.toLowerCase().includes(term)
      );
    }
    
    switch (sortOption) {
      case "newest":
        filtered.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
        break;
      default:
        filtered.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
    }
    
    setFilteredBookings(filtered);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / itemsPerPage)));
  };

  const updateDisplayedBookings = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedBookings(filteredBookings.slice(startIndex, endIndex));
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
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

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
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
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
            : 'bg-white text-[#4AA3BA] hover:bg-gray-100'
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
          <span key="ellipsis1" className="px-2">...</span>
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
              ? 'bg-[#4AA3BA] text-white' 
              : 'bg-white text-[#4AA3BA] hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }
    
    if (endPage < totalPages - 1) {
      buttons.push(
        <span key="ellipsis2" className="px-2">...</span>
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
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
            : 'bg-white text-[#4AA3BA] hover:bg-gray-100'
        }`}
      >
        &gt;
      </button>
    );
    
    return buttons;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h2 className="text-lg font-bold mb-3">Filter Appointments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="searchTerm" className="block text-gray-700 text-sm font-medium mb-1">
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
            <label htmlFor="statusFilter" className="block text-gray-700 text-sm font-medium mb-1">
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
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="startDate" className="block text-gray-700 text-sm font-medium mb-1">
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
            <label htmlFor="endDate" className="block text-gray-700 text-sm font-medium mb-1">
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
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-gray-600 mb-2 md:mb-0">
          Showing {displayedBookings.length} of {filteredBookings.length} {filteredBookings.length === 1 ? 'appointment' : 'appointments'}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="itemsPerPage" className="text-gray-700 text-sm whitespace-nowrap">
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
                <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
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
        <div className="text-center text-gray-500 bg-white p-8 rounded-xl shadow-md">
          No appointments found matching your filters.
        </div>
      )}

      {filteredBookings.length > 0 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-1">
            {renderPaginationButtons()}
          </div>
        </div>
      )}
      
      {filteredBookings.length > 0 && (
        <div className="text-center text-gray-500 text-sm">
          Page {currentPage} of {totalPages}
        </div>
      )}
    </div>
  );
}