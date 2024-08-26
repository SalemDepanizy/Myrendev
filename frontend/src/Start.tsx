import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "./components/Button";

function Start() {
  const navigate = useNavigate();
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 loginPage">
      <div className="p-3 rounded w-25 border loginForm text-center">
        <h2>Login As</h2>
        <div className="d-flex justify-content-between mt-5">
          <Button
            className="btn btn-primary btn-lg"
            onClick={(e) => navigate("/StudentsLogin")}
          >
            Student
          </Button>
          <Button
            className="btn btn-success btn-lg"
            onClick={(e) => navigate("/login")}
          >
            Admin
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Start;
