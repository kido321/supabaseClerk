'use client';
import React, { useEffect, useState } from 'react';

interface Driver {
  id: number;
  name: string;
  email: string;
}

const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch('/api/drivers');
        if (!response.ok) {
          throw new Error('Failed to fetch drivers');
        }
        const data = await response.json();
        setDrivers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  return (<div className=''>
    <h1 className="text-2xl font-bold mb-6 text-center text-blue-500">Drivers</h1>
    <div className="container mx-auto px-4 py-8 justify-center">

  {loading ? (
    <div className="flex justify-center items-center">
      <p className="text-lg text-gray-600">Loading...</p>
    </div>
  ) : error ? (
    <div className="flex justify-center items-center">
      <p className="text-lg text-red-600">{error}</p>
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Email
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {drivers.map((driver) => (
            <tr key={driver.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>
</div>
  );
};

export default Drivers;
