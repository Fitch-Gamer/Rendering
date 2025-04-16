import React, { useEffect, useRef } from 'react';
import GUI from 'lil-gui';
import { useData } from '../context/DataContext';

const LilGUI = () => {
  const { data, setData } = useData();

  useEffect(() => {
      const gui = new GUI();

      // Explicitly type the `value` parameter based on the expected type
      gui.add(data, 'xspeed', 0, 10, 0.1)
        .name('X Speed')
        .onChange((value: number) => setData(prev => ({ ...prev, xspeed: value })));

      gui.add(data, 'yspeed', 0, 10, 0.1)
        .name('Y Speed')
        .onChange((value: number) => setData(prev => ({ ...prev, yspeed: value })));

      gui.add(data, 'zspeed', 0, 10, 0.1)
        .name('Z Speed')
        .onChange((value: number) => setData(prev => ({ ...prev, zspeed: value })));

      gui.addColor(data, 'color')
        .name('Color')
        .onChange((value: string) => setData(prev => ({ ...prev, color: value })));

      
        const actions = {
          loadModel: () => {
            document.getElementById("LoadFile")?.click();
          },
        };
      
        gui.add(actions, 'loadModel').name('Load Bunny');

      return () => {
        gui.destroy();
      };
  }, []);

  

  return (
    <div id="gui-container" style={{zIndex:9999}}/>

  );
};

export default LilGUI;
