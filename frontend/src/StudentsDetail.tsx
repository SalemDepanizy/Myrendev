import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "./components/Button";

interface Student {
  image: string;
  name: string;
  lastname: string;
  phone: string;
  email: string;
  heure: string;
}

function StudentsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student | null>(null);

  useEffect(() => {
    axios
      .get(`http://localhost:8081/get/${id}`)
      .then((res) => setStudents(res.data.Result[0] as Student))
   
  }, [id]); // Add id as a dependency

  const handleLogout = () => {
    axios
      .get("http://localhost:8081/logout")
      .then((res) => {
        navigate("/start");
      })
    
  };

  return (
    <div>
      {students && (
        <div className="d-flex justify-content-center flex-column align-items-center mt-3">
          <img
            src={`http://localhost:8081/images/${students.image}`}
            alt=""
            className="empImg"
          />
          <div className="d-flex align-items-center flex-column mt-5">
            <h3>Nom: {students.name}</h3>
            <h3>Prénom: {students.lastname}</h3>
            <h3>Numéro de téléphone: {students.phone}</h3>
            <h3>Email: {students.email}</h3>
            <h3>Heure: {students.heure}</h3>
          </div>
          <div>
            <Button className="btn btn-primary me-2">Edit</Button>
            <Button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentsDetail;
