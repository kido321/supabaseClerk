
"use client";
import React, { useState } from 'react';
import { createClerkSupabaseClient } from '../../../lib/supabase';
import { TripInput } from '../../types';
import { useRouter } from 'next/router';
import { useOrganization } from '@clerk/nextjs';

export default function AddTripPage() {
  const [tripData, setTripData] = useState<TripInput>({
    patient_name: '',
    driver_name: '',
    vehicle_info: '',
    pickup_address: '',
    dropoff_address: '',
    pickup_datetime: '',
    dropoff_datetime: '',
  });
  const supabase = createClerkSupabaseClient();
  //const router = useRouter();
  const { organization } = useOrganization();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTripData({ ...tripData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) {
      console.error('No organization found');
      return;
    }

    try {
      console.log('Submitting trip for organization:', organization.id);
      
      const { data, error } = await supabase
        .from('trips')
        .insert([{ 
          ...tripData, 
          status: 'Scheduled',
          org_id: organization.id  // Set the org_id directly
        }])
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Trip added:', data);
     // router.push('/trips');
    } catch (error) {
      console.error('Error adding trip:', error);
    }
  };

  // ... rest of the component (form JSX) ...

  return (
    <form onSubmit={handleSubmit}>
      <input name="patient_name" placeholder="Patient Name" onChange={handleChange} required />
      <input name="driver_name" placeholder="Driver Name" onChange={handleChange} required />
      <input name="vehicle_info" placeholder="Vehicle Info" onChange={handleChange} required />
      <input name="pickup_address" placeholder="Pickup Address" onChange={handleChange} required />
      <input name="dropoff_address" placeholder="Dropoff Address" onChange={handleChange} required />
      <input name="pickup_datetime" type="datetime-local" onChange={handleChange} required />
      <input name="dropoff_datetime" type="datetime-local" onChange={handleChange} required />
      <button type="submit">Add Trip</button>
    </form>
  );
}




