export default async function getUser(token: string, uid: string) {
    await new Promise((resolve) => setTimeout(resolve, 300));
  
    const response = await fetch(
      `http://localhost:5000/api/v1/users/${uid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
      }
    );
  
    if (!response.ok) {
      throw new Error("Cannot fetch User account");
    }
  
    return await response.json();
  }