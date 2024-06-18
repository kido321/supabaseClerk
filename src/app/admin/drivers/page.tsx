'use client';
import React, { use, useEffect, useState } from 'react';
import { createClerkSupabaseClient ,  createSupabaseClient  } from '../../lib/supabase';
// app/drivers/page.tsx
interface User {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  email: string | null;
  role: string | null;
  org_id: string | null;
}

interface Driver {
  org_id: string;
  car_id: string | null;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
}

<<<<<<< HEAD
type User = {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    org_id: string;
    created_at: Date;
    id :number;
};


const DriversPage: React.FC = () => {
  const supabase = createClerkSupabaseClient();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [newDriver, setNewDriver] = useState({
        userId: '',
        car: '',
        phoneNumber: ''
    });
    useEffect(() => {
      setTimeout(() => {
  ;
  fetchDrivers();
  fetchUsers();
          console.log("useEffect");
        }, 400 ); 
  
   
      
    }, []);
  
  
  

    const fetchDrivers = async () => {
        const { data, error } = await supabase
            .from('drivers')
            .select('*');
        if (error) console.error('Error fetching drivers:', error);
        else setDrivers(data || []);
=======
const DriversPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string>('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
const supabase = createSupabaseClient();

useEffect(() => {
    const fetchUsersAndDrivers = async () => {
        setTimeout(() => {
            console.log("useEffect");
          }, 400 ); 
    
      const { data: usersData} = await supabase
        .from('users')
        .select();
  
      const { data: driversData} = await supabase
        .from('Drivers')
        .select();
        console.log("data", driversData);
      //if (usersError) console.log('Error fetching users:', usersError);
       setUsers(usersData || []);
  
     // if (driversError) console.log('Error fetching drivers:', driversError);
       setDrivers(driversData || []);
  
      if (usersData && driversData) {
        const driverUserIds = new Set(driversData.map(driver => driver.user_id));
        const filteredUsers = usersData.filter(user => !driverUserIds.has(user.user_id));
        setAvailableUsers(filteredUsers);
      }
>>>>>>> e9137bccb6509c1e3824a806e28241a1e48cc424
    };
  
    fetchUsersAndDrivers();
  }, []);
  

<<<<<<< HEAD
    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from("users")
            .select();
            console.log('data'  , data);
        if (error) console.error('Error fetching users:', error);
        else setUsers(data || []);
        console.log('users', users);
=======

  const handleAssignDriver = async () => {
    if (!selectedUser) return;

    const { data, error } = await supabase
      .from('Drivers')
      .insert([{ user_id: selectedUser, org_id: orgId }]);

    if (error) console.log('Error assigning driver:', error);
    if(data){
    setDrivers([...drivers, data[0]]);}
    setSelectedUser(null);
    const fetchUsersAndDrivers = async () => {
        setTimeout(() => {
            console.log("useEffect");
          }, 400 ); 
    
      const { data: usersData} = await supabase
        .from('users')
        .select();
  
      const { data: driversData} = await supabase
        .from('Drivers')
        .select();
          console.log("data", driversData);
      //if (usersError) console.log('Error fetching users:', usersError);
       setUsers(usersData || []);
          console.log(usersData);
     // if (driversError) console.log('Error fetching drivers:', driversError);
       setDrivers(driversData || []);
  
      if (usersData && driversData) {
        const driverUserIds = new Set(driversData.map(driver => driver.user_id));
        const filteredUsers = usersData.filter(user => !driverUserIds.has(user.user_id));
        setAvailableUsers(filteredUsers);
      }
>>>>>>> e9137bccb6509c1e3824a806e28241a1e48cc424
    };
  
    fetchUsersAndDrivers();

  };

  return (
    <div className="p-6 bg-gray-800 min-h-screen text-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-center">Manage Drivers</h1>

      <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-6 max-w-md mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Assign User as Driver</h2>
        <label className="block mb-4">
          <span className="text-gray-400">Select User:</span>
          <select
            className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={selectedUser || ''}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">Select a user</option>
            {availableUsers.map((user) => (
              <option key={user.user_id} value={user.user_id}>
                {user.first_name} {user.last_name}
              </option>
            ))}
          </select>
        </label>

        <label className="block mb-4">
          <span className="text-gray-400">Org ID:</span>
          <input
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
          />
        </label>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full"
          onClick={handleAssignDriver}
        >
          Assign as Driver
        </button>
      </div>

      <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <h2 className="text-2xl font-semibold mb-4">List of Drivers</h2>
        <ul className="list-disc list-inside">
          {drivers.map((driver) => (
            <li key={driver.user_id} className="text-gray-400">
              {driver.first_name} {driver.last_name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DriversPage;
