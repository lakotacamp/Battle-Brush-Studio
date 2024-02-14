import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Stage, OrbitControls } from "@react-three/drei";
import { Canvas } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Button } from "../styles";
import { useNavigate, useParams } from 'react-router-dom';
import { ChromePicker } from 'react-color';

const EditModel = () => {
  const [materialColors, setMaterialColors] = useState({});
  const meshRefs = useRef({});
  const navigate = useNavigate();
  const { modelId } = useParams();
  const [gltf, setGltf] = useState(null);
  const [modelData, setModelData] = useState(null);

  const getModelData = async () => {
    try {
      const response = await fetch(`/api/models/${modelId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch model data');
      }
      const modelData = await response.json();
      const gltfFilePath = modelData.filepath;
  
      const gltfData = await new Promise((resolve, reject) => {
        new GLTFLoader().load(gltfFilePath, resolve, undefined, reject);
      });
      setGltf(gltfData);
      setModelData(modelData);
      extractModelMeshes(gltfData);
      applyPaintedColors(modelData.painted_models, gltfData); // Pass gltfData to applyPaintedColors
    } catch (error) {
      console.error('Error fetching model data:', error);
    }
  };

  const extractModelMeshes = (gltfData) => {
    if (!gltfData) return;
    const meshes = [];
    gltfData.scene.traverse((child) => {
      if (child.isMesh) {
        meshes.push({
          name: child.name,
          material: child.material.name // Change to 'material'
        });
      }
    });
    setModelData(prevData => ({
      ...prevData,
      modelMeshes: meshes
    }));
  };

  const extractMaterialsAndHexcodes = (paintedModels) => {
    const materialsWithHexcodes = {};
    paintedModels.forEach((paintedModel) => {
      const materialName = paintedModel.color.material;
      const hexcode = paintedModel.color.hexcode;
      materialsWithHexcodes[materialName] = hexcode;
    });
    return materialsWithHexcodes;
  };

  const applyPaintedColors = (paintedModels, gltfData) => { // Pass gltfData to applyPaintedColors
    if (!gltfData) return;
    const colors = {};
  
    paintedModels.forEach((paintedModel) => {
      const material = paintedModel.color.material; // Change to 'material'
      const hexcode = paintedModel.color.hexcode;
  
      gltfData.scene.traverse((child) => {
        if (child.isMesh && child.material.name === material) { // Change to 'material'
          child.material.color.set(hexcode);
          colors[material] = hexcode; // Change to 'material'
        }
      });
    });
  
    setMaterialColors((prevColors) => ({
      ...prevColors,
      ...colors,
    }));
  
    setModelData((prevData) => ({
      ...prevData,
      modelColors: {
        ...prevData.modelColors,
        ...colors,
      },
    }));
  };

  const saveChanges = async () => {
    try {
      const requestBody = {
        modelId: modelId,
        painted_models: Object.entries(materialColors).map(([material, hexcode]) => ({
          model: { name: material },
          color: { hexcode: hexcode, material: material }
        }))
      };
  
      console.log("Request Body:", requestBody); // Log the data being sent in the PATCH request
  
      const response = await fetch(`/api/save-model/${modelId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
  
      if (!response.ok) {
        throw new Error(`Failed to save changes: ${response.status} ${response.statusText}`);
      }
  
      console.log('Changes saved successfully');
      navigate('/main-page');
    } catch (error) {
      console.error('Error saving changes:', error.message);
      alert(`Error saving changes: ${error.message}`); // Show an alert with the error message
    }
  };  
  
  useEffect(() => {
    getModelData();
  }, [modelId]);

  useEffect(() => {
    if (gltf) {
      gltf.scene.traverse((child) => {
        if (child.isMesh && child.material.name) {
          meshRefs.current[child.material.name] = child;
        }
      });
    }
  }, [gltf]);

  const handleColorChange = (material, color) => { // Change to 'material'
    setMaterialColors((prevColors) => ({
      ...prevColors,
      [material]: color.hex, // Change to 'material'
    }));

    if (meshRefs.current[material]) { // Change to 'material'
      meshRefs.current[material].material.color.set(color.hex); // Change to 'material'
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
      <Button onClick={() => navigate('/main-page')}>Go Back</Button>
      <Canvas style={{ width: '600px', height: '600px' }}>
        <Stage environment={"city"} intensity={1} contactShadow={false} shadowBias={-0.0015}>
          <Suspense fallback={null}>
            {gltf && <primitive object={gltf.scene} />}
          </Suspense>
        </Stage>
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
      <div style={{ overflowY: 'auto', maxHeight: '200px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {modelData && modelData.modelMeshes.map(mesh => (
          <div key={mesh.name}>
            <label htmlFor={mesh.name}>{mesh.name}:</label>
            <span>{mesh.material}</span> {/* Change to 'material' */}
            {materialColors[mesh.material] && ( // Change to 'material'
              <ChromePicker
                color={materialColors[mesh.material]} // Change to 'material'
                onChange={(color) => handleColorChange(mesh.material, color)} // Change to 'material'
              />
            )}
          </div>
        ))}
      </div>
      <Button onClick={saveChanges}>Save Changes</Button> {/* Add Save button */}
    </div>
  );
};

export default EditModel;




//____________________________________________________________________________________________________________________________________________________________________________________________________________
// This is properly fetching all the data and returning the model with the saved colors applied to it

// import React, { Suspense, useState, useRef, useEffect } from 'react';
// import { Stage, OrbitControls } from "@react-three/drei";
// import { Canvas } from '@react-three/fiber';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { Button } from "../styles";
// import { useNavigate, useParams } from 'react-router-dom';
// import { ChromePicker } from 'react-color'; // Import ChromePicker for color selection

// const EditModel = () => {
//   const [materialColors, setMaterialColors] = useState({});
//   const meshRefs = useRef({});
//   const navigate = useNavigate();
//   const { modelId } = useParams();
//   const [gltf, setGltf] = useState(null);
//   const [modelData, setModelData] = useState(null);

//   const getModelData = async () => {
//     try {
//       const response = await fetch(`/api/models/${modelId}`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch model data');
//       }
//       const modelData = await response.json();
//       const gltfFilePath = modelData.filepath;
  
//       const gltfData = await new Promise((resolve, reject) => {
//         new GLTFLoader().load(gltfFilePath, resolve, undefined, reject);
//       });
//       setGltf(gltfData);
//       setModelData(modelData);
//       extractModelMeshes(gltfData);
//       applyPaintedColors(modelData.painted_models, gltfData); // Pass gltfData to applyPaintedColors
//     } catch (error) {
//       console.error('Error fetching model data:', error);
//     }
//   };

//   const extractModelMeshes = (gltfData) => {
//     if (!gltfData) return;
//     const meshes = [];
//     gltfData.scene.traverse((child) => {
//       if (child.isMesh) {
//         meshes.push({
//           name: child.name,
//           materialName: child.material.name
//         });
//       }
//     });
//     setModelData(prevData => ({
//       ...prevData,
//       modelMeshes: meshes
//     }));
//   };

//   const extractMaterialsAndHexcodes = (paintedModels) => {
//     const materialsWithHexcodes = {};
//     paintedModels.forEach((paintedModel) => {
//       const materialName = paintedModel.color.material;
//       const hexcode = paintedModel.color.hexcode;
//       materialsWithHexcodes[materialName] = hexcode;
//     });
//     return materialsWithHexcodes;
//   };

//   const applyPaintedColors = (paintedModels, gltfData) => { // Pass gltfData to applyPaintedColors
//     if (!gltfData) return;
//     const colors = {};
  
//     paintedModels.forEach((paintedModel) => {
//       const materialName = paintedModel.color.material;
//       const hexcode = paintedModel.color.hexcode;
  
//       gltfData.scene.traverse((child) => {
//         if (child.isMesh && child.material.name === materialName) {
//           child.material.color.set(hexcode);
//           colors[materialName] = hexcode;
//         }
//       });
//     });
  
//     setMaterialColors((prevColors) => ({
//       ...prevColors,
//       ...colors,
//     }));
  
//     setModelData((prevData) => ({
//       ...prevData,
//       modelColors: {
//         ...prevData.modelColors,
//         ...colors,
//       },
//     }));
//   };

//   useEffect(() => {
//     getModelData();
//   }, [modelId]);

//   useEffect(() => {
//     if (gltf) {
//       gltf.scene.traverse((child) => {
//         if (child.isMesh && child.material.name) {
//           meshRefs.current[child.material.name] = child;
//         }
//       });
//     }
//   }, [gltf]);

//   const handleColorChange = (materialName, color) => {
//     setMaterialColors((prevColors) => ({
//       ...prevColors,
//       [materialName]: color.hex,
//     }));

//     if (meshRefs.current[materialName]) {
//       meshRefs.current[materialName].material.color.set(color.hex);
//     }
//   };

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
//       <Button onClick={() => navigate('/main-page')}>Go Back</Button>
//       <Canvas style={{ width: '600px', height: '600px' }}>
//         <Stage environment={"city"} intensity={1} contactShadow={false} shadowBias={-0.0015}>
//           <Suspense fallback={null}>
//             {gltf && <primitive object={gltf.scene} />}
//           </Suspense>
//         </Stage>
//         <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
//       </Canvas>
//       <div style={{ overflowY: 'auto', maxHeight: '200px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
//         {modelData && modelData.modelMeshes.map(mesh => (
//           <div key={mesh.name}>
//             <label htmlFor={mesh.name}>{mesh.name}:</label>
//             <span>{mesh.materialName}</span>
//             {materialColors[mesh.materialName] && (
//               <ChromePicker
//                 color={materialColors[mesh.materialName]}
//                 onChange={(color) => handleColorChange(mesh.materialName, color)}
//               />
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default EditModel;

//____________________________________________________________________________________________________________________________________________________________________________________________________________

// import React, { Suspense, useState, useRef, useEffect } from 'react';
// import { Stage, OrbitControls } from "@react-three/drei";
// import { Canvas } from '@react-three/fiber';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { Button } from "../styles";
// import { useNavigate, useParams } from 'react-router-dom';

// const EditModel = () => {
//   const [materialColors, setMaterialColors] = useState({});
//   const meshRefs = useRef({});
//   const navigate = useNavigate();
//   const { modelId } = useParams();
//   const [gltf, setGltf] = useState(null);
//   const [modelData, setModelData] = useState(null);

//   const getModelData = async () => {
//     try {
//       const response = await fetch(`/api/models/${modelId}`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch model data');
//       }
//       const modelData = await response.json();
//       const gltfFilePath = modelData.filepath;
//       console.log("GLTF File Path:", gltfFilePath);
//       console.log("modelData:", modelData);
  
//       const gltfData = await new Promise((resolve, reject) => {
//         new GLTFLoader().load(gltfFilePath, resolve, undefined, reject);
//       });
//       setGltf(gltfData);
//       setModelData(modelData);
//       extractModelMeshes(gltfData);
//       applyPaintedColors(modelData.painted_models); // Apply colors to the model
//     } catch (error) {
//       console.error('Error fetching model data:', error);
//     }
//   };

//   const extractModelMeshes = (gltfData) => {
//     if (!gltfData) return;
//     const meshes = [];
//     gltfData.scene.traverse((child) => {
//       if (child.isMesh) {
//         meshes.push({
//           name: child.name,
//           materialName: child.material.name
//         });
//       }
//     });
//     setModelData(prevData => ({
//       ...prevData,
//       modelMeshes: meshes
//     }));
//   };

//   const applyPaintedColors = (paintedModels) => {
//     if (!gltf) return;
//     const colors = {};
//     paintedModels.forEach((paintedModel) => {
//       const mesh = gltf.scene.getObjectByName(paintedModel.model.name);
//       if (mesh && mesh.material) {
//         mesh.material.color.set(paintedModel.color.hexcode);
//         colors[paintedModel.model.name] = paintedModel.color.hexcode;
//         setMaterialColors((prevColors) => ({
//           ...prevColors,
//           [paintedModel.model.name]: paintedModel.color.hexcode,
//         }));
//       }
//     });
//     setModelData(prevData => ({
//       ...prevData,
//       modelColors: colors
//     }));
//   };

//   useEffect(() => {
//     getModelData();
//   }, [modelId]);

//   useEffect(() => {
//     if (gltf) {
//       gltf.scene.traverse((child) => {
//         if (child.isMesh && child.material.name) {
//           meshRefs.current[child.material.name] = child;
//         }
//       });
//     }
//   }, [gltf]);

//   const handleColorChange = (materialName, color) => {
//     setMaterialColors((prevColors) => ({
//       ...prevColors,
//       [materialName]: color,
//     }));

//     if (meshRefs.current[materialName]) {
//       meshRefs.current[materialName].material.color.set(color);
//     }
//   };

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
//       <Button onClick={() => navigate('/main-page')}>Go Back</Button>
//       <Canvas style={{ width: '600px', height: '600px' }}>
//         <Stage environment={"city"} intensity={1} contactShadow={false} shadowBias={-0.0015}>
//           <Suspense fallback={null}>
//             {gltf && <primitive object={gltf.scene} />}
//           </Suspense>
//         </Stage>
//         <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
//       </Canvas>
//       <div style={{ overflowY: 'auto', maxHeight: '200px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
//         {modelData && modelData.modelMeshes.map(mesh => (
//           <div key={mesh.name}>
//             <label htmlFor={mesh.name}>{mesh.name}:</label>
//             <span>{mesh.materialName}</span>
//             {modelData.modelColors && modelData.modelColors[mesh.name] && (
//               <span>Color: {modelData.modelColors[mesh.name]}</span>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default EditModel;





//________________________________________________________________________________________________________________________________________________________________________________________________________
// This is the code that at least returns a model on the edit page with the new backend

// import React, { Suspense, useState, useRef, useEffect } from 'react';
// import { Stage, OrbitControls } from "@react-three/drei";
// import { Canvas } from '@react-three/fiber';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { Button } from "../styles";
// import { useNavigate, useParams } from 'react-router-dom';

// const EditModel = () => {
//   const [materialColors, setMaterialColors] = useState({});
//   const meshRefs = useRef({});
//   const navigate = useNavigate();
//   const { modelId } = useParams();
//   const [gltf, setGltf] = useState(null);

//   const getModelData = async () => {
//     try {
//       const response = await fetch(`/api/models/${modelId}`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch model data');
//       }
//       const modelData = await response.json();
//       const gltfFilePath = modelData.filepath;
//       console.log("GLTF File Path:", gltfFilePath);
//       console.log("modelData:", modelData);
  
//       const gltfData = await new Promise((resolve, reject) => {
//         new GLTFLoader().load(gltfFilePath, resolve, undefined, reject);
//       });
//       setGltf(gltfData);
//       applyPaintedColors(modelData.painted_models); // Apply colors to the model
//     } catch (error) {
//       console.error('Error fetching model data:', error);
//     }
//   };

//   const applyPaintedColors = (paintedModels) => {
//     if (!gltf) return;
//     paintedModels.forEach((paintedModel) => {
//       const mesh = gltf.scene.getObjectByName(paintedModel.model.name);
//       if (mesh && mesh.material) {
//         mesh.material.color.set(paintedModel.color.hexcode);
//         setMaterialColors((prevColors) => ({
//           ...prevColors,
//           [paintedModel.model.name]: paintedModel.color.hexcode,
//         }));
//       }
//     });
//   };

//   useEffect(() => {
//     getModelData();
//   }, [modelId]);

//   useEffect(() => {
//     if (gltf) {
//       gltf.scene.traverse((child) => {
//         if (child.isMesh && child.material.name) {
//           meshRefs.current[child.material.name] = child;
//         }
//       });
//     }
//   }, [gltf]);

//   const handleColorChange = (materialName, color) => {
//     setMaterialColors((prevColors) => ({
//       ...prevColors,
//       [materialName]: color,
//     }));

//     if (meshRefs.current[materialName]) {
//       meshRefs.current[materialName].material.color.set(color);
//     }
//   };

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
//       <Button onClick={() => navigate('/main-page')}>Go Back</Button>
//       <Canvas style={{ width: '600px', height: '600px' }}>
//         <Stage environment={"city"} intensity={1} contactShadow={false} shadowBias={-0.0015}>
//           <Suspense fallback={null}>
//             {gltf && <primitive object={gltf.scene} />}
//           </Suspense>
//         </Stage>
//         <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
//       </Canvas>
//       <div style={{ overflowY: 'auto', maxHeight: '200px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
//         {Object.entries(materialColors).map(([materialName, color]) => (
//           <div key={materialName}>
//             <label htmlFor={materialName}>{materialName}:</label>
//             <input
//               id={materialName}
//               type="color"
//               value={color}
//               onChange={(event) => handleColorChange(materialName, event.target.value)}
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default EditModel;
//_____________________________________________________________________________________________________________________________________________________________________________________________________________

// import React, { Suspense, useState, useRef, useEffect } from 'react';
// import { Stage, OrbitControls } from "@react-three/drei";
// import { Canvas } from '@react-three/fiber';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { Button } from "../styles";
// import { useNavigate, useParams } from 'react-router-dom';

// const EditModel = () => {
//   const [materialColors, setMaterialColors] = useState({});
//   const meshRefs = useRef({});
//   const navigate = useNavigate();
//   const { modelId } = useParams();
//   const [gltf, setGltf] = useState(null);

//   const getModelData = async () => {
//     try {
//       const response = await fetch(`/api/models/${modelId}`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch model data');
//       }
//       const modelData = await response.json();
//       const gltfFilePath = `${modelData.name}`;
//       console.log("GLTF File Path:", gltfFilePath);
//       console.log("modelData.name:", modelData.name);
  
//       const gltfData = await new Promise((resolve, reject) => {
//         new GLTFLoader().load(gltfFilePath, resolve, undefined, reject);
//       });
//       setGltf(gltfData);
//       setMaterialColors({});
//     } catch (error) {
//       console.error('Error fetching model data:', error);
//     }
//   };
  
//   useEffect(() => {
//     getModelData();
//   }, [modelId]);

//   useEffect(() => {
//     if (gltf) {
//       gltf.scene.traverse((child) => {
//         if (child.isMesh && child.material.name) {
//           if (!(child.material.name in materialColors)) {
//             setMaterialColors((prevColors) => ({
//               ...prevColors,
//               [child.material.name]: '#ff0000',
//             }));
//           }
//           meshRefs.current[child.material.name] = child;
//         }
//       });
//     }
//   }, [gltf]);

//   const handleColorChange = (materialName, color) => {
//     setMaterialColors((prevColors) => ({
//       ...prevColors,
//       [materialName]: color
//     }));

//     if (meshRefs.current[materialName]) {
//       meshRefs.current[materialName].material.color.set(color);
//     }
//   };

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
//       <Button onClick={() => navigate('/main-page')}>Go Back</Button>
//       <Canvas style={{ width: '600px', height: '600px' }}>
//         <Stage environment={"city"} intensity={1} contactShadow={false} shadowBias={-0.0015}>
//           <Suspense fallback={null}>
//             {gltf && <primitive object={gltf.scene} />}
//           </Suspense>
//         </Stage>
//         <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
//       </Canvas>
//       <div style={{ overflowY: 'auto', maxHeight: '200px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
//         {Object.entries(materialColors).map(([materialName, color]) => (
//           <div key={materialName}>
//             <label htmlFor={materialName}>{materialName}:</label>
//             <input
//               id={materialName}
//               type="color"
//               value={color}
//               onChange={(event) => handleColorChange(materialName, event.target.value)}
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default EditModel;

//__________________________________________________________________________________________________________________________________________________________________________________________________

// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';

// function EditTeams() {
//   const [pokemonList, setPokemonList] = useState([]);
//   const [selectedPokemon, setSelectedPokemon] = useState(null);
//   const [team, setTeam] = useState([]);
//   const [newTeamName, setNewTeamName] = useState('');
//   const navigate = useNavigate();
//   const { teamId } = useParams();
//   const [pokemonSprites, setPokemonSprites] = useState([]);
//   const [hoveredPokemon, setHoveredPokemon] = useState(null);
//   const [pokemonDetails, setPokemonDetails] = useState(null);

//   useEffect(() => {
//     const fetchPokemon = async () => {
//       const promises = [];
//       for (let i = 1; i <= 20; i++) {
//         const url = `https://pokeapi.co/api/v2/pokemon/${i}`;
//         promises.push(fetch(url).then((res) => res.json()));
//       }
//       Promise.all(promises).then((results) => {
//         const pokemon = results.map((result) => ({
//           id: result.id,
//           name: result.name,
//           image: result.sprites['front_default'],
//         }));
//         setPokemonSprites(pokemon);
//       });
//     };
//     fetchPokemon();
//   }, []);
  

//   useEffect(() => {
//     fetch(`/api/teams/${teamId}`)
//       .then((response) => response.json())
//       .then((teamData) => {
//         setNewTeamName(teamData.name);
//         setTeam(teamData.poke_teams.map((pokeTeam) => pokeTeam.pokemon));
//       })
//       .catch((error) => {
//         console.error('Error fetching team details:', error);
//       });

//     fetch("/api/pokemon")
//       .then((response) => response.json())
//       .then((response) => {
//         setPokemonList(response);
//       })
//       .catch((error) => {
//         console.error('Error fetching Pokémon:', error);
//       });
//   }, [teamId]);

//   useEffect(() => {
//     const fetchPokemonDetails = async () => {
//       if (hoveredPokemon) {
//         const url = `https://pokeapi.co/api/v2/pokemon/${hoveredPokemon.id}`;
//         const response = await fetch(url);
//         const data = await response.json();
//         setPokemonDetails({
//           typing: data.types.map(type => type.type.name).join(', '),
//           stats: data.stats.map(stat => `${stat.stat.name}: ${stat.base_stat}`).join(', ')
//         });
//       }
//     };

//     fetchPokemonDetails();
//   }, [hoveredPokemon]);

//   const handlePokemonClick = (pokemon) => {
//     if (team.length < 6 && !team.some(p => p.id === pokemon.id)) {
//       setTeam(prevTeam => [...prevTeam, pokemon]);
//     }
//   };

//   // const handlePokemonClick = (pokemon) => {
//   //   setSelectedPokemon(pokemon);
//   // };

//   // const handleAddToTeam = () => {
//   //   if (selectedPokemon && team.length < 6 && !team.some((p) => p.id === selectedPokemon.id)) {
//   //     setTeam((prevTeam) => [...prevTeam, selectedPokemon]);
//   //     setSelectedPokemon(null);
//   //   }
//   // };

//   const handleRemoveFromTeam = (pokemonId) => {
//     setTeam((prevTeam) => prevTeam.filter((p) => p.id !== pokemonId));
//   };

//   const handleSubmitTeam = (e) => {
//     e.preventDefault();
//     if (newTeamName && team.length > 0 && team.length <= 6) {
//       const data = {
//         team_id: teamId, // Include the team ID in the data payload
//         team_name: newTeamName,
//         pokemon_names: team.map(pokemon => pokemon.name),
//       };
  
//       fetch(`/api/save-team`, {
//         method: "PATCH", // Use PATCH method instead of POST
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(data),
//       })
//         .then(response => {
//           if (response.ok) {
//             setNewTeamName('');
//             setTeam([]);
//             navigate("/main-page");
//           } else {
//             throw new Error('Team update failed');
//           }
//         })
//         .catch(error => console.error('Error updating team:', error));
//     }
//   };

//   const handleMouseOver = (pokemon) => {
//     setHoveredPokemon(pokemon);
//   };

//   const handleMouseOut = () => {
//     setHoveredPokemon(null);
//   };
  
//   return (
//     <div>
//       <h1 style={{ textAlign: 'center' }}>Edit Team Page</h1>
//           <div>
//           <label>
//             Team Name:
//             <input type="text" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} />
//           </label>
//           </div>
//       <div>
//       <ul>
//       <div style={{ display: 'flex', justifyContent: 'center' }}>
//         <div style={{ width: '300px', marginRight: '20px', marginTop: hoveredPokemon ? '0' : '-300px' }}>
//           {hoveredPokemon && (
//             <div>
//               <h2>{hoveredPokemon.name}</h2>
//               <img src={hoveredPokemon.image} alt={hoveredPokemon.name} />
//               {pokemonDetails && (
//                 <div>
//                   <p><strong>Typing:</strong> {pokemonDetails.typing}</p>
//                   <p><strong>Stats:</strong> {pokemonDetails.stats}</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
//           {pokemonSprites.map((pokemon) => (
//             <div
//               key={pokemon.id}
//               style={{
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'center',
//                 cursor: 'pointer',
//                 transform: hoveredPokemon === pokemon ? 'scale(1.2)' : 'scale(1)',
//                 transition: 'transform 0.3s ease',
//               }}
//               onClick={() => handlePokemonClick(pokemon)}
//               onMouseOver={() => handleMouseOver(pokemon)}
//               onMouseOut={handleMouseOut}
//             >
//               <img className="card-image" src={pokemon.image} alt={pokemon.name} style={{ marginBottom: '5px' }} />
//               <div style={{ color: hoveredPokemon === pokemon ? 'pink' : 'white' }}>{pokemon.name}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//       </ul>

//       </div>
//       <div style={{ position: 'relative', left: '-450px', top: '-100px', width: '250px'}}>
//         <h2>Selected Team:</h2>
//         <ul>
//           {team.map(pokemon => (
//             <li key={pokemon.id}>
//               <img src={pokemon.image} alt={pokemon.name} style={{ marginRight: '5px', marginBottom: '-5px', width: '30px', height: '30px' }} />
//               {pokemon.name}
//               <span style={{ marginLeft: '5px', cursor: 'pointer' }} onClick={() => handleRemoveFromTeam(pokemon.id)}>🗑️</span>
//             </li>
//           ))}
//         </ul>
//       </div>
//       <div>
//       <form onSubmit={handleSubmitTeam} style={{ textAlign: 'center' }}>
//           <button type="submit">Save Changes</button>
//         </form>
//       </div>
//       <div style={{ textAlign: 'center' }}>
//         <button onClick={() => navigate("/main-page")}>Back</button>
//       </div>
//     </div>
//   );
// }

// export default EditTeams;