export default async function deleteBooking(bid: string, token: string) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const response = await fetch(
    `http://localhost:5000/api/v1/bookings/${bid}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Cannot delete booking");
  }

  return await response.json();
}
