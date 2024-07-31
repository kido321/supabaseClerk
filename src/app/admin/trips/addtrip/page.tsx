// "use client";
// import React, { useState, useEffect, useRef } from 'react';
// import { createClerkSupabaseClient } from '../../../lib/supabase';
// import { useOrganization } from '@clerk/nextjs';
// import { useRouter } from 'next/navigation';
// import { PlusCircle, X } from 'lucide-react';
// import usePlacesAutocomplete, {
//   getGeocode,
//   getLatLng,
// } from "use-places-autocomplete";
// import { useGoogleMaps } from '../../../hooks/useGoogleMaps';

// type TripInput = {
//   patient_id: string;
//   driver_id: string;
//   vehicle_id: string;
//   pickup_address: string;
//   dropoff_address: string;
//   pickup_time: string;
//   dropoff_time: string;
//   notes: string;
// };

// type PatientInput = {
//   first_name: string;
//   last_name: string;
//   date_of_birth: string;
//   phone_number: string;
//   email: string;
//   address: string;
// };

// type SelectOption = {
//   value: string;
//   label: string;
// };

// export default function AddTripPage() {
//   const [tripData, setTripData] = useState<TripInput>({
//     patient_id: '',
//     driver_id: '',
//     vehicle_id: '',
//     pickup_address: '',
//     dropoff_address: '',
//     pickup_time: '',
//     dropoff_time: '',
//     notes: '',
//   });
//   const [newPatientData, setNewPatientData] = useState<PatientInput>({
//     first_name: '',
//     last_name: '',
//     date_of_birth: '',
//     phone_number: '',
//     email: '',
//     address: '',
//   });
//   const [patients, setPatients] = useState<SelectOption[]>([]);
//   const [filteredPatients, setFilteredPatients] = useState<SelectOption[]>([]);
//   const [drivers, setDrivers] = useState<SelectOption[]>([]);
//   const [vehicles, setVehicles] = useState<SelectOption[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isAddingNewPatient, setIsAddingNewPatient] = useState(false);
//   const [patientSearch, setPatientSearch] = useState('');
//   const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
//   //const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  

//   const patientDropdownRef = useRef<HTMLDivElement>(null);

//   const supabase = createClerkSupabaseClient();
//   const router = useRouter();
//   const { organization } = useOrganization();

//   // useEffect(() => {
//   //   if (window.google && window.google.maps) {
//   //     setIsGoogleLoaded(true);
//   //   } 
//   //   else {
//   //     if(!isGoogleLoaded){
//   //       const checkGoogleInterval = setInterval(() => {
//   //         if (window.google && window.google.maps) {
//   //           setIsGoogleLoaded(true);
//   //           clearInterval(checkGoogleInterval);
//   //         }
//   //       }, 400);
  
//   //       return () => clearInterval(checkGoogleInterval);
//   //     }
      
//   //   }
//   // }, []);

//   useEffect(() => {
//     if (organization) {
//       fetchOptions();
//     }
//   }, [organization]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (patientDropdownRef.current && !patientDropdownRef.current.contains(event.target as Node)) {
//         setIsPatientDropdownOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   useEffect(() => {
//     if (patientSearch.length > 0) {
//       const filtered = patients.filter(patient => 
//         patient.label.toLowerCase().includes(patientSearch.toLowerCase())
//       );
//       setFilteredPatients(filtered);
//       setIsPatientDropdownOpen(true);
//     } else {
//       setFilteredPatients([]);
//       setIsPatientDropdownOpen(false);
//     }
//   }, [patientSearch, patients]);



//   const fetchOptions = async () => {
//     setIsLoading(true);
//     try {
//       const [patientsData, driversData, vehiclesData] = await Promise.all([
//         supabase.from('patients').select('id, first_name, last_name').eq('org_id', organization?.id),
//         supabase.from('drivers').select('id, user_id').eq('org_id', organization?.id),
//         supabase.from('vehicles').select('id, make, model, year').eq('org_id', organization?.id),
//       ]);

//       if (patientsData.error) throw patientsData.error;
//       if (driversData.error) throw driversData.error;
//       if (vehiclesData.error) throw vehiclesData.error;

//       // Fetch user information for drivers
//       const driverUserIds = driversData.data.map(driver => driver.user_id);
//       const { data: usersData, error: usersError } = await supabase
//         .from('users')
//         .select('id, first_name, last_name')
//         .in('id', driverUserIds);

//       if (usersError) throw usersError;

//       const userMap = new Map(usersData.map(user => [user.id, user]));

//       setPatients(patientsData.data.map(p => ({ value: p.id, label: `${p.first_name} ${p.last_name}` })));
//       setDrivers(driversData.data.map(d => {
//         const user = userMap.get(d.user_id);
//         return { value: d.id, label: user ? `${user.first_name} ${user.last_name}` : 'Unknown Driver' };
//       }));
//       setVehicles(vehiclesData.data.map(v => ({ value: v.id, label: `${v.year} ${v.make} ${v.model}` })));
//     } catch (err) {
//       console.error('Error fetching options:', err);
//       setError('Failed to load options. Please try again later.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleTripDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     setTripData({ ...tripData, [e.target.name]: e.target.value });

