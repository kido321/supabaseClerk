"use client"

import React, { useEffect, useState } from 'react';
import { createClerkSupabaseClient} from '../../lib/supabase';
import { useOrganization } from '@clerk/nextjs';
import Link from 'next/link';
import { FaPlus, FaCar, FaUser, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

type Trip = {
  id: string;
  patient_name: string;
  driver_name: string;
  vehicle_info: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_datetime: string;
  dropoff_datetime: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
};

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase =  createClerkSupabaseClient();
  const { organization } = useOrganization();

  useEffect(() => {
    setTimeout(() => {
        fetchTrips();
      }, 400);
   
  }, [organization]);

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('pickup_datetime', { ascending: false });

      if (error) throw error;

      setTrips(data || []);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Failed to load trips. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
  </div>;

  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Trips</h1>
        <Link href="admin/trips/addtrip" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition duration-150 ease-in-out">
          <FaPlus className="mr-2" />
          Add New Trip
        </Link>
      </div>
      {trips.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600 mb-4">No trips found. Add a new trip to get started.</p>
          <Link href="/trips/add" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition duration-150 ease-in-out">
            <FaPlus className="mr-2" />
            Add Your First Trip
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className={`p-4 ${getStatusBackgroundColor(trip.status)}`}>
                <h2 className="text-xl font-semibold text-white">{trip.patient_name}</h2>
                <span className="inline-block bg-gray-500 text-sm font-semibold px-2 py-1 rounded mt-2">
                  {trip.status}
                </span>
              </div>
              <div className="p-4">
                <p className="flex items-center text-gray-600 mb-2">
                  <FaUser className="mr-2" /> {trip.driver_name}
                </p>
                <p className="flex items-center text-gray-600 mb-2">
                  <FaCar className="mr-2" /> {trip.vehicle_info}
                </p>
                <p className="flex items-center text-gray-600 mb-2">
                  <FaMapMarkerAlt className="mr-2" /> From: {trip.pickup_address}
                </p>
                <p className="flex items-center text-gray-600 mb-2">
                  <FaMapMarkerAlt className="mr-2" /> To: {trip.dropoff_address}
                </p>
                <p className="flex items-center text-gray-600 mb-2">
                  <FaClock className="mr-2" /> Pickup: {new Date(trip.pickup_datetime).toLocaleString()}
                </p>
                <p className="flex items-center text-gray-600">
                  <FaClock className="mr-2" /> Dropoff: {new Date(trip.dropoff_datetime).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getStatusBackgroundColor(status: Trip['status']) {
  switch (status) {
    case 'Scheduled':
      return 'bg-yellow-500';
    case 'In Progress':
      return 'bg-blue-500';
    case 'Completed':
      return 'bg-green-500';
    case 'Cancelled':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}