export default async function submitDentistReview(
    did: string,
    token: string,
    rating: number,
    review: string
  ) {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/dentists/reviews/${did}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        rating,
        review,
      }),
    });
  
    if (!response.ok) {
      throw new Error("Cannot submit review");
    }
  
    return await response.json();
  }
  