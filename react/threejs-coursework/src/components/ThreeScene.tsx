// src/components/ThreeScene.tsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three-stdlib';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useData } from '../context/DataContext';
import { FBXLoader } from 'three-stdlib';

const ThreeScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const objRef = useRef<THREE.Object3D | null>(null);
  const objGeoRef = useRef<THREE.BufferGeometry | null>(null);
  const cubeRef = useRef<THREE.Mesh | null>(null);
  const objScaleRef = useRef<number>(1);
  const shouldRotateRef = useRef<boolean>(true);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);


  const ObjectsRef = useRef<THREE.Object3D[] | null>(null);








  const mixersRef = useRef<THREE.AnimationMixer[]>([]);

  const { data } = useData();
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);



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
          Faces();
          break;

        case 'e':
          Edges();
          break;
          

        case 'v':
          Verticies();
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
              object.position.set(dataRef.current.xpos,dataRef.current.ypos,dataRef.current.zpos)
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
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
    
      const delta = clock.getDelta();
      mixersRef?.current.forEach((element: { update: (arg0: number) => any; }) => element.update(delta));
    
      if (objRef.current) {

        objRef.current.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), dataRef.current.xspeed * delta);
        objRef.current.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), dataRef.current.yspeed * delta);
        objRef.current.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), dataRef.current.zspeed * delta);

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

  useEffect(() => {
    if (objRef.current) {
      objRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh || (child as THREE.LineSegments).isLineSegments || (child as THREE.Points).isPoints) {
          const material = (child as THREE.Mesh).material as THREE.Material | THREE.Material[];
  
          // Handle multi-material objects
          const materials = Array.isArray(material) ? material : [material];
  
          materials.forEach((mat) => {
            if ('color' in mat) {
              (mat as THREE.Material & { color: THREE.Color }).color.set(data.color);
            }
          });
        }
      });
    }
  }, [data.color]);

  useEffect(()=>{
    if(objRef.current) objRef.current.position.set(data.xpos,data.ypos,data.zpos);
  },[data.xpos,data.ypos,data.zpos])

  const Faces = () => {
    if (objRef.current && sceneRef.current) sceneRef.current.remove(objRef.current);
    if(objGeoRef.current) objRef.current = new THREE.Mesh(objGeoRef.current, new THREE.MeshPhongMaterial({ color: dataRef.current.color }))
      if(objRef.current) objRef.current.position.set(data.xpos,data.ypos,data.zpos);
  }

  const Edges = () => {
    if (objRef.current && sceneRef.current) sceneRef.current.remove(objRef.current);
          const edges = new THREE.EdgesGeometry(objGeoRef.current);
          objRef.current = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: dataRef.current.color }));
          if(objRef.current) objRef.current.position.set(data.xpos,data.ypos,data.zpos);
  }

  const Verticies = () => {
    if (objRef.current && sceneRef.current) sceneRef.current.remove(objRef.current);
    if(objGeoRef.current)objRef.current = new THREE.Points(objGeoRef.current, new THREE.PointsMaterial({ size: 1, sizeAttenuation: false }));
    if(objRef.current) objRef.current.position.set(data.xpos,data.ypos,data.zpos);
  }

  const LoadFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const reader = new FileReader();
  
    reader.onload = () => {
      if (!reader.result) return;
  
      if (ext === 'obj') {
        const objLoader = new OBJLoader();
        const content = reader.result as string;
        const object = objLoader.parse(content);
        if(sceneRef.current) setupObject(object, sceneRef.current, data);
      } else if (ext === 'fbx') {
        const fbxLoader = new FBXLoader();
  
        const arrayBuffer = reader.result as ArrayBuffer;
        const object = fbxLoader.parse(arrayBuffer, '');
  
        //if (objRef.current && sceneRef.current) sceneRef.current.remove(objRef.current);
  
        // Animation setup
        if (object.animations && object.animations.length > 0) {
          mixersRef?.current.push(new THREE.AnimationMixer(object));
          object.animations.forEach((clip: THREE.AnimationClip) => {
            if(mixersRef.current) mixersRef.current[mixersRef.current.length -1]!.clipAction(clip).play();
          });
        }
  
        if(sceneRef.current) setupObject(object, sceneRef.current, data);
      } else {
        alert('Unsupported file type: ' + ext);
      }
    };
  
    if (ext === 'obj') {
      reader.readAsText(file);
    } else if (ext === 'fbx') {
      reader.readAsArrayBuffer(file);
    } else {
      alert('Unsupported file type');
    }
  };

  const setupObject = (object: THREE.Object3D, scene: THREE.Scene, data: any) => {
    //if (objRef.current) scene.remove(objRef.current);
  
    const bbox = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1 / maxDim;
  
    object.scale.set(scale, scale, scale);
    objScaleRef.current = scale;
  
    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = new THREE.MeshPhongMaterial({ color: data.color });
      }
    });
  
    const mesh = object.children.find((c): c is THREE.Mesh => (c as THREE.Mesh).isMesh);
    if (mesh) objGeoRef.current = mesh.geometry as THREE.BufferGeometry;
  
    ObjectsRef.current?.push(object); 
    scene.add(object);
  };
  

  return (
    <div>
      <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />

      <input
  type="file"
  id="LoadFile" // 🔥 this is what the GUI button tries to trigger
  accept=".obj,.fbx"
  ref={fileInputRef}
  style={{ display: 'none' }}
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) {
      LoadFile(file);
      e.target.value = '';
    }
  }}
/>
    </div>
  );
};

export default ThreeScene;
