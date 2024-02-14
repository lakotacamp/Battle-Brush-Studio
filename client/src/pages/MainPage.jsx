import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../styles";
import EditModel from "./EditModel"; // Import the EditModel component

function ModelList({ user }) {
  const [models, setModels] = useState([]);

  useEffect(() => {
    if (user) {
        fetchModels(); // Fetch models when user is available
    }
}, [user]); // Run effect when user changes

const fetchModels = () => {
    if (!user) return; // If user is null, exit early

    // Fetch the user's models
    fetch("/api/models")
        .then((response) => response.json())
        .then((data) => {
            // Filter models to only include those belonging to the current user
            const userModels = data.filter((model) => model.user_id === user.id);
            setModels(userModels);
        })
        .catch((error) => console.error("Error fetching models:", error));
};

const deleteModel = (modelId) => {
    fetch(`/api/models/${modelId}`, {
        method: "DELETE",
    })
        .then(() => {
            // After deletion, fetch models again to update the list
            fetchModels();
        })
        .catch((error) => console.error("Error deleting model:", error));
};


  console.log(user?.model);
  console.log(user);

  return (
    <div className="Wrapper">
      <h1 className="Logo">Choose Wisely Mortal...</h1>
      <div>
        {user?.model?.length > 0 ? (
          <ul>
            {models.map((model) => (
              <li key={model.id}>
                <span className="modelName">{model.name}</span>
                <button onClick={() => deleteModel(model.id)} className="login">🗑️</button>
                {/* Log model.id to verify */}
                {console.log("Model ID:", model.id)}
                {/* Pass model.id to the EditModel component */}
                <Button as={Link} to={`/edit-model/${model.id}`}>
                  View
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <h2>No Models Found</h2>
          </>
        )}
        <Button as={Link} to="/create-model">
          Paint a New Model
        </Button>
      </div>
    </div>
  );
}

export default ModelList;

//_________________________________________________________________________________________________________________________________________________________________________________________________
// This Code now returns the new user model but you have to refresh the page which we don't want

// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "../styles";
// import EditModel from "./EditModel"; // Import the EditModel component

// function ModelList({ user }) {
//   const [models, setModels] = useState([]);

//   useEffect(() => {
//     if (user) {
//         fetchModels(); // Fetch models when user is available
//     }
// }, [user]); // Run effect when user changes

// const fetchModels = () => {
//     if (!user) return; // If user is null, exit early

//     // Fetch the user's models
//     fetch("/api/models")
//         .then((response) => response.json())
//         .then((data) => {
//             // Filter models to only include those belonging to the current user
//             const userModels = data.filter((model) => model.user_id === user.id);
//             setModels(userModels);
//         })
//         .catch((error) => console.error("Error fetching models:", error));
// };

// const deleteModel = (modelId) => {
//     fetch(`/api/models/${modelId}`, {
//         method: "DELETE",
//     })
//         .then(() => {
//             // After deletion, fetch models again to update the list
//             fetchModels();
//         })
//         .catch((error) => console.error("Error deleting model:", error));
// };


//   console.log(user?.model);
//   console.log(user);

//   return (
//     <div className="Wrapper">
//       <h1 className="Logo">Choose Wisely Mortal...</h1>
//       <div>
//         {user?.model?.length > 0 ? (
//           <ul>
//             {models.map((model) => (
//               <li key={model.id}>
//                 <span className="modelName">{model.name}</span>
//                 <button onClick={() => deleteModel(model.id)} className="login">🗑️</button>
//                 {/* Log model.id to verify */}
//                 {console.log("Model ID:", model.id)}
//                 {/* Pass model.id to the EditModel component */}
//                 <Button as={Link} to={`/edit-model/${model.id}`}>
//                   View
//                 </Button>
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <>
//             <h2>No Models Found</h2>
//           </>
//         )}
//         <Button as={Link} to="/create-model">
//           Paint a New Model
//         </Button>
//       </div>
//     </div>
//   );
// }

// export default ModelList;

//____________________________________________________________________________________________________________________________________________________________________________________________________
// This is the old code that was working before we changed up the backend.

// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "../styles";
// import EditModel from "./EditModel"; // Import the EditModel component

// function ModelList({ user }) {
//   const [models, setModels] = useState([]);

//   useEffect(() => {
//     if (user && user.model) {
//       setModels(user.model);
//     }
//   }, [user]);

//   const deleteModel = (modelId) => {
//     fetch(`/api/models/${modelId}`, {
//       method: "DELETE",
//     })
//       .then(() => {
//         setModels((deletedModels) =>
//           deletedModels.filter((model) => model.id !== modelId)
//         );
//       })
//       .catch((error) => console.error("Error deleting model:", error));
//   };

//   console.log(user?.model);

//   return (
//     <div className="Wrapper">
//       <h1 className="Logo">Choose Wisely Mortal...</h1>
//       <div>
//         {user?.model?.length > 0 ? (
//           <ul>
//             {models.map((model) => (
//               <li key={model.id}>
//                 <span className="modelName">{model.name}</span>
//                 <button onClick={() => deleteModel(model.id)} className="login">🗑️</button>
//                 {/* Log model.id to verify */}
//                 {console.log("Model ID:", model.id)}
//                 {/* Pass model.id to the EditModel component */}
//                 <Button as={Link} to={`/edit-model/${model.id}`}>
//                   View
//                 </Button>
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <>
//             <h2>No Models Found</h2>
//           </>
//         )}
//         <Button as={Link} to="/create-model">
//           Paint a New Model
//         </Button>
//       </div>
//     </div>
//   );
// }

// export default ModelList;


//____________________________________________________________________________________________________________________________________________________________________________________________________
//FINALLY HOLY LORD IT WORKED. WE HAVE POSTED THE FILE PATH AND THE COLORS THE USER SELECTED TO THE BACKEND, ALMOST HAVE MVP AND THEN WE CAN GET REALLY WILD WITH IT

// import React, { Suspense, useState, useRef, useEffect } from 'react';
// import { Stage, OrbitControls } from "@react-three/drei";
// import { Canvas } from '@react-three/fiber';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { useLoader } from '@react-three/fiber';
// import { Button } from "../styles";
// import { useNavigate } from 'react-router-dom';

// const Model = () => {
//   const gltf = useLoader(GLTFLoader, './public/shoe.gltf');
//   const [materialColors, setMaterialColors] = useState({});
//   const meshRefs = useRef({});
//   const navigate = useNavigate();

//   const handleColorChange = (materialName, color) => {
//     setMaterialColors({ ...materialColors, [materialName]: color });

//     if (meshRefs.current[materialName]) {
//       meshRefs.current[materialName].material.color.set(color);
//     }
//   };

//   const logFilePathAndColors = async () => {
//     console.log("GLTF File Path:", './public/shoe.gltf');
//     console.log("Material Colors:", Object.values(materialColors));

//     const response = await fetch('/api/save-model', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         model_name: './public/shoe.gltf',
//         color_names: Object.values(materialColors)
//       })
//     });

//     if (response.ok) {
//       console.log('GLTF File Path and Colors saved successfully');
//       navigate('/main-page');
//     } else {
//       console.error('Error saving GLTF File Path and Colors');
//     }
//   };

//   useEffect(() => {
//     gltf.scene.traverse((child) => {
//       if (child.isMesh && child.material.name) {
//         if (!(child.material.name in materialColors)) {
//           setMaterialColors((prevColors) => ({
//             ...prevColors,
//             [child.material.name]: '#ff0000',
//           }));
//         }
//         meshRefs.current[child.material.name] = child;
//       }
//     });
//   }, [gltf]);

//   return (
//     <>
//       <Canvas style={{ width: '600px', height: '600px' }}>
      // <Stage environment={"city"} intensity={1} contactShadow={false} shadowBias={-0.0015}>
//         <Suspense fallback={null}>
//           <primitive object={gltf.scene} />
//         </Suspense>
//         </Stage>
//         <OrbitControls enablePan={true} enableZoom={true} enableRotate={true}/>
//       </Canvas>
//       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px', maxHeight: '600px', overflowY: 'auto' }}>
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
//         <Button onClick={logFilePathAndColors}>Log File Path and Colors</Button>
//       </div>
//     </>
//   );
// };

// export default Model;

//____________________________________________________________________________________________________________________________________________________________________________________________________
// This is the OG code from phase 4 for reference to the main page. At least initially I want to try to set it up like this just to have something functional

// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "../styles";

// function TeamList({ user }) {
//   const [teams, setTeams] = useState([]);

//   useEffect(() => {
//     if (user && user.team) {
//       setTeams(user.team);
//     }
//   }, [user]);

//   const deleteTeam = (teamId) => {
//     fetch(`/api/teams/${teamId}`, {
//       method: "DELETE",
//     })
//       .then(() => {
//         setTeams((deletedTeams) =>
//           deletedTeams.filter((team) => team.id !== teamId)
//         );
//       })
//       .catch((error) => console.error("Error deleting team:", error));
//   };

//   console.log(user?.team);

//   return (
//     <div className="Wrapper">
//       <h1 className="Logo">PokeDecks</h1>
//       <div>
//         {user?.team?.length > 0 ? (
//           <ul>
//             {teams.map((team) => (
//               <li key={team.id}>
//                 <span className="teamName">{team.name}</span>
//                 <button onClick={() => deleteTeam(team.id)} className="login" >🗑️</button>
//                 <Button as={Link} to={`/edit-team/${team.id}`}>
//                   View
//                 </Button>
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <>
//             <h2>No Teams Found</h2>
//           </>
//         )}
//         <Button as={Link} to="/create-team">
//           Build a New Team
//         </Button>
//       </div>
//     </div>
//   );
// }

// export default TeamList;
