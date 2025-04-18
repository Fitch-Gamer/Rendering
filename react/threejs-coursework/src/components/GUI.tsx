import React, { useEffect, useRef } from 'react';
import GUI from 'lil-gui';
import { useData } from '../context/DataContext';

const LilGUI = () => {
  const { data, setData } = useData();

  useEffect(() => {
      const gui = new GUI();

      let tmp = gui.addFolder("Cube");

      // Explicitly type the `value` parameter based on the expected type
      tmp.add(data, 'xspeed', -10, 10, 0.1)
        .name('X Speed')
        .onChange((value: number) => setData(prev => ({ ...prev, xspeed: value })));

      tmp.add(data, 'yspeed', -10, 10, 0.1)
        .name('Y Speed')
        .onChange((value: number) => setData(prev => ({ ...prev, yspeed: value })));

      tmp.add(data, 'zspeed', -10, 10, 0.1)
        .name('Z Speed')
        .onChange((value: number) => setData(prev => ({ ...prev, zspeed: value })));



      tmp.add(data, 'xpos', -10, 10, 0.1)
        .name('X Position')
        .onChange((value: number) => setData(prev => ({ ...prev, xpos: value })));

      tmp.add(data, 'ypos', -10, 10, 0.1)
        .name('Y Position')
        .onChange((value: number) => setData(prev => ({ ...prev, ypos: value })));

      tmp.add(data, 'zpos', -10, 10, 0.1)
        .name('Z Position')
        .onChange((value: number) => setData(prev => ({ ...prev, zpos: value })));



      tmp.addColor(data, 'color')
        .name('Color')
        .onChange((value: string) => setData(prev => ({ ...prev, color: value })));

      
        const actions = {
          loadModel: () => {
            document.getElementById("LoadFile")?.click();
          },
        };
      
        gui.add(actions, 'loadModel').name('Load Object');

      return () => {
        gui.destroy();
      };
  }, []);

  

  return (
    <div id="gui-container" style={{zIndex:9999}}/>

  );
};

export default LilGUI;
