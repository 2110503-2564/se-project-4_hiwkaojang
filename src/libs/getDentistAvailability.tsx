export default async function getDentistAvailability(id: string) {
    const response = await fetch(`http://localhost:5001/api/v1/dentists/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    
    if (!response.ok) {
        throw new Error("Failed to fetch dentist availability");
    }
    
    return await response.json();
}