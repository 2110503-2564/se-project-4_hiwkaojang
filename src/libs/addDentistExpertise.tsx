export default async function addDentistExpertise(id: string, token: string, expertise: string[]) {
    try {
      console.log('Adding expertise to dentist ID:', id);
      console.log('Expertise:', expertise);
      
      // First, remove all existing expertise areas
      // Then add the new ones
      const removeResponse = await fetch(`${process.env.BACKEND_URL}/api/v1/dentists/${id}/expertise`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          expertise: "all" // Special indicator to remove all (we'll need to add this handling in backend)
        })
      });
  
      if (!removeResponse.ok) {
        console.log('Error removing expertise:', await removeResponse.text());
      }
      
      // Add each expertise one by one
      const results = await Promise.all(expertise.map(async (exp) => {
        const response = await fetch(`${process.env.BACKEND_URL}/api/v1/dentists/${id}/expertise`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            expertise: exp
          })
        });
        
        const responseText = await response.text();
        console.log(`Added expertise "${exp}" response:`, responseText);
        
        try {
          return JSON.parse(responseText);
        } catch (e) {
          return { success: false, text: responseText };
        }
      }));
      
      return { success: true, results };
    } catch (error) {
      console.error('Error in addDentistExpertise:', error);
      throw error;
    }
  }