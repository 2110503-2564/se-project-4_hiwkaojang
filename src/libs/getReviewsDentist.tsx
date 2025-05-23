export default async function getReviewsDentist(id: string) {
    const response =await fetch(`${process.env.BACKEND_URL}/api/v1/dentists/reviews/${id}`)
    if(!response.ok) {
        throw new Error("Failed to fetch reviews dentist")
    }

    return await response.json()
}