//     console.log(tripData ,' trip data')

//   };

//   const handleNewPatientDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setNewPatientData({ ...newPatientData, [e.target.name]: e.target.value });
//   };

//   const handleAddNewPatient = async () => {
//     if (!organization) {
//       setError('No organization found');
//       return;
//     }

//     try {
//       const { data, error } = await supabase
//         .from('patients')
//         .insert([{ ...newPatientData, org_id: organization.id }])
//         .select()
//         .single();

//       if (error) throw error;

//       console.log('New patient added:', data);
//       const newPatient = { value: data.id, label: `${data.first_name} ${data.last_name}` };
//       setPatients([...patients, newPatient]);
//       setTripData({ ...tripData, patient_id: data.id });
//       setPatientSearch(`${data.first_name} ${data.last_name}`);
//       setIsAddingNewPatient(false);
//     } catch (error) {
//       console.error('Error adding new patient:', error);http://localhost:3000/admin/tasks
//       setError('Failed to add new patient. Please try again.');
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => { 
//     e.preventDefault();
//     if (!organization) {
//       setError('No organization found');
//       return;
//     }

//     try {
//       const { data, error } = await supabase
//         .from('trips')
//         .insert([{ 
//           ...tripData, 
//           status: 'Scheduled',
//           org_id: organization.id
//         }])
//         .select()
//         .single();

//       if (error) throw error;

//       console.log('Trip added:', data);
//       router.push('/admin/trips');
//     } catch (error) {
//       console.error('Error adding trip:', error);
//       setError('Failed to add trip. Please try again.');
//     }
//   };

//   const handlePatientSelect = (patient: SelectOption) => {
//     setTripData({ ...tripData, patient_id: patient.value });
//     setPatientSearch(patient.label);
//     setIsPatientDropdownOpen(false);
//   };

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div className="text-red-500">{error}</div>;

//   return (
//     <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
//       <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">Add New Trip</h1>
//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="relative">
//           <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
//           {isAddingNewPatient ? (
//             <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
//               <input name="first_name" placeholder="First Name" onChange={handleNewPatientDataChange} required className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
//               <input name="last_name" placeholder="Last Name" onChange={handleNewPatientDataChange} required className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
//               <input name="date_of_birth" type="date" placeholder="Date of Birth" onChange={handleNewPatientDataChange} required className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
//               <input name="phone_number" placeholder="Phone Number" onChange={handleNewPatientDataChange} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
//               <input name="email" type="email" placeholder="Email" onChange={handleNewPatientDataChange} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
//               <input name="address" placeholder="Address" onChange={handleNewPatientDataChange} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
//               <div className="flex space-x-4">
//                 <button type="button" onClick={handleAddNewPatient} className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-150 ease-in-out flex items-center justify-center">
//                   <PlusCircle className="w-5 h-5 mr-2" />
//                   Add New Patient
//                 </button>
//                 <button type="button" onClick={() => setIsAddingNewPatient(false)} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-150 ease-in-out flex items-center justify-center">
//                   <X className="w-5 h-5 mr-2" />
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div>
//               <input
//                 type="text"
//                 value={patientSearch}
//                 onChange={(e) => setPatientSearch(e.target.value)}
//                 placeholder="Search for a patient"
//                 className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//               />
//               {isPatientDropdownOpen && filteredPatients.length > 0 && (
//                 <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
//                   {filteredPatients.map(patient => (
//                     <div
//                       key={patient.value}
//                       className="p-3 hover:bg-gray-100 cursor-pointer transition duration-150 ease-in-out"
//                       onClick={() => handlePatientSelect(patient)}
//                     >
//                       {patient.label}
//                     </div>
//                   ))}
//                 </div>
//               )}
//               <button type="button" onClick={() => setIsAddingNewPatient(true)} className="mt-3 text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out flex items-center">
//                 <PlusCircle className="w-5 h-5 mr-1" />
//                 Add New Patient
//               </button>
//             </div>
//           )}
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Driver</label>
//             <select 
//               name="driver_id" 
//               onChange={handleTripDataChange} 
//               required 
//               className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="">Select Driver</option>
//               {drivers.map(driver => (
//                 <option key={driver.value} value={driver.value}>{driver.label}</option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
//             <select 
//               name="vehicle_id" 
//               onChange={handleTripDataChange} 
//               required 
//               className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="">Select Vehicle</option>
//               {vehicles.map(vehicle => (
//                 <option key={vehicle.value} value={vehicle.value}>{vehicle.label}</option>
//               ))}
//             </select>
//           </div>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Address</label>
//               <input
//                 name="pickup_address"
//                 onChange={handleTripDataChange}
//                 placeholder="Enter pickup address"
//                 className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//               />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Dropoff Address</label>
//               <input
//                 name="dropoff_address"
//                 onChange={handleTripDataChange}
//                 placeholder="Enter dropoff address"
//                 className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//               />
//           </div>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Time</label>
//             <input 
//               name="pickup_time" 
//               type="datetime-local" 
//               onChange={handleTripDataChange} 
//               required 
//               className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Dropoff Time</label>
//             <input 
//               name="dropoff_time" 
//               type="datetime-local" 
//               onChange={handleTripDataChange} 
//               required 
//               className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
//             />
//           </div>
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
//           <textarea 
//             name="notes" 
//             onChange={handleTripDataChange} 
//             className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
//             rows={4}
//           ></textarea>
//         </div>
//         <button 
//           type="submit" 
//           className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-150 ease-in-out font-medium text-lg"
//         >
//           Add Trip
//         </button>
//       </form>
//     </div>
//   );
// }












// "use client";

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { createClerkSupabaseClient } from '../../../lib/supabase';
// import { useOrganization } from '@clerk/nextjs';
// import { useRouter } from 'next/navigation';
// import { PlusCircle, X } from 'lucide-react';
// import usePlacesAutocomplete, {
//   getGeocode,
//   getLatLng,
// } from "use-places-autocomplete";

// type TripInput = {
//   patient_id: string;
//   driver_id: string;
//   vehicle_id: string;
//   pickup_address: string;
//   dropoff_address: string;
//   pickup_time: string;
//   dropoff_time: string;
//   notes: string;
// };

// type PatientInput = {
//   first_name: string;
//   last_name: string;
//   date_of_birth: string;
//   phone_number: string;
//   email: string;
//   address: string;
// };

// type SelectOption = {
//   value: string;
//   label: string;
// };

// export default function AddTripPage() {
//   const [tripData, setTripData] = useState<TripInput>({
//     patient_id: '',
//     driver_id: '',
//     vehicle_id: '',
//     pickup_address: '',
//     dropoff_address: '',
//     pickup_time: '',
//     dropoff_time: '',
//     notes: '',
//   });
//   const [newPatientData, setNewPatientData] = useState<PatientInput>({
//     first_name: '',
//     last_name: '',
//     date_of_birth: '',
//     phone_number: '',
//     email: '',
//     address: '',
//   });
//   const [patients, setPatients] = useState<SelectOption[]>([]);
//   const [filteredPatients, setFilteredPatients] = useState<SelectOption[]>([]);
//   const [drivers, setDrivers] = useState<SelectOption[]>([]);
//   const [vehicles, setVehicles] = useState<SelectOption[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isAddingNewPatient, setIsAddingNewPatient] = useState(false);
//   const [patientSearch, setPatientSearch] = useState('');
//   const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);

//   const patientDropdownRef = useRef<HTMLDivElement>(null);

//   const supabase = createClerkSupabaseClient();
//   const router = useRouter();
//   const { organization } = useOrganization();

//   useEffect(() => {
//     if (organization) {
//       fetchOptions();
//     }
//   }, [organization]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (patientDropdownRef.current && !patientDropdownRef.current.contains(event.target as Node)) {
//         setIsPatientDropdownOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   useEffect(() => {
//     if (patientSearch.length > 0) {
//       const filtered = patients.filter(patient => 
//         patient.label.toLowerCase().includes(patientSearch.toLowerCase())
//       );
//       setFilteredPatients(filtered);
//       setIsPatientDropdownOpen(true);
//     } else {
//       setFilteredPatients([]);
//       setIsPatientDropdownOpen(false);
//     }
//   }, [patientSearch, patients]);

//   const fetchOptions = async () => {
//     setIsLoading(true);
//     try {
//       const [patientsData, driversData, vehiclesData] = await Promise.all([
//         supabase.from('patients').select('id, first_name, last_name').eq('org_id', organization?.id),
//         supabase.from('drivers').select('id, user_id').eq('org_id', organization?.id),
//         supabase.from('vehicles').select('id, make, model, year').eq('org_id', organization?.id),
//       ]);

//       if (patientsData.error) throw patientsData.error;
//       if (driversData.error) throw driversData.error;
//       if (vehiclesData.error) throw vehiclesData.error;

//       const driverUserIds = driversData.data.map(driver => driver.user_id);
//       const { data: usersData, error: usersError } = await supabase
//         .from('users')
//         .select('id, first_name, last_name')
//         .in('id', driverUserIds);

//       if (usersError) throw usersError;

//       const userMap = new Map(usersData.map(user => [user.id, user]));

//       setPatients(patientsData.data.map(p => ({ value: p.id, label: `${p.first_name} ${p.last_name}` })));
//       setDrivers(driversData.data.map(d => {
//         const user = userMap.get(d.user_id);
//         return { value: d.id, label: user ? `${user.first_name} ${user.last_name}` : 'Unknown Driver' };
//       }));
//       setVehicles(vehiclesData.data.map(v => ({ value: v.id, label: `${v.year} ${v.make} ${v.model}` })));
//     } catch (err) {
//       console.error('Error fetching options:', err);
//       setError('Failed to load options. Please try again later.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleTripDataChange = useCallback((name: string, value: string) => {
//     setTripData(prev => ({ ...prev, [name]: value }));
//   }, []);

//   const handleNewPatientDataChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setNewPatientData(prev => ({ ...prev, [name]: value }));
//   }, []);

//   const handleAddNewPatient = async () => {
//     if (!organization) {
//       setError('No organization found');
//       return;
//     }

//     try {
//       const { data, error } = await supabase
//         .from('patients')
//         .insert([{ ...newPatientData, org_id: organization.id }])
//         .select()
//         .single();

//       if (error) throw error;

//       console.log('New patient added:', data);
//       const newPatient = { value: data.id, label: `${data.first_name} ${data.last_name}` };
//       setPatients(prev => [...prev, newPatient]);
//       handleTripDataChange('patient_id', data.id);
//       setPatientSearch(`${data.first_name} ${data.last_name}`);
//       setIsAddingNewPatient(false);
//     } catch (error) {
//       console.error('Error adding new patient:', error);
//       setError('Failed to add new patient. Please try again.');
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!organization) {
//       setError('No organization found');
//       return;
//     }

//     try {
//       const { data, error } = await supabase
//         .from('trips')
//         .insert([{ 
//           ...tripData, 
//           status: 'Scheduled',
//           org_id: organization.id
//         }])
//         .select()
//         .single();

//       if (error) throw error;

//       console.log('Trip added:', data);
//       router.push('/admin/trips');
//     } catch (error) {
//       console.error('Error adding trip:', error);
//       setError('Failed to add trip. Please try again.');
//     }
//   };

//   const handlePatientSelect = (patient: SelectOption) => {
//     handleTripDataChange('patient_id', patient.value);
//     setPatientSearch(patient.label);
//     setIsPatientDropdownOpen(false);
//   };

//   const AddressAutocomplete = useCallback(({ type }: { type: 'pickup' | 'dropoff' }) => {
//     const {
//       ready,
//       value,
//       suggestions: { status, data },
//       setValue,
//       clearSuggestions,
//     } = usePlacesAutocomplete({
//       requestOptions: {},
//       debounce: 300,
//     });
  
//     useEffect(() => {
//       setValue(tripData[`${type}_address`]);
//     }, [type, tripData, setValue]);
  
//     const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//       setValue(e.target.value);
//       handleTripDataChange(`${type}_address`, e.target.value);
//     };
  
//     const handleSelect = async (address: string) => {
//       setValue(address, false);
//       clearSuggestions();
//       handleTripDataChange(`${type}_address`, address);

//       try {
//         const results = await getGeocode({ address });
//         const { lat, lng } = await getLatLng(results[0]);
//         console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} Coordinates:`, { lat, lng });
//         // Here you can store lat and lng if needed
//       } catch (error) {
//         console.error("Error: ", error);
//       }
//     };
  
//     return (
//       <div>
//         <input
//           name={`${type}_address`}
//           value={value}
//           onChange={handleInput}
//           disabled={!ready}
//           placeholder={`Enter ${type} address`}
//           className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//         />
//         {status === "OK" && (
//           <ul className="mt-2 bg-white border border-gray-300 rounded-md shadow-sm">
//             {data.map(({ place_id, description }) => (
//               <li
//                 key={place_id}
//                 onClick={() => handleSelect(description)}
//                 className="p-2 hover:bg-gray-100 cursor-pointer"
//               >
//                 {description}
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     );
//   }, [tripData, handleTripDataChange]);

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div className="text-red-500">{error}</div>;

