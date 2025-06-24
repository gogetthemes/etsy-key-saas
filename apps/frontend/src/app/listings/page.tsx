"use client";
import { useState } from "react";
import { List, AlertCircle } from 'lucide-react';

export default function ListingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [listings, setListings] = useState<any[]>([]); // Placeholder for actual listings
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnectStore = (e: React.FormEvent) => {
    e.preventDefault();
    setError("Feature not implemented yet. This is where the Etsy OAuth flow would begin.");
    // In a real implementation:
    // 1. Redirect user to Etsy's OAuth consent screen.
    // 2. Handle the callback from Etsy to get an access token.
    // 3. Save the token and fetch listings.
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Listings</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-2 flex items-center">
          <List className="mr-2" />
          Connect Your Etsy Store
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          To import and track your listings, you need to connect your Etsy store. 
          We use a secure OAuth 2.0 connection and never store your password.
        </p>

        {error && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
            <div className="flex">
              <div className="py-1"><AlertCircle className="h-5 w-5 text-yellow-500 mr-3" /></div>
              <div>
                <p className="font-bold">Work in Progress</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleConnectStore}>
          {/* This is a simplified representation. Real OAuth doesn't usually require manual key entry here. */}
           <button 
             type="submit"
             className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors"
           >
             Connect with Etsy
           </button>
        </form>
      </div>

       <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Imported Listings</h2>
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Listing cards will be rendered here */}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">You have no listings imported yet.</p>
            <p className="text-sm text-gray-400 mt-1">Connect your store to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
