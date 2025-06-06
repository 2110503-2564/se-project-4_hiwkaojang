export default async function cancelBooking(
    bid: string,
    token: string
  ) {
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/bookings/${bid}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "cancelled"
        }),
      }
    );
  
    if (!response.ok) {
      throw new Error("Cannot create booking");
    }
  
    return await response.json();
  }