//   return (
//     <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
//       <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">Add New Trip</h1>
//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="relative" ref={patientDropdownRef}>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
//           {isAddingNewPatient ? (
//             <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
//               <input name="first_name" placeholder="First Name" onChange={handleNewPatientDataChange} required className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
//               <input name="last_name" placeholder="Last Name" onChange={handleNewPatientDataChange} required className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
//               <input name="date_of_birth" type="date" placeholder="Date of Birth" onChange={handleNewPatientDataChange} required className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
//               <input name="phone_number" placeholder="Phone Number" onChange={handleNewPatientDataChange} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
//               <input name="email" type="email" placeholder="Email" onChange={handleNewPatientDataChange} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
//               <input name="address" placeholder="Address" onChange={handleNewPatientDataChange} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
//               <div className="flex space-x-4">
//                 <button type="button" onClick={handleAddNewPatient} className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-150 ease-in-out flex items-center justify-center">
//                   <PlusCircle className="w-5 h-5 mr-2" />
//                   Add New Patient
//                 </button>
//                 <button type="button" onClick={() => setIsAddingNewPatient(false)} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-150 ease-in-out flex items-center justify-center">
//                   <X className="w-5 h-5 mr-2" />
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div>
//               <input
//                 type="text"
//                 value={patientSearch}
//                 onChange={(e) => setPatientSearch(e.target.value)}
//                 placeholder="Search for a patient"
//                 className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//               />
//               {isPatientDropdownOpen && filteredPatients.length > 0 && (
//                 <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
//                   {filteredPatients.map(patient => (
//                     <div
//                       key={patient.value}
//                       className="p-3 hover:bg-gray-100 cursor-pointer transition duration-150 ease-in-out"
//                       onClick={() => handlePatientSelect(patient)}
//                     >
//                       {patient.label}
//                     </div>
//                   ))}
//                 </div>
//               )}
//               <button type="button" onClick={() => setIsAddingNewPatient(true)} className="mt-3 text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out flex items-center">
//                 <PlusCircle className="w-5 h-5 mr-1" />
//                 Add New Patient
//               </button>
//             </div>
//           )}
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Driver</label>
//             <select 
//               name="driver_id" 
//               onChange={(e) => handleTripDataChange('driver_id', e.target.value)}value={tripData.driver_id}
//               required 
//               className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="">Select Driver</option>
//               {drivers.map(driver => (
//                 <option key={driver.value} value={driver.value}>{driver.label}</option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
//             <select 
//               name="vehicle_id" 
//               onChange={(e) => handleTripDataChange('vehicle_id', e.target.value)}
//               value={tripData.vehicle_id}
//               required 
//               className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="">Select Vehicle</option>
//               {vehicles.map(vehicle => (
//                 <option key={vehicle.value} value={vehicle.value}>{vehicle.label}</option>
//               ))}
//             </select>
//           </div>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Address</label>
//             <AddressAutocomplete type="pickup" />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Dropoff Address</label>
//             <AddressAutocomplete type="dropoff" />
//           </div>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Time</label>
//             <input 
//               name="pickup_time" 
//               type="datetime-local" 
//               onChange={(e) => handleTripDataChange('pickup_time', e.target.value)} 
//               value={tripData.pickup_time}
//               required 
//               className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Dropoff Time</label>
//             <input 
//               name="dropoff_time" 
//               type="datetime-local" 
//               onChange={(e) => handleTripDataChange('dropoff_time', e.target.value)} 
//               value={tripData.dropoff_time}
//               required 
//               className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
//             />
//           </div>
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
//           <textarea 
//             name="notes" 
//             onChange={(e) => handleTripDataChange('notes', e.target.value)}
//             value={tripData.notes}
//             className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
//             rows={4}
//           ></textarea>
//         </div>
//         <button 
//           type="submit" 
//           className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-150 ease-in-out font-medium text-lg"
//         >
//           Add Trip
//         </button>
//       </form>
//     </div>
//   );
//  }










