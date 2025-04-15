export default async function getUser(token: string) {
    await new Promise((resolve) => setTimeout(resolve, 300));
  
    const response = await fetch(
      "http://localhost:5001/api/v1/users",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`
        },
      }
    );
  
    return await response.json();
  }
  