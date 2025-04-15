export default async function getBooking(token: string, bid: string) {
    await new Promise((resolve) => setTimeout(resolve, 300));
  
    const response = await fetch(
      `http://localhost:5001/api/v1/bookings/${bid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
      }
    );
  
    if (!response.ok) {
      throw new Error("Cannot fetch booking");
    }
  
    return await response.json();
  }