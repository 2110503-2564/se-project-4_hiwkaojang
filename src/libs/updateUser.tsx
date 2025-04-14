export default async function updateUser(
    token: string,
    uid: string,
    role: string
  ) {
    await new Promise((resolve) => setTimeout(resolve, 300));
  
    const response = await fetch(
      `https://dentist-booking-backend.vercel.app/api/v1/users/${uid}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: role,
        }),
      }
    );
  
    if (!response.ok) {
      throw new Error("Cannot fetch User account");
    }
  
    return await response.json();
  }