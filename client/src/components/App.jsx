import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
import Login from "/src/pages/Login";
import MainPage from "/src/pages/MainPage";
import CreateModel from "/src/pages/CreateModel";
import NavBar from "./Navbar";
import EditModel from "/src/pages/EditModel"
import { SignOutButton, SignInButton, SignedIn, SignedOut } from "@clerk/clerk-react"

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // auto-login
    fetch("/api/checksession").then((r) => {
      if (r.ok) {
        r.json().then((user) => setUser(user));
      }
    });
  }, []);

  console.log(user)

  return (
    <>
      <div>
        <BrowserRouter>
          <NavBar />
          <Routes>
            {/* <SignedOut> */}
              {/* <SignInButton /> */}
            <Route path="/" element={<Login onLogin={setUser} />} />
            {/* </SignedOut> */}
            {/* <SignedIn> */}
              {/* <SignOutButton signOutCallback={() => redirect('/')} /> */}
            <Route path="/main-page" element={<MainPage user={user} setUser={setUser}/>} />
            <Route path="/create-model" element={<CreateModel setUser={setUser}/>} />
            <Route path="/edit-model/:modelId" element={<EditModel />} />
            {/* </SignedIn> */}
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;