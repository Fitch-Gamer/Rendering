import React from 'react';
import ThreeScene from './components/ThreeScene';
import GUI from './components/GUI';
import { DataProvider } from './context/DataContext';

const App = () => (
  <DataProvider>
    <ThreeScene />
    <GUI />
    
  </DataProvider>
);

export default App;
