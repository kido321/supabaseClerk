"use client"

// import React, { useEffect, useState } from 'react';
// import { createClerkSupabaseClient } from '../../lib/supabase';
// import { useOrganization } from '@clerk/nextjs';
// import Link from 'next/link';
// import { FaPlus, FaCar, FaUser, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

// type Trip = {
//   id: string;
//   org_id: string;
//   patient_id: string;
//   driver_id: string;
//   vehicle_id: string;
//   pickup_address: string;
//   dropoff_address: string;
//   pickup_time: string;
//   dropoff_time: string | null;
//   status: string;
//   notes: string | null;
// };

// type PatientInfo = {
//   id: string;
//   first_name: string;
//   last_name: string;
// };

// type DriverInfo = {
//   id: string;
//   first_name: string;
//   last_name: string;
// };

// type VehicleInfo = {
//   id: string;
//   make: string;
//   model: string;
//   year: number;
// };

// export default function TripsPage() {
//   const [trips, setTrips] = useState<(Trip & { patientInfo: PatientInfo, driverInfo: DriverInfo, vehicleInfo: VehicleInfo })[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const supabase = createClerkSupabaseClient();
//   const { organization } = useOrganization();

//   useEffect(() => {
//     if (organization) {
//       setTimeout(() => {
//         fetchTrips();
//       }, 400);
//     }
//   }, [organization]);

//   const fetchTrips = async () => {
//     setIsLoading(true);
//     try {
//       const { data: tripsData, error: tripsError } = await supabase
//         .from('trips')
//         .select(`
//           *,
//           patientInfo:patients!trips_patient_id_fkey(id, first_name, last_name),
//           driverInfo:drivers!trips_driver_id_fkey(id, user_id),
//           vehicleInfo:vehicles!trips_vehicle_id_fkey(id, make, model, year)
//         `)
//         .eq('org_id', organization?.id)
//         .order('pickup_time', { ascending: false });

//       if (tripsError) throw tripsError;

//       // Fetch user information for drivers
//       const driverUserIds = tripsData.map(trip => trip.driverInfo.user_id);
//       const { data: usersData, error: usersError } = await supabase
//         .from('users')
//         .select('id, first_name, last_name')
//         .in('id', driverUserIds);

//       if (usersError) throw usersError;

//       const userMap = new Map(usersData.map(user => [user.id, user]));

//       const enrichedTrips = tripsData.map(trip => ({
//         ...trip,
//         driverInfo: {
//           ...trip.driverInfo,
//           first_name: userMap.get(trip.driverInfo.user_id)?.first_name || '',
//           last_name: userMap.get(trip.driverInfo.user_id)?.last_name || '',
//         },
//       }));

//       setTrips(enrichedTrips);
//     } catch (err) {
//       console.error('Error fetching trips:', err);
//       setError('Failed to load trips. Please try again later.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isLoading) return <div className="flex justify-center items-center h-screen">
//     <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//   </div>;

//   if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

