// src/components/ThreeScene.tsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three-stdlib';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useData } from '../context/DataContext';

const ThreeScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const objRef = useRef<THREE.Object3D | null>(null);
  const objGeoRef = useRef<THREE.BufferGeometry | null>(null);
  const cubeRef = useRef<THREE.Mesh | null>(null);
  const objScaleRef = useRef<number>(1);
  const shouldRotateRef = useRef<boolean>(true);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data } = useData();
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const LoadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const contents = event.target?.result;
      if (typeof contents === 'string') {
        const loader = new OBJLoader();
        const object = loader.parse(contents);

        if (sceneRef.current && objRef.current) {
          sceneRef.current.remove(objRef.current);
        }

        const bbox = new THREE.Box3().setFromObject(object);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1 / maxDim;

        object.scale.set(scale, scale, scale);
        objScaleRef.current = scale;

        object.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            (child as THREE.Mesh).material = new THREE.MeshPhongMaterial({ color: dataRef.current.color });
          }
        });

        const mesh = object.children[0] as THREE.Mesh;
        const bufferGeo = mesh.geometry as THREE.BufferGeometry;
        bufferGeo.center();

        objRef.current = object;
        objGeoRef.current = bufferGeo;

        sceneRef.current?.add(object);
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(3, 4, 5);
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls(camera, document.getElementById('root')!);
    controls.update();

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;

    mountRef.current?.appendChild(renderer.domElement);

    const gridHelper = new THREE.GridHelper(10, 20, 0xffffff);
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: dataRef.current.color });
    const cube = new THREE.Mesh(geometry, material);
    cube.rotation.set(0, 0, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;

    cubeRef.current = cube;
    objRef.current = cube;
    objGeoRef.current = geometry;
    objScaleRef.current = 1;

    scene.add(cube);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(10, 0, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const handleKeyDown = (event: KeyboardEvent) => {
      const currentGeo = objGeoRef.current;
      if (!currentGeo) return;

      switch (event.key) {
        case 'f':
          if (objRef.current) scene.remove(objRef.current);
          objRef.current = new THREE.Mesh(currentGeo, new THREE.MeshPhongMaterial({ color: dataRef.current.color }));
          break;

        case 'e':
          if (objRef.current) scene.remove(objRef.current);
          const edges = new THREE.EdgesGeometry(currentGeo);
          objRef.current = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: dataRef.current.color }));
          break;

        case 'v':
          if (objRef.current) scene.remove(objRef.current);
          objRef.current = new THREE.Points(currentGeo, new THREE.PointsMaterial({ size: 1, sizeAttenuation: false }));
          break;

        case 'l':
          const loader = new OBJLoader();
          loader.load(
            '/bunny-5000.obj',
            (object) => {
              if (objRef.current) scene.remove(objRef.current);
              const bbox = new THREE.Box3().setFromObject(object);
              const size = new THREE.Vector3();
              bbox.getSize(size);
              const maxDim = Math.max(size.x, size.y, size.z);
              const scale = 1 / maxDim;

              object.scale.set(scale, scale, scale);
              objScaleRef.current = scale;

              object.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                  (child as THREE.Mesh).material = new THREE.MeshPhongMaterial({ color: dataRef.current.color });
                }
              });

              const mesh = object.children[0] as THREE.Mesh;
              const bufferGeo = mesh.geometry as THREE.BufferGeometry;
              bufferGeo.center();

              objRef.current = object;
              objGeoRef.current = bufferGeo;
              scene.add(object);
            },
            undefined,
            (err) => console.error(err)
          );
          break;

        case 'u':
          if (objRef.current) scene.remove(objRef.current);
          objRef.current = cubeRef.current!;
          objGeoRef.current = cubeRef.current!.geometry;
          objRef.current.rotation.set(0, 0, 0);
          objScaleRef.current = 1;
          scene.add(objRef.current);
          break;

        case ' ':
          shouldRotateRef.current = !shouldRotateRef.current;
          break;
      }

      if (objRef.current) {
        objRef.current.scale.set(objScaleRef.current, objScaleRef.current, objScaleRef.current);
        scene.add(objRef.current);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    const animate = () => {
      requestAnimationFrame(animate);

      if (shouldRotateRef.current && objRef.current) {
        objRef.current.rotation.x += dataRef.current.xspeed / 360;
        objRef.current.rotation.y += dataRef.current.yspeed / 360;
        objRef.current.rotation.z += dataRef.current.zspeed / 360;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div>
      <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />

      <input
  type="file"
  id="LoadFile" // 🔥 this is what the GUI button tries to trigger
  accept=".obj"
  ref={fileInputRef}
  style={{ display: 'none' }}
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) {
      LoadFile(file);
    }
  }}
/>
    </div>
  );
};

export default ThreeScene;
