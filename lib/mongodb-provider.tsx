'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import dbConnect from './db';

interface MongoDBContextType {
  isConnected: boolean;
  error: Error | null;
}

const MongoDBContext = createContext<MongoDBContextType>({
  isConnected: false,
  error: null,
});

export const useMongoDBContext = () => useContext(MongoDBContext);

interface MongoDBProviderProps {
  children: ReactNode;
}

export function MongoDBProvider({ children }: MongoDBProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const connectDB = async () => {
      try {
        await dbConnect();
        setIsConnected(true);
      } catch (err) {
        console.error('MongoDB connection error:', err);
        setError(err as Error);
      }
    };

    connectDB();
  }, []);

  return (
    <MongoDBContext.Provider value={{ isConnected, error }}>
      {children}
    </MongoDBContext.Provider>
  );
}
