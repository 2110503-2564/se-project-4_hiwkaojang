export default async function confirmBooking(bookingId: string) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/bookings/${bookingId}/confirm`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to confirm booking");
      }
  
      return await response.json();
    } catch (error: any) {
      console.error("Confirmation error:", error);
      throw error;
    }
  }