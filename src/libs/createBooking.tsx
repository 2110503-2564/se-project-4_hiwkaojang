export default async function createBooking(did:string, token: string, userBookingDate: string) {

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/dentists/${did}/bookings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            bookingDate: userBookingDate
        }),
    })

    if(!response.ok){
        throw new Error("Cannot create booking")
    }

    return await response.json()
}
