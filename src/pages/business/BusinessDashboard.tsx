import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export function BusinessDashboard() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Zakelijke Dashboard</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Welkom bij uw zakelijke account</h2>
        <p className="text-gray-600 mb-4">
          Dit is uw zakelijke dashboard waar u uw vastgoedportefeuille kunt beheren.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <h3 className="font-medium text-blue-800 mb-2">Account informatie</h3>
          <p className="text-blue-700">E-mail: {user?.email}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">Mijn Woningen</h3>
          <p className="text-gray-600 mb-4">Bekijk en beheer uw vastgoedportefeuille.</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
            Bekijk Woningen
          </button>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">Nieuwe Woning Toevoegen</h3>
          <p className="text-gray-600 mb-4">Voeg nieuwe woningen toe aan uw zakelijke portefeuille.</p>
          <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">
            Woning Toevoegen
          </button>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">Afspraken</h3>
          <p className="text-gray-600 mb-4">Bekijk en beheer uw bezichtigingsafspraken.</p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded">
            Afspraken Bekijken
          </button>
        </div>
      </div>
    </div>
  );
}
