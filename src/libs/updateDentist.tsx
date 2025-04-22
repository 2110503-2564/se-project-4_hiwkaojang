export default async function updateDentist(id: string, token: string, updateData: any) {
    try {
      console.log('Updating dentist with ID:', id);
      console.log('Update data:', updateData);
      
      const response = await fetch(`${process.env.BACKEND_URL}/api/v1/dentists/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);
      
      if (!response.ok) {
        throw new Error(`Failed to update dentist information: ${response.status} ${responseText}`);
      }
      
      // Try to parse the response as JSON
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing response as JSON:', parseError);
        return { sucess: false, message: 'Invalid response format' };
      }
    } catch (error) {
      console.error('Error in updateDentist:', error);
      throw error;
    }
  }