// "use client";
// import React, { useState, useEffect, useRef } from 'react';
// import { createClerkSupabaseClient } from '../../../lib/supabase';
// import { useOrganization } from '@clerk/nextjs';
// import { useRouter } from 'next/navigation';
// import { PlusCircle, X } from 'lucide-react';
// import usePlacesAutocomplete, {
//   getGeocode,
//   getLatLng,
// } from "use-places-autocomplete";

// type TripInput = {
//   patient_id: string;
//   driver_id: string;
//   vehicle_id: string;
//   pickup_address: string;
//   dropoff_address: string;
//   pickup_time: string;
//   dropoff_time: string;
//   notes: string;
// };

// type PatientInput = {
//   first_name: string;
//   last_name: string;
//   date_of_birth: string;
//   phone_number: string;
//   email: string;
//   address: string;
// };

// type SelectOption = {
//   value: string;
//   label: string;
// };

// export default function AddTripPage() {
//   const [tripData, setTripData] = useState<TripInput>({
//     patient_id: '',
//     driver_id: '',
//     vehicle_id: '',
//     pickup_address: '',
//     dropoff_address: '',
//     pickup_time: '',
//     dropoff_time: '',
//     notes: '',
//   });
//   const [newPatientData, setNewPatientData] = useState<PatientInput>({
//     first_name: '',
//     last_name: '',
//     date_of_birth: '',
//     phone_number: '',
//     email: '',
//     address: '',
//   });
//   const [patients, setPatients] = useState<SelectOption[]>([]);
//   const [filteredPatients, setFilteredPatients] = useState<SelectOption[]>([]);
//   const [drivers, setDrivers] = useState<SelectOption[]>([]);
//   const [vehicles, setVehicles] = useState<SelectOption[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isAddingNewPatient, setIsAddingNewPatient] = useState(false);
//   const [patientSearch, setPatientSearch] = useState('');
//   const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
//   const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

