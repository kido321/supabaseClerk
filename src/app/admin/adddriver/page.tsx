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
    <div className="flex flex-col items-center mt-4 space-y-4">
  <div className="flex flex-col items-start w-full max-w-lg">
    <label htmlFor="email" className="block text-lg font-medium text-blue-600 mb-2">
      Invite Driver by Email
    </label>
    <div className="flex w-full">
      <input
        type="email"
        id="email"
        value={email}
        onChange={handleEmailChange}
        className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder="Enter email"
      />
      <button
        onClick={handleInvite}
        className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Send Invitation
      </button>
    </div>
  </div>
  {message && <p className="text-center text-sm text-red-600">{message}</p>}
</div>
  );
};

export default AddDriver;