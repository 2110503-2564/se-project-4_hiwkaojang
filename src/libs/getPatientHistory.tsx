export default async function getPatientHistory(token: string, pid: string) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const response = await fetch(
    `${process.env.BACKEND_URL}/api/v1/bookings/patientHistory/${pid}`,
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
