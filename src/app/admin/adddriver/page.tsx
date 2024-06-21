'use client'
import React, { useState } from 'react';


const AddDriver: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleInvite = async () => {
    try {
      const response = await fetch('/api/invitedriver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="p-0 bg-gray-800 min-h-screen min-w-screen text-gray-200">
  <h1 className="text-3xl font-bold mb-6 text-center">Invite Driver by Email</h1>
  <div className="flex flex-col items-center mt-4 space-y-4">
    <div className="flex flex-col items-start w-full max-w-lg bg-gray-900 p-6 rounded-lg shadow-lg">
      <label htmlFor="email" className="block text-lg font-medium text-gray-400 mb-2">
        Invite Driver by Email
      </label>
      <div className="flex w-full">
        <input
          type="email"
          id="email"
          value={email}
          onChange={handleEmailChange}
          className="flex-grow px-3 py-2 border border-gray-600 bg-gray-800 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Enter email"
        />
        <button
          onClick={handleInvite}
          className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Send Invitation
        </button>
      </div>
    </div>
    {message && (
      <p className={`text-center text-sm ${message === 'Invitation sent successfully!' ? 'text-green-600' : 'text-red-600'}`}>
        {message}
      </p>
    )}
  </div>
</div>

  );
};

export default AddDriver;