//   const patientDropdownRef = useRef<HTMLDivElement>(null);

//   const supabase = createClerkSupabaseClient();
//   const router = useRouter();
//   const { organization } = useOrganization();

//   useEffect(() => {
//     if (window.google && window.google.maps) {
//       setIsGoogleLoaded(true);
//     } else {
//       const checkGoogleInterval = setInterval(() => {
//         if (window.google && window.google.maps) {
//           setIsGoogleLoaded(true);
//           clearInterval(checkGoogleInterval);
//         }
//       }, 400);

//       return () => clearInterval(checkGoogleInterval);
//     }
//   }, []);

//   useEffect(() => {
//     if (organization) {
//       fetchOptions();
//     }
//   }, [organization]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (patientDropdownRef.current && !patientDropdownRef.current.contains(event.target as Node)) {
//         setIsPatientDropdownOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   useEffect(() => {
//     if (patientSearch.length > 0) {
//       const filtered = patients.filter(patient => 
//         patient.label.toLowerCase().includes(patientSearch.toLowerCase())
//       );
//       setFilteredPatients(filtered);
//       setIsPatientDropdownOpen(true);
//     } else {
//       setFilteredPatients([]);
//       setIsPatientDropdownOpen(false);
//     }
//   }, [patientSearch, patients]);

