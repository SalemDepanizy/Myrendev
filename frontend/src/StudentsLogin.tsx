import React, { useState } from "react";
import "./style.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Button from "./components/Button";

function StudentsLogin() {
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;
  const [error, setError] = useState("");

  const handlSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    axios
      .post("http://localhost:8081/studentslogin", values)
      .then((res) => {
        if (res.data.Status === "Success") {
          const id = res.data.id;
          navigate("/studentsdetail/" + id);
        } else {
          setError(res.data.Error);
        }
      })
    
  };

  return (
    <div>
      <div className="d-flex justify-content-center align-items-center vh-100 loginPage">
        <div className="p-3 rounded w-25 border loginForm">
          <div className="text-danger">{error && error}</div>
          <h2>Connexion</h2>
          <form onSubmit={handlSubmit}>
            <div className="mb-3">
              <label htmlFor="email">
                <strong>Email</strong>
              </label>
              <input
                type="email"
                placeholder="Enter Email"
                name="email"
                onChange={(e) =>
                  setValues({ ...values, email: e.target.value })
                }
                className="form-control rounded-0"
                autoComplete="off"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password">
                <strong>Password</strong>
              </label>
              <input
                type="password"
                placeholder="Enter Password"
                name="password"
                onChange={(e) =>
                  setValues({ ...values, password: e.target.value })
                }
                className="form-control rounded-0"
              />
            </div>
            <Button type="submit" className="btn btn-success w-100 rounded-0">
              {" "}
              Log in
            </Button>
            <p className="mt-2 text-center">MyRendev</p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StudentsLogin;
