import React from 'react';
import ThreeScene from './components/ThreeScene';
import GUI from './components/GUI';
import { DataProvider } from './context/DataContext';
import LilGUI from './components/GUI';

const App = () => (
  <DataProvider>
    <ThreeScene />
    <LilGUI />
    
  </DataProvider>
);

export default App;