//   const fetchOptions = async () => {
//     setIsLoading(true);
//     try {
//       const [patientsData, driversData, vehiclesData] = await Promise.all([
//         supabase.from('patients').select('id, first_name, last_name').eq('org_id', organization?.id),
//         supabase.from('drivers').select('id, user_id').eq('org_id', organization?.id),
//         supabase.from('vehicles').select('id, make, model, year').eq('org_id', organization?.id),
//       ]);

//       if (patientsData.error) throw patientsData.error;
//       if (driversData.error) throw driversData.error;
//       if (vehiclesData.error) throw vehiclesData.error;

//       const driverUserIds = driversData.data.map(driver => driver.user_id);
//       const { data: usersData, error: usersError } = await supabase
//         .from('users')
//         .select('id, first_name, last_name')
//         .in('id', driverUserIds);

//       if (usersError) throw usersError;

//       const userMap = new Map(usersData.map(user => [user.id, user]));

//       setPatients(patientsData.data.map(p => ({ value: p.id, label: `${p.first_name} ${p.last_name}` })));
//       setDrivers(driversData.data.map(d => {
//         const user = userMap.get(d.user_id);
//         return { value: d.id, label: user ? `${user.first_name} ${user.last_name}` : 'Unknown Driver' };
//       }));
//       setVehicles(vehiclesData.data.map(v => ({ value: v.id, label: `${v.year} ${v.make} ${v.model}` })));
//     } catch (err) {
//       console.error('Error fetching options:', err);
//       setError('Failed to load options. Please try again later.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleTripDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     setTripData(prevData => ({
//       ...prevData,
//       [e.target.name]: e.target.value
//     }));
//     console.log(tripData)
//   };

//   const handleAddressChange = (type: 'pickup' | 'dropoff', address: string) => {
//     setTripData(prevData => ({
//       ...prevData,
//       [`${type}_address`]: address
//     }));
//   };

//   const handleNewPatientDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setNewPatientData({ ...newPatientData, [e.target.name]: e.target.value });
//   };

//   const handleAddNewPatient = async () => {
//     if (!organization) {
//       setError('No organization found');
//       return;
//     }

//     try {
//       const { data, error } = await supabase
//         .from('patients')
//         .insert([{ ...newPatientData, org_id: organization.id }])
//         .select()
//         .single();

//       if (error) throw error;

