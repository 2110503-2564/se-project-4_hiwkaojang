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
  Snackbar, 
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
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

  // Selected expertise for display
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  // Available options to select from (excluding already selected ones)
  const [availableExpertise, setAvailableExpertise] = useState<string[]>(expertiseOptions);
  // Currently selected option in dropdown
  const [currentExpertiseSelection, setCurrentExpertiseSelection] = useState<string>('');

  // Bio field
  const [bio, setBio] = useState<string>('');
  const [bioCharCount, setBioCharCount] = useState<number>(0);
  const MAX_BIO_LENGTH = 150;

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
          const expertise = Array.isArray(dentistData.area_expertise) 
            ? dentistData.area_expertise 
            : [dentistData.area_expertise];
          
          setFormData({
            name: dentistData.name,
            area_expertise: expertise,
            year_experience: dentistData.year_experience,
            StartingPrice: dentistData.StartingPrice,
            picture: dentistData.picture
          });
          setSelectedExpertise(expertise);
          setAvailableExpertise(expertiseOptions.filter(exp => !expertise.includes(exp)));
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

  const handleBioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_BIO_LENGTH) {
      setBio(value);
      setBioCharCount(value.length);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleExpertiseSelection = (event: SelectChangeEvent<string>) => {
    setCurrentExpertiseSelection(event.target.value as string);
  };

  const addExpertise = () => {
    if (currentExpertiseSelection && !selectedExpertise.includes(currentExpertiseSelection)) {
      const updatedSelected = [...selectedExpertise, currentExpertiseSelection];
      setSelectedExpertise(updatedSelected);
      setFormData({ ...formData, area_expertise: updatedSelected });
      setAvailableExpertise(expertiseOptions.filter(exp => !updatedSelected.includes(exp)));
      setCurrentExpertiseSelection('');
    }
  };

  const removeExpertise = (expertiseToRemove: string) => {
    const updatedSelected = selectedExpertise.filter(exp => exp !== expertiseToRemove);
    setSelectedExpertise(updatedSelected);
    setFormData({ ...formData, area_expertise: updatedSelected });
    setAvailableExpertise([...availableExpertise, expertiseToRemove].sort());
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
          picture: formData.picture,
          bio: bio, // Add bio if backend supports it
        };
        
        console.log('Updating basic information...');
        const result = await updateDentist(dentistId, session.user.token, basicUpdateData);
        console.log('Basic info update result:', result);
        
        // Consider success if we got this far without errors
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          // Force a page refresh when navigating back to ensure new data is loaded
          window.location.href = '/dentist/profile';
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
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
        
        {/* Profile Photo Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden mr-6">
              <Image
                src={formData.picture || '/img/placeholder-dentist.jpg'}
                alt="Profile picture"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold">Dr. {formData.name}</h2>
              <p className="text-gray-600">@Dr. {formData.name}</p>
            </div>
            <div className="ml-auto">
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-md transition-colors"
                onClick={() => document.getElementById('pictureUrl')?.focus()}
              >
                Change Photo
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            <TextField
              id="pictureUrl"
              label="Profile Image URL"
              variant="outlined"
              fullWidth
              name="picture"
              value={formData.picture || ''}
              onChange={handleInputChange}
              size="small"
              className="mt-2"
            />
          </div>
        </div>
        
        {/* Area of Expertise Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Area of expertise</h2>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedExpertise.map((expertise) => (
              <div key={expertise} className="bg-gray-100 rounded-full px-3 py-1 flex items-center">
                <span className="text-gray-800">{expertise}</span>
                <button 
                  onClick={() => removeExpertise(expertise)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <FormControl variant="outlined" size="small" fullWidth>
              <InputLabel id="expertise-select-label">Select Expertise</InputLabel>
              <Select
                labelId="expertise-select-label"
                id="expertise-select"
                value={currentExpertiseSelection}
                onChange={handleExpertiseSelection}
                label="Select Expertise"
              >
                <MenuItem value="" disabled><em>Select an option</em></MenuItem>
                {availableExpertise.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button 
              variant="contained" 
              onClick={addExpertise}
              disabled={!currentExpertiseSelection}
              style={{ 
                backgroundColor: '#4AA3BA', 
                minWidth: '80px',
                height: '40px'
              }}
            >
              Add
            </Button>
          </div>
        </div>
        
        {/* Years of Experience Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Years of experience</h2>
          <FormControl fullWidth>
            <TextField
              select
              label="Years of experience"
              value={formData.year_experience || 0}
              onChange={(e) => setFormData({...formData, year_experience: Number(e.target.value)})}
              variant="outlined"
              fullWidth
            >
              {Array.from({ length: 51 }, (_, i) => i).map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>
        </div>
        
        {/* Starting Price Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Starting price</h2>
          <TextField
            label="Starting price (฿)"
            type="number"
            variant="outlined"
            fullWidth
            name="StartingPrice"
            value={formData.StartingPrice || 0}
            onChange={(e) => setFormData({...formData, StartingPrice: Number(e.target.value)})}
            InputProps={{
              inputProps: { min: 0, step: 100 }
            }}
          />
        </div>
        
        {/* Bio Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Bio</h2>
          <TextField
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            value={bio}
            onChange={handleBioChange}
            placeholder="Write something about yourself..."
            InputProps={{
              endAdornment: (
                <div className="absolute bottom-2 right-3 text-gray-400 text-sm">
                  {bioCharCount}/{MAX_BIO_LENGTH}
                </div>
              ),
            }}
          />
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <Button
            variant="contained"
            color="primary"
            disabled={!hasChanges() || saving}
            onClick={handleSubmit}
            style={{ 
              backgroundColor: hasChanges() && !saving ? '#4AA3BA' : '#9CA3AF',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '6px'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
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