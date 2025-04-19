export default async function getDentist(id: string) {
    const response =await fetch(`${process.env.BACKEND_URL}/api/v1/dentists/${id}`)
    if(!response.ok) {
        throw new Error("Failed to fetch dentist")
    }

    return await response.json()
}