//       console.log('New patient added:', data);
//       const newPatient = { value: data.id, label: `${data.first_name} ${data.last_name}` };
//       setPatients([...patients, newPatient]);
//       setTripData(prevData => ({ ...prevData, patient_id: data.id }));
//       setPatientSearch(`${data.first_name} ${data.last_name}`);
//       setIsAddingNewPatient(false);
//     } catch (error) {
//       console.error('Error adding new patient:', error);
//       setError('Failed to add new patient. Please try again.');
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!organization) {
//       setError('No organization found');
//       return;
//     }

//     try {
//       const { data, error } = await supabase
//         .from('trips')
//         .insert([{ 
//           ...tripData, 
//           status: 'Scheduled',
//           org_id: organization.id
//         }])
//         .select()
//         .single();

//       if (error) throw error;

//       console.log('Trip added:', data);
//       router.push('/admin/trips');
//     } catch (error) {
//       console.error('Error adding trip:', error);
//       setError('Failed to add trip. Please try again.');
//     }
//   };

//   const handlePatientSelect = (patient: SelectOption) => {
//     setTripData(prevData => ({ ...prevData, patient_id: patient.value }));
//     setPatientSearch(patient.label);
//     setIsPatientDropdownOpen(false);
//   };

//   // const AddressAutocomplete = ({ type }: { type: 'pickup' | 'dropoff' }) => {
//   //   const {
//   //     ready,
//   //     value,
//   //     suggestions: { status, data },
//   //     setValue,
//   //     clearSuggestions,
//   //   } = usePlacesAutocomplete({
//   //     requestOptions: {},
//   //     debounce: 300,
//   //   });

//   //   useEffect(() => {
//   //     setValue(tripData[`${type}_address`]);
//   //   }, [tripData[`${type}_address`]]);
//   //   useEffect(() => {
//   //     setValue(tripData[`${type}_address`]);
//   //   }, [type, tripData, setValue]);
//   //   const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//   //     setValue(e.target.value);
//   //     handleAddressChange(type, e.target.value);
//   //   };

//   //   const handleSelect = async (address: string) => {
//   //     setValue(address, false);
//   //     clearSuggestions();
//   //     handleAddressChange(type, address);

//   //     try {
//   //       const results = await getGeocode({ address });
//   //       const { lat, lng } = await getLatLng(results[0]);
//   //       console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} Coordinates:`, { lat, lng });
//   //     } catch (error) {
//   //       console.error("Error: ", error);
//   //     }
//   //   };

//   //   return (
//   //     <div>
//   //       <input
//   //         value={value}
//   //         onChange={handleInput}
//   //         disabled={!ready}
//   //         placeholder={`Enter ${type} address`}
//   //         className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//   //       />
//   //       {status === "OK" && (
//   //         <ul className="mt-2 bg-white border border-gray-300 rounded-md shadow-sm">
//   //           {data.map(({ place_id, description }) => (
//   //             <li
//   //               key={place_id}
//   //               onClick={() => handleSelect(description)}
//   //               className="p-2 hover:bg-gray-100 cursor-pointer"
//   //             >
//   //               {description}
//   //             </li>
//   //           ))}
//   //         </ul>
//   //       )}
//   //     </div>
//   //   );
//   // };

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div className="text-red-500">{error}</div>;

//   return (
//     <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
//       <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">Add New Trip</h1>
//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="relative">
//           <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
//           {isAddingNewPatient ? (
//             <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
//               <input name="first_name" placeholder="First Name" onChange={handleNewPatientDataChange} required className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
//               <input name="last_name" placeholder="Last Name" onChange={handleNewPatientDataChange} required className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
//               <input name="date_of_birth" type="date" placeholder="Date of Birth" onChange={handleNewPatientDataChange} required className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
//               <input name="phone_number" placeholder="Phone Number" onChange={handleNewPatientDataChange} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
//               <input name="email" type="email" placeholder="Email" onChange={handleNewPatientDataChange} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
//               <input name="address" placeholder="Address" onChange={handleNewPatientDataChange} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
//               <div className="flex space-x-4">
//                 <button type="button" onClick={handleAddNewPatient} className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-150 ease-in-out flex items-center justify-center">
//                   <PlusCircle className="w-5 h-5 mr-2" />
//                   Add New Patient
//                 </button>
//                 <button type="button" onClick={() => setIsAddingNewPatient(false)} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-150 ease-in-out flex items-center justify-center">
//                   <X className="w-5 h-5 mr-2" />
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div>
//               <input
//                 type="text"
//                 value={patientSearch}
//                 onChange={(e) => setPatientSearch(e.target.value)}
//                 placeholder="Search for a patient"
//                 className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//               />
//               {isPatientDropdownOpen && filteredPatients.length > 0 && (
//                 <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
//                   {filteredPatients.map(patient => (
//                     <div
//                       key={patient.value}
//                       className="p-3 hover:bg-gray-100 cursor-pointer transition duration-150 ease-in-out"
//                       onClick={() => handlePatientSelect(patient)}
//                     >
//                       {patient.label}
//                     </div>
//                   ))}
//                 </div>
//               )}
//               <button type="button" onClick={() => setIsAddingNewPatient(true)} className="mt-3 text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out flex items-center">
//                 <PlusCircle className="w-5 h-5 mr-1" />
//                 Add New Patient
//               </button>
//             </div>
//           )}
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Driver</label>
//             <select 
//               name="driver_id" 
//               onChange={handleTripDataChange} 
//               required 
//               className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="">Select Driver</option>
//               {drivers.map(driver => (
//                 <option key={driver.value} value={driver.value}>{driver.label}</option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
//             <select 
//               name="vehicle_id" 
//               onChange={handleTripDataChange} 
//               required 
//               className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="">Select Vehicle</option>
//               {vehicles.map(vehicle => (
//                 <option key={vehicle.value} value={vehicle.value}>{vehicle.label}</option>
//               ))}
//             </select>
//           </div>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Address</label>
//             {/* {isGoogleLoaded ? (
//               <AddressAutocomplete type="pickup" />
//             ) : ( */}
//               <input
//                 name="pickup_address"
//                 value={tripData.pickup_address}
//                 onChange={handleTripDataChange}
//                 placeholder="Enter pickup address"
//                 className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//               />
//             {/* )} */}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Dropoff Address</label>
//             {/* {isGoogleLoaded ? (
//               <AddressAutocomplete type="dropoff" />
//             ) : ( */}
//               <input
//                 name="dropoff_address"
//                 value={tripData.dropoff_address}
//                 onChange={handleTripDataChange}
//                 placeholder="Enter dropoff address"
//                 className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//               />
//             {/* )} */}
//           </div>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Time</label>
//             <input 
//               name="pickup_time" 
//               type="datetime-local" 
//               value={tripData.pickup_time}
//               onChange={handleTripDataChange} 
//               required 
//               className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Dropoff Time</label>
//             <input 
//               name="dropoff_time" 
//               type="datetime-local" 
//               value={tripData.dropoff_time}
//               onChange={handleTripDataChange} 
//               required 
//               className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
//             />
//           </div>
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
//           <textarea 
//             name="notes" 
//             value={tripData.notes}
//             onChange={handleTripDataChange} 
//             className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
//             rows={4}
//           ></textarea>
//         </div>
//         <button 
//           type="submit" 
//           className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-150 ease-in-out font-medium text-lg"
//         >
//           Add Trip
//         </button>
//       </form>
//     </div>
//   );
// }











"use client";
import React, { useState, useEffect, useRef } from 'react';
import { createClerkSupabaseClient } from '../../../lib/supabase';
import { useOrganization } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { PlusCircle, X } from 'lucide-react';

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
      setTripData(prevData => ({ ...prevData, patient_id: data.id }));
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
    setTripData(prevData => ({ ...prevData, patient_id: patient.value }));
    setPatientSearch(patient.label);
    setIsPatientDropdownOpen(false);
  };

  const handlePatientSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setPatientSearch(searchValue);
    
    if (searchValue.length > 0) {
      const filtered = patients.filter(patient => 
        patient.label.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredPatients(filtered);
      setIsPatientDropdownOpen(true);
    } else {
      setFilteredPatients([]);
      setIsPatientDropdownOpen(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">Add New Trip</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
          {isAddingNewPatient ? (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <input name="first_name" placeholder="First Name" onChange={handleNewPatientDataChange} required className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              <input name="last_name" placeholder="Last Name" onChange={handleNewPatientDataChange} required className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              <input name="date_of_birth" type="date" placeholder="Date of Birth" onChange={handleNewPatientDataChange} required className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              <input name="phone_number" placeholder="Phone Number" onChange={handleNewPatientDataChange} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              <input name="email" type="email" placeholder="Email" onChange={handleNewPatientDataChange} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              <input name="address" placeholder="Address" onChange={handleNewPatientDataChange} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              <div className="flex space-x-4">
                <button type="button" onClick={handleAddNewPatient} className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-150 ease-in-out flex items-center justify-center">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Add New Patient
                </button>
                <button type="button" onClick={() => setIsAddingNewPatient(false)} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-150 ease-in-out flex items-center justify-center">
                  <X className="w-5 h-5 mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div ref={patientDropdownRef}>
              <input
                type="text"
                value={patientSearch}
                onChange={handlePatientSearchChange}
                onFocus={() => setIsPatientDropdownOpen(true)}
                placeholder="Search for a patient"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              {isPatientDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map(patient => (
                      <div
                        key={patient.value}
                        className="p-3 hover:bg-gray-100 cursor-pointer transition duration-150 ease-in-out"
                        onClick={() => handlePatientSelect(patient)}
                      >
                        {patient.label}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-gray-500">No patients found</div>
                  )}
                </div>
              )}
              <button type="button" onClick={() => setIsAddingNewPatient(true)} className="mt-3 text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out flex items-center">
                <PlusCircle className="w-5 h-5 mr-1" />
                Add New Patient
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Driver</label>
            <select 
              name="driver_id" 
              onChange={handleTripDataChange} 
              required 
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Driver</option>
              {drivers.map(driver => (
                <option key={driver.value} value={driver.value}>{driver.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
            <select 
              name="vehicle_id" 
              onChange={handleTripDataChange} 
              required 
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Vehicle</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.value} value={vehicle.value}>{vehicle.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Address</label>
              <input
                name="pickup_address"
                onChange={handleTripDataChange}
                placeholder="Enter pickup address"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dropoff Address</label>
              <input
                name="dropoff_address"
                onChange={handleTripDataChange}
                placeholder="Enter dropoff address"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Time</label>
            <input 
              name="pickup_time" 
              type="datetime-local" 
              onChange={handleTripDataChange} 
              required 
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Dropoff Time</label>
            <input 
              name="dropoff_time" 
              type="datetime-local" 
              onChange={handleTripDataChange} 
              required 
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea 
            name="notes" 
            onChange={handleTripDataChange} 
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
            rows={4}
          ></textarea>
        </div>
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-150 ease-in-out font-medium text-lg"
        >
          Add Trip
        </button>
      </form>
    </div>
  );
}