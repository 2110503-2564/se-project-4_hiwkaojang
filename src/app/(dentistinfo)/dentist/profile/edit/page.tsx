'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import getUserProfile from '@/libs/getUserProfile';
import getDentist from '@/libs/getDentist';
import updateDentist from '@/libs/updateDentist';
import addDentistExpertise from '@/libs/addDentistExpertise';
import { 
  CircularProgress, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select,
  SelectChangeEvent,
  MenuItem, 
  Chip, 
  Box, 
  Snackbar, 
  Alert, 
  InputAdornment 
} from '@mui/material';

interface DentistData {
  _id: string;
  name: string;
  area_expertise: string[];
  year_experience: number;
  StartingPrice: number;
  picture: string;
}

const expertiseOptions = [
  'Orthodontics', 
  'Endodontics', 
  'Prosthodontics', 
  'Pediatric Dentistry', 
  'Oral Surgery', 
  'Periodontics', 
  'Cosmetic Dentistry', 
  'General Dentistry',
  'Implant Dentistry'
];

export default function EditDentistProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dentistId, setDentistId] = useState<string>('');
  
  // Form state
  const [formData, setFormData] = useState<Partial<DentistData>>({
    name: '',
    area_expertise: [],
    year_experience: 0,
    StartingPrice: 0,
    picture: ''
  });

  // Original data for comparison to detect changes
  const [originalData, setOriginalData] = useState<Partial<DentistData> | null>(null);

  useEffect(() => {
    async function fetchDentistProfile() {
      if (!session?.user?.token) {
        router.push('/signin');
        return;
      }

      try {
        setLoading(true);
        // Get the user profile to verify they are a dentist and get their dentist_id
        const userProfile = await getUserProfile(session.user.token);
        
        if (userProfile.data.role !== 'dentist' || !userProfile.data.dentist_id) {
          setError('You are not authorized to edit this profile');
          router.push('/');
          return;
        }

        setDentistId(userProfile.data.dentist_id);

        // Fetch the dentist data using the dentist_id from the user profile
        const dentistResponse = await getDentist(userProfile.data.dentist_id);
        if (dentistResponse.sucess && dentistResponse.data) {
          const dentistData = dentistResponse.data;
          setFormData({
            name: dentistData.name,
            area_expertise: Array.isArray(dentistData.area_expertise) 
              ? dentistData.area_expertise 
              : [dentistData.area_expertise],
            year_experience: dentistData.year_experience,
            StartingPrice: dentistData.StartingPrice,
            picture: dentistData.picture
          });
          setOriginalData(dentistData);
        } else {
          setError('Failed to load dentist profile');
        }
      } catch (err) {
        console.error('Error fetching dentist profile:', err);
        setError('An error occurred while loading your profile');
      } finally {
        setLoading(false);
      }
    }

    fetchDentistProfile();
  }, [session, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleExpertiseChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    setFormData({
      ...formData,
      area_expertise: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.token || !dentistId) {
      setError('You must be logged in to update your profile');
      return;
    }

    try {
      setSaving(true);
      
      // Validate form data
      if (!formData.area_expertise || formData.area_expertise.length === 0) {
        setError('Please select at least one area of expertise');
        setSaving(false);
        return;
      }
      
      if (typeof formData.year_experience === 'number' && formData.year_experience < 0) {
        setError('Years of experience cannot be negative');
        setSaving(false);
        return;
      }
      
      if (typeof formData.StartingPrice === 'number' && formData.StartingPrice < 0) {
        setError('Starting price cannot be negative');
        setSaving(false);
        return;
      }
      
      console.log('Session user token:', session.user.token.slice(0, 10) + '...');
      console.log('Dentist ID:', dentistId);
      
      // Split the update into multiple requests to handle different parts separately
      // This is more likely to work since dentists might only have permission to update
      // certain fields of their profile
      
      // Step 1: Update the expertise (which has a separate API endpoint)
      try {
        if (JSON.stringify(formData.area_expertise) !== JSON.stringify(originalData?.area_expertise)) {
          console.log('Updating expertise...');
          const expertiseResult = await addDentistExpertise(
            dentistId, 
            session.user.token, 
            formData.area_expertise || []
          );
          console.log('Expertise update result:', expertiseResult);
        }
        
        // Step 2: Update other fields using the standard update endpoint
        const basicUpdateData = {
          year_experience: formData.year_experience,
          StartingPrice: formData.StartingPrice,
          picture: formData.picture
        };
        
        console.log('Updating basic information...');
        const result = await updateDentist(dentistId, session.user.token, basicUpdateData);
        console.log('Basic info update result:', result);
        
        // Consider success if we got this far without errors
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          router.push('/dentist/profile');
        }, 2000);
      } catch (updateError: any) {
        console.error('Update error:', updateError);
        setError(`Update failed: ${updateError.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(`An error occurred: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircularProgress color="inherit" />
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
          <Link 
            href="/"
            className="mt-4 inline-block px-6 py-2 bg-[#4AA3BA] text-white rounded-md hover:bg-[#3b8294] transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const hasChanges = () => {
    if (!originalData) return false;
    
    return (
      formData.year_experience !== originalData.year_experience ||
      formData.StartingPrice !== originalData.StartingPrice ||
      formData.picture !== originalData.picture ||
      JSON.stringify(formData.area_expertise) !== JSON.stringify(originalData.area_expertise)
    );
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="w-full bg-gray-100 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Edit My Profile</h1>
        <div className="mt-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Home </Link> /
          <Link href="/dentist/profile" className="hover:text-blue-600"> My Profile </Link> /
          <span className="text-gray-900"> Edit</span>
        </div>
      </div>

      {/* Edit Form */}
      <div className="max-w-3xl mx-auto my-12 bg-white rounded-xl shadow-md p-8">
        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Profile Image Preview */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-40 h-40 mb-4">
                <Image
                  src={formData.picture || '/img/placeholder-dentist.jpg'}
                  alt="Profile picture"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              
              <TextField
                label="Profile Image URL"
                variant="outlined"
                fullWidth
                name="picture"
                value={formData.picture || ''}
                onChange={handleInputChange}
                margin="normal"
              />
            </div>

            {/* Name - Read Only */}
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              name="name"
              value={formData.name || ''}
              disabled
              InputProps={{
                readOnly: true,
              }}
              helperText="Name cannot be changed. Please contact an administrator for name changes."
            />

            {/* Years of Experience */}
            <TextField
              label="Years of Experience"
              variant="outlined"
              fullWidth
              type="number"
              name="year_experience"
              value={formData.year_experience || 0}
              onChange={handleInputChange}
              InputProps={{
                inputProps: { min: 0 }
              }}
            />

            {/* Starting Price */}
            <TextField
              label="Starting Price"
              variant="outlined"
              fullWidth
              type="number"
              name="StartingPrice"
              value={formData.StartingPrice || 0}
              onChange={handleInputChange}
              InputProps={{
                inputProps: { min: 0 },
                startAdornment: <InputAdornment position="start">฿</InputAdornment>,
              }}
            />

            {/* Areas of Expertise */}
            <FormControl fullWidth variant="outlined">
              <InputLabel id="expertise-label">Areas of Expertise</InputLabel>
              <Select
                labelId="expertise-label"
                multiple
                name="area_expertise"
                value={formData.area_expertise || []}
                onChange={handleExpertiseChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
                label="Areas of Expertise"
              >
                {expertiseOptions.map((expertise) => (
                  <MenuItem key={expertise} value={expertise}>
                    {expertise}
                  </MenuItem>
                ))}
              </Select>
              <p className="text-xs text-gray-500 mt-1">Select at least one area of expertise</p>
            </FormControl>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between mt-10">
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => router.push('/dentist/profile')}
              className="px-6"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!hasChanges() || saving || !(formData.area_expertise?.length)}
              sx={{
                backgroundColor: '#4AA3BA',
                '&:hover': {
                  backgroundColor: '#3b8294',
                },
              }}
              className="px-6"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>

      {/* Success message */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      {/* Error message */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </main>
  );
}