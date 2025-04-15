export default async function getBookings(token: string) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const response = await fetch(
    "http://localhost:5001/api/v1/bookings",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
      },
    }
  );

  return await response.json();
}
