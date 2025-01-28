import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <p>Welcome to the Dashboard!</p>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white p-2 rounded mt-4"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