//   return (
//     <div className="mx-auto p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-800">Trips</h1>
//         <Link href="/admin/trips/addtrip" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition duration-150 ease-in-out">
//           <FaPlus className="mr-2" />
//           Add New Trip
//         </Link>
//       </div>
//       {trips.length === 0 ? (
//         <div className="text-center py-10">
//           <p className="text-gray-600 mb-4">No trips found. Add a new trip to get started.</p>
//           <Link href="/admin/trips/addtrip" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition duration-150 ease-in-out">
//             <FaPlus className="mr-2" />
//             Add Your First Trip
//           </Link>
//         </div>
//       ) : (
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {trips.map((trip) => (
//             <div key={trip.id} className="bg-white rounded-lg shadow-md overflow-hidden">
//               <div className={`p-4 ${getStatusBackgroundColor(trip.status)}`}>
//                 <h2 className="text-xl font-semibold text-white">{`${trip.patientInfo.first_name} ${trip.patientInfo.last_name}`}</h2>
//                 <span className="inline-block bg-gray-500 text-sm font-semibold px-2 py-1 rounded mt-2">
//                   {trip.status}
//                 </span>
//               </div>
//               <div className="p-4">
//                 <p className="flex items-center text-gray-600 mb-2">
//                   <FaUser className="mr-2" /> {`${trip.driverInfo.first_name} ${trip.driverInfo.last_name}`}
//                 </p>
//                 <p className="flex items-center text-gray-600 mb-2">
//                   <FaCar className="mr-2" /> {`${trip.vehicleInfo.year} ${trip.vehicleInfo.make} ${trip.vehicleInfo.model}`}
//                 </p>
//                 <p className="flex items-center text-gray-600 mb-2">
//                   <FaMapMarkerAlt className="mr-2" /> From: {trip.pickup_address}
//                 </p>
//                 <p className="flex items-center text-gray-600 mb-2">
//                   <FaMapMarkerAlt className="mr-2" /> To: {trip.dropoff_address}
//                 </p>
//                 <p className="flex items-center text-gray-600 mb-2">
//                   <FaClock className="mr-2" /> Pickup: {new Date(trip.pickup_time).toLocaleString()}
//                 </p>
//                 {trip.dropoff_time && (
//                   <p className="flex items-center text-gray-600">
//                     <FaClock className="mr-2" /> Dropoff: {new Date(trip.dropoff_time).toLocaleString()}
//                   </p>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// function getStatusBackgroundColor(status: string) {
//   switch (status.toLowerCase()) {
//     case 'scheduled':
//       return 'bg-yellow-500';
//     case 'in progress':
//       return 'bg-blue-500';
//     case 'completed':
//       return 'bg-green-500';
//     case 'cancelled':
//       return 'bg-red-500';
//     default:
//       return 'bg-gray-500';
//   }
// }












// "use client"

// import React, { useEffect, useState } from 'react';
// import { createClerkSupabaseClient} from '../../lib/supabase';
// import { useOrganization } from '@clerk/nextjs';
// import Link from 'next/link';
// import { FaPlus, FaCar, FaUser, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

// type Trip = {
//   id: string;
//   patient_name: string;
//   driver_name: string;
//   vehicle_info: string;
//   pickup_address: string;
//   dropoff_address: string;
//   pickup_datetime: string;
//   dropoff_datetime: string;
//   status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
// };

// export default function TripsPage() {
//   const [trips, setTrips] = useState<Trip[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const supabase =  createClerkSupabaseClient();
//   const { organization } = useOrganization();

//   useEffect(() => {
//     setTimeout(() => {
//         fetchTrips();
//       }, 400);
   
//   }, [organization]);

//   const fetchTrips = async () => {
//     setIsLoading(true);
//     try {
//       const { data, error } = await supabase
//         .from('trips')
//         .select('*')
//         .order('pickup_datetime', { ascending: false });

//       if (error) throw error;

//       setTrips(data || []);
//     } catch (err) {
//       console.error('Error fetching trips:', err);
//       setError('Failed to load trips. Please try again later.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isLoading) return <div className="flex justify-center items-center h-screen">
//     <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//   </div>;

//   if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

//   return (
//     <div className="mx-auto p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-800">Trips</h1>
//         <Link href="admin/trips/addtrip" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition duration-150 ease-in-out">
//           <FaPlus className="mr-2" />
//           Add New Trip
//         </Link>
//       </div>
//       {trips.length === 0 ? (
//         <div className="text-center py-10">
//           <p className="text-gray-600 mb-4">No trips found. Add a new trip to get started.</p>
//           <Link href="/trips/add" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition duration-150 ease-in-out">
//             <FaPlus className="mr-2" />
//             Add Your First Trip
//           </Link>
//         </div>
//       ) : (
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {trips.map((trip) => (
//             <div key={trip.id} className="bg-white rounded-lg shadow-md overflow-hidden">
//               <div className={`p-4 ${getStatusBackgroundColor(trip.status)}`}>
//                 <h2 className="text-xl font-semibold text-white">{trip.patient_name}</h2>
//                 <span className="inline-block bg-gray-500 text-sm font-semibold px-2 py-1 rounded mt-2">
//                   {trip.status}
//                 </span>
//               </div>
//               <div className="p-4">
//                 <p className="flex items-center text-gray-600 mb-2">
//                   <FaUser className="mr-2" /> {trip.driver_name}
//                 </p>
//                 <p className="flex items-center text-gray-600 mb-2">
//                   <FaCar className="mr-2" /> {trip.vehicle_info}
//                 </p>
//                 <p className="flex items-center text-gray-600 mb-2">
//                   <FaMapMarkerAlt className="mr-2" /> From: {trip.pickup_address}
//                 </p>
//                 <p className="flex items-center text-gray-600 mb-2">
//                   <FaMapMarkerAlt className="mr-2" /> To: {trip.dropoff_address}
//                 </p>
//                 <p className="flex items-center text-gray-600 mb-2">
//                   <FaClock className="mr-2" /> Pickup: {new Date(trip.pickup_datetime).toLocaleString()}
//                 </p>
//                 <p className="flex items-center text-gray-600">
//                   <FaClock className="mr-2" /> Dropoff: {new Date(trip.dropoff_datetime).toLocaleString()}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// function getStatusBackgroundColor(status: Trip['status']) {
//   switch (status) {
//     case 'Scheduled':
//       return 'bg-yellow-500';
//     case 'In Progress':
//       return 'bg-blue-500';
//     case 'Completed':
//       return 'bg-green-500';
//     case 'Cancelled':
//       return 'bg-red-500';
//     default:
//       return 'bg-gray-500';
//   }
// }



// "use client";
// import React, { useState, useEffect } from 'react';
// import { createClerkSupabaseClient } from '../../lib/supabase';
// import { useOrganization } from '@clerk/nextjs';
// import Link from 'next/link';
// import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';

// type Trip = {
//   id: string;
//   patient_id: string;
//   driver_id: string;
//   vehicle_id: string;
//   pickup_address: string;
//   dropoff_address: string;
//   pickup_time: string;
//   dropoff_time: string | null;
//   status: string;
//   notes: string | null;
//   patient_name: string;
//   driver_name: string;
//   vehicle_info: string;
// };

// export default function TripsPage() {
//   const [trips, setTrips] = useState<Trip[]>([]);
//   const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [sortField, setSortField] = useState<keyof Trip>('pickup_time');
//   const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
//   const supabase = createClerkSupabaseClient();
//   const { organization } = useOrganization();

//   useEffect(() => {
//     if (organization) {
//       fetchTrips();
//     }
//   }, [organization]);

//   useEffect(() => {
//     filterAndSortTrips();
//   }, [trips, searchTerm, statusFilter, sortField, sortDirection]);

//   const fetchTrips = async () => {
//     setIsLoading(true);
//     try {
//       const { data, error } = await supabase
//         .from('trips')
//         .select(`
//           *,
//           patients(first_name, last_name),
//           drivers(id, user_id),
//           vehicles(make, model, year)
//         `)
//         .eq('org_id', organization?.id);

//       if (error) throw error;

//       if (data) {
//         const tripsWithNames = await Promise.all(data.map(async (trip) => {
//           const { data: userData } = await supabase
//             .from('users')
//             .select('first_name, last_name')
//             .eq('id', trip.drivers.user_id)
//             .single();

//           return {
//             ...trip,
//             patient_name: `${trip.patients.first_name} ${trip.patients.last_name}`,
//             driver_name: userData ? `${userData.first_name} ${userData.last_name}` : 'Unknown',
//             vehicle_info: `${trip.vehicles.year} ${trip.vehicles.make} ${trip.vehicles.model}`
//           };
//         }));

//         setTrips(tripsWithNames);
//       }
//     } catch (err) {
//       console.error('Error fetching trips:', err);
//       setError('Failed to load trips. Please try again later.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const filterAndSortTrips = () => {
//     let filtered = trips.filter(trip =>
//       (trip.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//        trip.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//        trip.pickup_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
//        trip.dropoff_address.toLowerCase().includes(searchTerm.toLowerCase())) &&
//       (statusFilter === 'all' || trip.status === statusFilter)
//     );

//     filtered.sort((a, b) => {
//       if (a[sortField]! < b[sortField]!) return sortDirection === 'asc' ? -1 : 1;
//       if (a[sortField]! > b[sortField]!) return sortDirection === 'asc' ? 1 : -1;
//       return 0;
//     });

//     setFilteredTrips(filtered);
//   };

//   const handleDelete = async (id: string) => {
//     if (window.confirm('Are you sure you want to delete this trip?')) {
//       try {
//         const { error } = await supabase
//           .from('trips')
//           .delete()
//           .eq('id', id);

//         if (error) throw error;

//         setTrips(trips.filter(trip => trip.id !== id));
//       } catch (err) {
//         console.error('Error deleting trip:', err);
//         setError('Failed to delete trip. Please try again.');
//       }
//     }
//   };

//   const handleSort = (field: keyof Trip) => {
//     if (field === sortField) {
//       setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
//     } else {
//       setSortField(field);
//       setSortDirection('asc');
//     }
//   };

//   if (isLoading) return <div className="flex justify-center items-center h-screen">
//     <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//   </div>;

//   if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

//   return (
//     <div className="container mx-auto p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-800">Trips</h1>
//         <Link href="/admin/trips/add" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition duration-150 ease-in-out">
//           <FaPlus className="mr-2" />
//           Add New Trip
//         </Link>
//       </div>

//       <div className="mb-4 flex items-center">
//         <div className="relative flex-grow mr-4">
//           <input
//             type="text"
//             placeholder="Search trips..."
//             className="w-full p-2 pl-8 pr-4 rounded border focus:outline-none focus:ring-2 focus:ring-blue-300"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <FaSearch className="absolute left-3 top-3 text-gray-400" />
//         </div>
//         <div className="relative">
//           <select
//             className="appearance-none bg-white border rounded p-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-300"
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//           >
//             <option value="all">All Statuses</option>
//             <option value="scheduled">Scheduled</option>
//             <option value="in_progress">In Progress</option>
//             <option value="completed">Completed</option>
//             <option value="cancelled">Cancelled</option>
//           </select>
//           <FaFilter className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
//         </div>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white">
//           <thead>
//             <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
//               <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('patient_name')}>Patient</th>
//               <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('driver_name')}>Driver</th>
//               <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('vehicle_info')}>Vehicle</th>
//               <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('pickup_address')}>Pickup</th>
//               <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('dropoff_address')}>Dropoff</th>
//               <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('pickup_time')}>Pickup Time</th>
//               <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSort('status')}>Status</th>
//               <th className="py-3 px-6 text-left">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="text-gray-600 text-sm font-light">
//             {filteredTrips.map((trip) => (
//               <tr key={trip.id} className="border-b border-gray-200 hover:bg-gray-100">
//                 <td className="py-3 px-6 text-left whitespace-nowrap">{trip.patient_name}</td>
//                 <td className="py-3 px-6 text-left">{trip.driver_name}</td>
//                 <td className="py-3 px-6 text-left">{trip.vehicle_info}</td>
//                 <td className="py-3 px-6 text-left">{trip.pickup_address}</td>
//                 <td className="py-3 px-6 text-left">{trip.dropoff_address}</td>
//                 <td className="py-3 px-6 text-left">{new Date(trip.pickup_time).toLocaleString()}</td>
//                 <td className="py-3 px-6 text-left">
//                   <span className={`
//                     py-1 px-3 rounded-full text-xs
//                     ${trip.status === 'scheduled' ? 'bg-yellow-200 text-yellow-800' :
//                       trip.status === 'in_progress' ? 'bg-blue-200 text-blue-800' :
//                       trip.status === 'completed' ? 'bg-green-200 text-green-800' :
//                       'bg-red-200 text-red-800'}
//                   `}>
//                     {trip.status}
//                   </span>
//                 </td>
//                 <td className="py-3 px-6 text-left">
//                   <div className="flex item-center">
//                     <Link href={`/admin/trips/edit/${trip.id}`} className="w-4 mr-2 transform hover:text-blue-500 hover:scale-110">
//                       <FaEdit />
//                     </Link>
//                     <button onClick={() => handleDelete(trip.id)} className="w-4 mr-2 transform hover:text-red-500 hover:scale-110">
//                       <FaTrash />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { createClerkSupabaseClient } from '../../lib/supabase';
import { useOrganization } from '@clerk/nextjs';
import Link from 'next/link';
import { Plus, Edit, Trash2, Search, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Trip = {
  id: string;
  patient_id: string;
  driver_id: string;
  vehicle_id: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_time: string;
  dropoff_time: string | null;
  status: string;
  notes: string | null;
  patient_name: string;
  driver_name: string;
  vehicle_info: string;
};

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<keyof Trip>('pickup_time');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const supabase = createClerkSupabaseClient();
  const { organization } = useOrganization();

  useEffect(() => {
    if (organization) {
      fetchTrips();
    }
  }, [organization]);

  useEffect(() => {
    filterAndSortTrips();
  }, [trips, searchTerm, statusFilter, sortField, sortDirection]);

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          patients(first_name, last_name),
          drivers(id, user_id),
          vehicles(make, model, year)
        `)
        .eq('org_id', organization?.id);

      if (error) throw error;

      if (data) {
        const tripsWithNames = await Promise.all(data.map(async (trip) => {
          const { data: userData } = await supabase
            .from('users')
            .select('first_name, last_name')
            .eq('id', trip.drivers.user_id)
            .single();

          return {
            ...trip,
            patient_name: `${trip.patients.first_name} ${trip.patients.last_name}`,
            driver_name: userData ? `${userData.first_name} ${userData.last_name}` : 'Unknown',
            vehicle_info: `${trip.vehicles.year} ${trip.vehicles.make} ${trip.vehicles.model}`
          };
        }));

        setTrips(tripsWithNames);
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Failed to load trips. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortTrips = () => {
    let filtered = trips.filter(trip =>
      (trip.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       trip.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       trip.pickup_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
       trip.dropoff_address.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === 'all' || trip.status === statusFilter)
    );

    filtered.sort((a, b) => {
      if (a[sortField]! < b[sortField]!) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField]! > b[sortField]!) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredTrips(filtered);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        const { error } = await supabase
          .from('trips')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setTrips(trips.filter(trip => trip.id !== id));
      } catch (err) {
        console.error('Error deleting trip:', err);
        setError('Failed to delete trip. Please try again.');
      }
    }
  };

  const handleSort = (field: keyof Trip) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="text-red-500 text-center mt-10">{error}</div>
  );

  return (
    <div className="">
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6 ">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-blue-600 rounded text-gray-100">
              <CardTitle className="text-2xl font-bold">Trips Dashboard</CardTitle>
              <Button asChild>
                <Link href="/admin/trips/add">
                  <Plus className="mr-2 h-4 w-4" /> Add New Trip
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search trips..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e:any) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value:any) => setStatusFilter(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    {['Patient', 'Driver', 'Vehicle', 'Pickup', 'Dropoff', 'Pickup Time', 'Status', 'Actions'].map((header) => (
                      <TableHead key={header} onClick={() => handleSort(header.toLowerCase() as keyof Trip)} className="cursor-pointer">
                        <Button variant="ghost" className="p-0 font-semibold text-xs">
                          {header}
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody  className='bg-grey-100'>
                  {filteredTrips.map((trip) => (
                    
                    <TableRow key={trip.id}>
                      <TableCell>{trip.patient_name}</TableCell>
                      <TableCell>{trip.driver_name}</TableCell>
                      <TableCell>{trip.vehicle_info}</TableCell>
                      <TableCell>{trip.pickup_address}</TableCell>
                      <TableCell>{trip.dropoff_address}</TableCell>
                      <TableCell>{new Date(trip.pickup_time).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={
                          trip.status === 'scheduled' ? 'destructive' :
                          trip.status === 'in_progress' ? 'secondary' :
                          trip.status === 'completed' ? 'default' :
                          'destructive'
                        }>
                          {trip.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="icon" asChild>
                            <Link href={`/admin/trips/edit/${trip.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDelete(trip.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
              
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}