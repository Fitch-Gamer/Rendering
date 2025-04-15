import React, { createContext, useContext, useState } from 'react';

type GUIData = {
  xspeed: number;
  yspeed: number;
  zspeed: number;
  color: string;
  visible: boolean;
};

type DataContextType = {
  data: GUIData;
  setData: React.Dispatch<React.SetStateAction<GUIData>>;
};

const defaultData: GUIData = {
  xspeed: 1,
  yspeed: 1,
  zspeed: 1,
  color: '#00ffcc',
  visible: true,
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<GUIData>(defaultData);

  return (
    <DataContext.Provider value={{ data, setData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
