"use client";
import React, { useState, useEffect, useRef } from 'react';
import { createClerkSupabaseClient } from '../../../lib/supabase';
import { useOrganization } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

type TripInput = {
  patient_id: string;
  driver_id: string;
  vehicle_id: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_time: string;
  dropoff_time: string;
  notes: string;
};

type PatientInput = {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone_number: string;
  email: string;
  address: string;
};

type SelectOption = {
  value: string;
  label: string;
};

export default function AddTripPage() {
  const [tripData, setTripData] = useState<TripInput>({
    patient_id: '',
    driver_id: '',
    vehicle_id: '',
    pickup_address: '',
    dropoff_address: '',
    pickup_time: '',
    dropoff_time: '',
    notes: '',
  });
  const [newPatientData, setNewPatientData] = useState<PatientInput>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone_number: '',
    email: '',
    address: '',
  });
  const [patients, setPatients] = useState<SelectOption[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<SelectOption[]>([]);
  const [drivers, setDrivers] = useState<SelectOption[]>([]);
  const [vehicles, setVehicles] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingNewPatient, setIsAddingNewPatient] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);

  const patientDropdownRef = useRef<HTMLDivElement>(null);

  const supabase = createClerkSupabaseClient();
  const router = useRouter();
  const { organization } = useOrganization();

  useEffect(() => {
    if (organization) {
      fetchOptions();
    }
  }, [organization]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(event.target as Node)) {
        setIsPatientDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (patientSearch.length > 0) {
      const filtered = patients.filter(patient => 
        patient.label.toLowerCase().includes(patientSearch.toLowerCase())
      );
      setFilteredPatients(filtered);
      setIsPatientDropdownOpen(true);
    } else {
      setFilteredPatients([]);
      setIsPatientDropdownOpen(false);
    }
  }, [patientSearch, patients]);

  const fetchOptions = async () => {
    setIsLoading(true);
    try {
      const [patientsData, driversData, vehiclesData] = await Promise.all([
        supabase.from('patients').select('id, first_name, last_name').eq('org_id', organization?.id),
        supabase.from('drivers').select('id, user_id').eq('org_id', organization?.id),
        supabase.from('vehicles').select('id, make, model, year').eq('org_id', organization?.id),
      ]);

      if (patientsData.error) throw patientsData.error;
      if (driversData.error) throw driversData.error;
      if (vehiclesData.error) throw vehiclesData.error;

      // Fetch user information for drivers
      const driverUserIds = driversData.data.map(driver => driver.user_id);
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .in('id', driverUserIds);

      if (usersError) throw usersError;

      const userMap = new Map(usersData.map(user => [user.id, user]));

      setPatients(patientsData.data.map(p => ({ value: p.id, label: `${p.first_name} ${p.last_name}` })));
      setDrivers(driversData.data.map(d => {
        const user = userMap.get(d.user_id);
        return { value: d.id, label: user ? `${user.first_name} ${user.last_name}` : 'Unknown Driver' };
      }));
      setVehicles(vehiclesData.data.map(v => ({ value: v.id, label: `${v.year} ${v.make} ${v.model}` })));
    } catch (err) {
      console.error('Error fetching options:', err);
      setError('Failed to load options. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTripDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setTripData({ ...tripData, [e.target.name]: e.target.value });
  };

  const handleNewPatientDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPatientData({ ...newPatientData, [e.target.name]: e.target.value });
  };

  const handleAddNewPatient = async () => {
    if (!organization) {
      setError('No organization found');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([{ ...newPatientData, org_id: organization.id }])
        .select()
        .single();

      if (error) throw error;

      console.log('New patient added:', data);
      const newPatient = { value: data.id, label: `${data.first_name} ${data.last_name}` };
      setPatients([...patients, newPatient]);
      setTripData({ ...tripData, patient_id: data.id });
      setPatientSearch(`${data.first_name} ${data.last_name}`);
      setIsAddingNewPatient(false);
    } catch (error) {
      console.error('Error adding new patient:', error);
      setError('Failed to add new patient. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) {
      setError('No organization found');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('trips')
        .insert([{ 
          ...tripData, 
          status: 'Scheduled',
          org_id: organization.id
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('Trip added:', data);
      router.push('/admin/trips');
    } catch (error) {
      console.error('Error adding trip:', error);
      setError('Failed to add trip. Please try again.');
    }
  };

  const handlePatientSelect = (patient: SelectOption) => {
    setTripData({ ...tripData, patient_id: patient.value });
    setPatientSearch(patient.label);
    setIsPatientDropdownOpen(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add New Trip</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div ref={patientDropdownRef} className="relative">
          <label className="block mb-1">Patient</label>
          {isAddingNewPatient ? (
            <div className="space-y-2">
              <input name="first_name" placeholder="First Name" onChange={handleNewPatientDataChange} required className="w-full p-2 border rounded" />
              <input name="last_name" placeholder="Last Name" onChange={handleNewPatientDataChange} required className="w-full p-2 border rounded" />
              <input name="date_of_birth" type="date" placeholder="Date of Birth" onChange={handleNewPatientDataChange} required className="w-full p-2 border rounded" />
              <input name="phone_number" placeholder="Phone Number" onChange={handleNewPatientDataChange} className="w-full p-2 border rounded" />
              <input name="email" type="email" placeholder="Email" onChange={handleNewPatientDataChange} className="w-full p-2 border rounded" />
              <input name="address" placeholder="Address" onChange={handleNewPatientDataChange} className="w-full p-2 border rounded" />
              <button type="button" onClick={handleAddNewPatient} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Add New Patient</button>
              <button type="button" onClick={() => setIsAddingNewPatient(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2">Cancel</button>
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Search for a patient"
                className="w-full p-2 border rounded"
              />
              {isPatientDropdownOpen && filteredPatients.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                  {filteredPatients.map(patient => (
                    <div
                      key={patient.value}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handlePatientSelect(patient)}
                    >
                      {patient.label}
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => setIsAddingNewPatient(true)} className="mt-2 text-blue-500 hover:underline">
                + Add New Patient
              </button>
            </div>
          )}
        </div>
        <div>
          <label className="block mb-1">Driver</label>
          <select name="driver_id" onChange={handleTripDataChange} required className="w-full p-2 border rounded">
            <option value="">Select Driver</option>
            {drivers.map(driver => (
              <option key={driver.value} value={driver.value}>{driver.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Vehicle</label>
          <select name="vehicle_id" onChange={handleTripDataChange} required className="w-full p-2 border rounded">
            <option value="">Select Vehicle</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.value} value={vehicle.value}>{vehicle.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Pickup Address</label>
          <input name="pickup_address" onChange={handleTripDataChange} required className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block mb-1">Dropoff Address</label>
          <input name="dropoff_address" onChange={handleTripDataChange} required className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block mb-1">Pickup Time</label>
          <input name="pickup_time" type="datetime-local" onChange={handleTripDataChange} required className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block mb-1">Estimated Dropoff Time</label>
          <input name="dropoff_time" type="datetime-local" onChange={handleTripDataChange} required className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block mb-1">Notes</label>
          <textarea name="notes" onChange={handleTripDataChange} className="w-full p-2 border rounded" rows={3}></textarea>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Add Trip</button>
      </form>
    </div>
  );
}