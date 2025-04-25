"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confirmBooking from "@/libs/confirmBooking";

export default function ConfirmAppointment({ params }: { params: { bid: string } }) {
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingStatus, setConfirmingStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        // We fetch the booking details using the bid from the URL
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/bookings/${params.bid}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch booking details');
        }
        
        const data = await response.json();
        setBooking(data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Could not load booking details. The link may be invalid or expired.');
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [params.bid]);

  const handleConfirmBooking = async () => {
    try {
      setConfirmingStatus("loading");
      
      // Call the API to confirm the booking
      const result = await confirmBooking(params.bid);
      
      if (result.success) {
        setConfirmingStatus("success");
        // Update the local state to show confirmed status
        setBooking((prev: any) => ({ ...prev, status: 'confirmed' }));
      } else {
        throw new Error(result.message || 'Failed to confirm booking');
      }
    } catch (err: any) {
      console.error('Error confirming booking:', err);
      setConfirmingStatus("error");
      setError(err.message || 'An error occurred while confirming your appointment');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white rounded-xl shadow-lg text-center max-w-md w-full">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4AA3BA]"></div>
          </div>
          <p className="mt-4 text-lg text-gray-700">Loading your appointment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white rounded-xl shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="inline-block bg-[#4AA3BA] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#3b8294] transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url(/img/ConfirmBg.png)] bg-cover bg-center py-10">
      <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-8 mx-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-[#4AA3BA] rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Dental Appointment</h1>
          <p className="text-gray-600">
            {booking?.status === 'confirmed' ? 
              'This appointment has been confirmed.' : 
              'Please confirm your appointment by clicking the button below.'}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Patient Name</p>
              <p className="font-medium">{booking?.user?.name || 'Not available'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Patient ID</p>
              <p className="font-medium">{booking?.user?._id || 'Not available'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Booking ID</p>
              <p className="font-medium">{booking?._id || 'Not available'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Status</p>
              <p className="font-medium">
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                  booking?.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800' 
                    : booking?.status === 'upcoming' 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  {booking?.status?.charAt(0).toUpperCase() + booking?.status?.slice(1) || 'Unknown'}
                </span>
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 mb-1">Dentist</p>
              <p className="font-medium">{booking?.dentist?.name || 'Not available'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 mb-1">Appointment Date & Time</p>
              <p className="font-medium">{booking?.bookingDate ? formatDate(booking.bookingDate) : 'Not available'}</p>
            </div>
          </div>
        </div>

        {booking?.status !== 'confirmed' && (
          <div className="text-center">
            <button 
              onClick={handleConfirmBooking}
              disabled={confirmingStatus === 'loading' || confirmingStatus === 'success'}
              className={`w-full py-3 rounded-full font-semibold text-white ${
                confirmingStatus === 'loading' 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : confirmingStatus === 'success'
                    ? 'bg-green-500'
                    : 'bg-[#4AA3BA] hover:bg-[#3b8294]'
              } transition-colors shadow-md`}
            >
              {confirmingStatus === 'loading' ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Confirming...
                </span>
              ) : confirmingStatus === 'success' ? (
                <span className="flex items-center justify-center">
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Appointment Confirmed
                </span>
              ) : (
                'Confirm Appointment'
              )}
            </button>
            
            {confirmingStatus === 'error' && (
              <p className="mt-4 text-red-500 text-sm">{error || 'An error occurred. Please try again.'}</p>
            )}
          </div>
        )}

        {booking?.status === 'confirmed' && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-green-700 mb-4">Appointment Confirmed!</h2>
            <p className="text-gray-600 mb-6">Thank you for confirming your appointment. We look forward to seeing you.</p>
            <Link href="/" className="inline-block bg-[#4AA3BA] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#3b8294] transition-colors">
              Return Home
            </Link>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            If you need to reschedule or cancel your appointment, please call us at 095-000-0000
          </p>
        </div>
      </div>
    </div>
  );
}