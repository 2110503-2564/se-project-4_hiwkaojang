export default async function getDentistNotAvailable(id: string) {
    const response =await fetch(`http://localhost:5001/api/v1/dentists/availibility/${id}`)
    if(!response.ok) {
        throw new Error("Failed to fetch reviews dentist")
    }

    return await response.json()
}