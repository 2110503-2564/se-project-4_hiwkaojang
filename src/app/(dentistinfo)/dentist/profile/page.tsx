'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import getUserProfile from '@/libs/getUserProfile';
import getDentist from '@/libs/getDentist';
import { CircularProgress } from '@mui/material';
import Rating from '@/components/Rating';

interface DentistData {
  _id: string;
  name: string;
  area_expertise: string[];
  year_experience: number;
  StartingPrice: number;
  picture: string;
  rating: any[];
}

export default function DentistProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dentistData, setDentistData] = useState<DentistData | null>(null);

  useEffect(() => {
    async function fetchDentistProfile() {
      if (!session?.user?.token) {
        router.push('/signin');
        return;
      }

      try {
        setLoading(true);
        // First get the user profile to verify they are a dentist and get their dentist_id
        const userProfile = await getUserProfile(session.user.token);
        
        if (userProfile.data.role !== 'dentist' || !userProfile.data.dentist_id) {
          setError('You are not authorized to view this page');
          router.push('/');
          return;
        }

        // Add a cache-busting parameter to avoid browser caching
        const cacheBuster = new Date().getTime();
        
        // Fetch the dentist data using the dentist_id from the user profile
        const dentistResponse = await getDentist(userProfile.data.dentist_id + `?_cb=${cacheBuster}`);
        if (dentistResponse.sucess && dentistResponse.data) {
          setDentistData(dentistResponse.data);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircularProgress color="inherit" />
      </div>
    );
  }

  if (error) {
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

  if (!dentistData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Profile Not Found</h2>
          <p className="text-gray-700">Your dentist profile could not be found. Please contact an administrator.</p>
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

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="w-full bg-gray-100 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900">My Dentist Profile</h1>
        <div className="mt-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Home </Link> /
          <span className="text-gray-900"> My Profile</span>
        </div>
      </div>

      {/* Dentist Details */}
      <div className="mx-auto my-auto bg-white">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-10 px-6 md:px-40 py-10 max-w-7xl mx-auto">
          {/* Image */}
          <div className="w-full md:w-auto flex justify-center">
            <Image
              src={dentistData.picture}
              alt="Dentist Image"
              width={350}
              height={350}
              className="rounded-lg shadow-md"
            />
          </div>

          {/* Details */}
          <div className="w-full text-center md:text-left space-y-6">
            <h1 className="text-5xl font-bold text-gray-900">{dentistData.name}</h1>
            
            <div>
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">Area of expertise:</span>{' '}
                {Array.isArray(dentistData.area_expertise) 
                  ? dentistData.area_expertise.join(', ') 
                  : dentistData.area_expertise}
              </p>
            </div>
            
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">Years of experience:</span> {dentistData.year_experience} Years
            </p>
            
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">Starting price:</span> {dentistData.StartingPrice} ฿
            </p>
            
            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <Link href="/bookingHistory" className="inline-block">
                <button className="rounded-3xl bg-sky-500 px-6 py-3 text-white text-lg font-medium hover:bg-indigo-600 shadow-md transition-colors w-full sm:w-auto">
                  View Appointment History
                </button>
              </Link>
              
              <Link href="/dentist/profile/edit" className="inline-block">
                <button className="rounded-3xl bg-white border-2 border-sky-500 px-6 py-3 text-sky-500 text-lg font-medium hover:bg-sky-50 shadow-md transition-colors w-full sm:w-auto">
                  Edit Profile
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats and Metrics */}
        <div className="bg-gray-50 py-10">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Stats</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Ratings */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Total Reviews</h3>
                <p className="text-3xl font-bold text-[#4AA3BA]">
                  {dentistData.rating ? dentistData.rating.length : 0}
                </p>
              </div>
              
              {/* Average Rating */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Average Rating</h3>
                <p className="text-3xl font-bold text-[#4AA3BA]">
                  {dentistData.rating && dentistData.rating.length > 0 
                    ? (dentistData.rating.reduce((acc, curr) => acc + curr.rating, 0) / dentistData.rating.length).toFixed(1)
                    : 'N/A'}
                </p>
              </div>
              
              {/* Experience */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Experience</h3>
                <p className="text-3xl font-bold text-[#4AA3BA]">{dentistData.year_experience} years</p>
              </div>
              
              {/* Starting Price */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Starting Price</h3>
                <p className="text-3xl font-bold text-[#4AA3BA]">{dentistData.StartingPrice} ฿</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="py-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 px-6 md:px-10">Patient Reviews</h2>
          <Rating dentistId={dentistData._id} />
        </div>
      </div>
    </main>
  );
}