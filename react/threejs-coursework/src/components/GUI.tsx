import React, { useState } from 'react';
import DatGui, { DatBoolean, DatColor, DatNumber } from 'react-dat-gui';
import '../styles/GUI.css'; // use your copied CSS here
import { useData } from '../context/DataContext';

const GUI = () => {
  const { data, setData } = useData();

  return (
    <div>
      <DatGui data={data} onUpdate={setData}>
        <DatNumber path="xspeed" label="X Speed" min={0} max={10} step={0.1} />
        <DatNumber path="yspeed" label="Y Speed" min={0} max={10} step={0.1} />
        <DatNumber path="zspeed" label="Z Speed" min={0} max={10} step={0.1} />
        <DatColor path="color" label="Color" />
        <DatBoolean path="visible" label="Visible" />
      </DatGui>
    </div>
  );
};

export default GUI;