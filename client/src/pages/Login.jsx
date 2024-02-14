import React, { useState } from "react";
import LoginForm from "/src/components/LoginForm";
import SignUpForm from "/src/components/SignUpForm";
import MainPage from "/src/pages/MainPage";
import { Button } from "../styles";

function Login({ onLogin }) {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="Wrapper">
      <h1 className="Logo">Battle Brush Studio</h1>
      {showLogin ? (
        <>
          <LoginForm onLogin={onLogin} />
          <hr className="Divider" />
          <p>
            Don't have an account? &nbsp;
            <button className="login" onClick={() => setShowLogin(false)}>
              Sign Up
            </button>
          </p>
        </>
      ) : (
        <>
          <SignUpForm onLogin={onLogin} />
          <hr className="Divider" />
          <p>
            Already have an account? &nbsp;
            <button className="login" onClick={() => {setShowLogin(true)
          }}>
              Log In
            </button>
          </p>
        </>
      )}
    </div>
  );
}

export default Login;

// Add a button for logging in with google
