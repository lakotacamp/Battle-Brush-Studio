import React, { useState } from "react";
import Axios from "axios";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";


function App() {
  const [fileSelected, setFileSelected] = useState("");

  const uploadFile = () => {
    const formData = new FormData();
    formData.append("file", fileSelected);
    formData.append("upload_preset", "j1y8tkcb"); // Replace with your Cloudinary upload preset

    Axios.post("https://api.cloudinary.com/v1_1/dflask3te/raw/upload", formData)
      .then((response) => {
        const uploadedUrl = response.data.secure_url;
        console.log("File uploaded successfully. Access it at:", uploadedUrl);

        // Axios.get(uploadedUrl)
        //   .then((res) => {
        //     const loader = new THREE.GLTFLoader();
        //     loader.parse(res.data, "", (gltf) => {
          const loader = new GLTFLoader();
          loader.load(uploadedUrl, (gltf) => {
              const meshes = [];
              const materialsByMesh = {};

              gltf.scene.traverse((node) => {
                if (node.isMesh) {
                  meshes.push(node.name);
                  materialsByMesh[node.name] = node.material.name || "Unnamed Material";
            }
          });
          console.log("Meshes in the 3D model:", meshes);
          console.log("Materials by Mesh:", materialsByMesh);
      });
    })
      .catch((error) => {
        console.error("Error uploading file: ", error);
      });
  };
  // .catch((error) => {
  //   console.error("Error uploading file: ", error);
  // });


  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          setFileSelected(e.target.files[0]);
        }}
      />
      <button onClick={uploadFile}>Upload</button>
    </div>
  );
}

export default App;