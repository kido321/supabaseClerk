'use client';
import React, { useEffect, useState } from 'react';
import { createClerkSupabaseClient } from '../../lib/supabase';
// app/drivers/page.tsx

type Driver = {
    id: string;
    user_id: string;
    car: string;
    phone_number: string;
};

type User = {
    id: string;
    name: string;
};


const DriversPage: React.FC = () => {
  const supabase = createClerkSupabaseClient();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [newDriver, setNewDriver] = useState({
        userId: '',
        car: '',
        phoneNumber: ''
    });

    useEffect(() => {
        fetchDrivers();
        fetchUsers();
    }, []);

    const fetchDrivers = async () => {
        const { data, error } = await supabase
            .from('drivers')
            .select('*');
        if (error) console.error('Error fetching drivers:', error);
        else setDrivers(data || []);
    };

    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from('users')
            .select('*');
        if (error) console.error('Error fetching users:', error);
        else setUsers(data || []);
    };

    const handleAddDriver = async (e:any) => {
        e.preventDefault();
        const { data, error } = await supabase
            .from('drivers')
            .insert([
                {
                    user_id: newDriver.userId,
                    car: newDriver.car,
                    phone_number: newDriver.phoneNumber
                }
            ]);
        if (error) console.error('Error adding driver:', error);
        else {
            setDrivers([...drivers, data![0]]);
            setNewDriver({
                userId: '',
                car: '',
                phoneNumber: ''
            });
        }
    };

    return (
        <div>
            <h1>Drivers</h1>
            <ul>
                {drivers.map(driver => (
                    <li key={driver.id}>
                        User ID: {driver.user_id}, Car: {driver.car}, Phone Number: {driver.phone_number}
                    </li>
                ))}
            </ul>
            <h2>Add New Driver</h2>
            <form onSubmit={handleAddDriver}>
                <select
                    value={newDriver.userId}
                    onChange={(e) => setNewDriver({ ...newDriver, userId: e.target.value })}
                >
                    <option value="">Select User</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.name} {/* Assuming 'name' is a field in your users table */}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Car"
                    value={newDriver.car}
                    onChange={(e) => setNewDriver({ ...newDriver, car: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Phone Number"
                    value={newDriver.phoneNumber}
                    onChange={(e) => setNewDriver({ ...newDriver, phoneNumber: e.target.value })}
                />
                <button type="submit">Add Driver</button>
            </form>
        </div>
    );
};

export default DriversPage;
