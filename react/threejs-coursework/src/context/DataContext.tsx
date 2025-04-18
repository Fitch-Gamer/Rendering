import React, { createContext, useContext, useState } from 'react';

type GUIData = {
  xspeed: number;
  yspeed: number;
  zspeed: number;

  xpos: number;
  ypos: number;
  zpos: number;

  color: string;
};

type DataContextType = {
  data: GUIData;
  setData: React.Dispatch<React.SetStateAction<GUIData>>;
};

const defaultData: GUIData = {
  xspeed: 0,
  yspeed: 0,
  zspeed: 0,
  xpos:0,
  ypos:0,
  zpos:0,
  color: '#00ffcc',
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
