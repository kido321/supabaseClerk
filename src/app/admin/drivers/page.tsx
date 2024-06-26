"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
// import { useTheme } from "next-themes"

import { Button } from "@/component/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/component/ui/dropdown-menu"
import { useState, useEffect } from 'react';
import { createClerkSupabaseClient } from '../../lib/supabase';
import EditDriverDialog from '../../components/EditDriverDialog'; // Adjust the import according to your setup

interface User {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  email: string | null;
  role: string | null;
  org_id: string | null;
}

const DriversPage: React.FC = () => {
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClerkSupabaseClient();
  // const { setTheme } = useTheme()
  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      console.error('Error fetching drivers:', error);
    } else {
      setDrivers(data as User[]);
    }
    setLoading(false);
  };

  const handleSave = async (userId: string, firstName: string, lastName: string) => {
    const { data, error } = await supabase
      .from('users')
      .update({ first_name: firstName, last_name: lastName })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating driver:', error);
    } else {
      setDrivers(drivers.map(driver =>
        driver.user_id === userId ? { ...driver, first_name: firstName, last_name: lastName } : driver
      ));
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchDrivers();
    }, 400);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-200">Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-800 min-h-screen text-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-center">Drivers</h1>
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <ul className="divide-y divide-gray-700">
          {drivers.map(driver => (
            <li key={driver.user_id} className="py-4 flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">{driver.first_name} {driver.last_name}</p>
                <p className="text-gray-400">{driver.email}</p>
                <p className="text-gray-400">{driver.phone_number}</p>
              </div>
              <EditDriverDialog driver={driver} onSave={handleSave} />
            </li>
          ))}
        </ul>
      </div>
      {/* <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu> */}
    </div>
  );
};

export default DriversPage;
