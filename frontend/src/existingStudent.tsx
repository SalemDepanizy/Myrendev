import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { fetcher } from "./axios";
import useSWR from "swr";
import { styledToast } from "./components/ui/toasting";
import { CheckCheck } from "lucide-react";
import Button from "./components/Button";
import { message } from "antd";

interface Forfait {
  id: number;
  name: string;
  heure: string;
}
export interface Student {
  id: string;
  name: string;
  lastname: string;
  phone: string;
  email: string;
  address: string;
  forfait?: {
    id: string;
    name: string;
  };
  heure: string;
  heuresup: string;
  image: string;
  ville: string;
  codePostal: string;
  active: boolean; // Add this line
}

interface Monitor {
  id: number;
  name: string;
  lastname: string;
}

interface StudentData {
  name: string;
  lastname: string;
  phone: string;
  email: string;
  password: string;
  address: string;
  //heure: string;
  // heuresup: string;
  image: string;
  //forfait: string;
  //monitor: string;
  ville: string;
  codePostal: string;
}

interface FormErrors {
  name?: string;
  lastname?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  password?: string;
  address?: string;
  //heure?: string;
  // heuresup?: string;
  image?: string;
  //forfait?: string;
  //monitor?: string;
  ville?: string;
  codePostal?: string;
}

interface AddstudentsProps {
  onUserCreated?: () => void;
}

function AddExistingStudents({ onUserCreated }: AddstudentsProps) {
  const {
    data: students,
    isLoading: loadingStudents,
    error: errorStudents,
    mutate: refresh,
  } = useSWR("/users/get/student", async (url) => {
    const students = (await fetcher.get(url)).data as Student[];

    return students;
  });


  const {
    data: user,
    isLoading: loadinguser,
    error: erroruser,
  } = useSWR(
    "/users/all",
    async (url) => {
      return (await fetcher.get(url)).data as any[];
    }
  );


  const [data, setData] = useState<StudentData>({
    name: "",
    lastname: "",
    phone: "",
    email: "",
    password: "",
    address: "",
    //heure: "",
    ville: "",
    // heuresup: '',
    image: "",
    //forfait: "",
    //monitor: "",
    codePostal: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const {
    data: monitors,
    isLoading: loadingMonitors,
    error: errorMonitors,
  } = useSWR("/users/get/monitor", async (url) => {
    return (await fetcher.get(url)).data as Monitor[];
  });

  const {
    data: forfaits,
    isLoading: loadingForfaits,
    error: errorForfaits,
  } = useSWR("/forfait/all", async (url) => {
    const forfait = (await fetcher.get(url)).data as Forfait[];
    // console.log(forfait);
    return forfait;
  });

  const navigate = useNavigate();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Supprimer tous les espaces et autres caractères non numériques
    const numericValue = e.target.value.replace(/\D/g, "");

    // Limiter la longueur à 10 chiffres
    const limitedNumericValue = numericValue.slice(0, 10);

    // Ajouter un espace après le premier chiffre, puis un espace après chaque groupe de 2 chiffres
    const formattedValue = limitedNumericValue.replace(
      /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
      "$1 $2 $3 $4 $5"
    );

    setData({ ...data, phone: formattedValue });
  };

  const[emailFound, setEmailFound]= useState(false)
  const[foundItem, setfoundItem]= useState<any>()
  const[br, setBr]= useState<string>("")


useEffect(() => {
  user?.forEach(item => {
    if (item.email === data.email) {
      setfoundItem(item);
      // console.log('foundItem',item)
        setEmailFound(true);
        setBr(foundItem?.id);
    }
});
})


useEffect(() => {
  console.log('emailFound',emailFound)
})
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

 
    const newErrors: FormErrors = {};

if (emailFound === false) {
      newErrors.email = "veuillez entrez un mail deja enregistré";
      message.error("veuillez entrez un mail deja enregistré");
      console.log("veuillez entrez un mail deja enregistré");
    }
    if (!data.name) {
      newErrors.name = "Ce champ est obligatoire";
    }
    if (!data.lastname) {
      newErrors.lastname = "Ce champ est obligatoire";
    }

    if (!data.email) {
      newErrors.email = "Ce champ est obligatoire";
    }
  
    if (!data.address) {
      newErrors.address = "Ce champ est obligatoire";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      styledToast({
        title: "Ajouté avec succès",
        className: "bg-green-500 text-white",
        icon: <CheckCheck />,
        color: "text-white",
      });
    } else {
      // Show error toast in red with plain text
      styledToast({
        title: "Échec",
        className: "bg-red-500 text-white",
        // You can add an appropriate error icon here, or use plain text for the error.
        color: "text-white",
      });
    }

    setErrors(newErrors);

  console.log('errors:', newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

   
    fetcher

      .post("/users/assign-client", {
        clientId: br,
        //heure: Number(data.heure),
        // heuresup: Number(data.heuresup),
        type: "STUDENTS",
      })
      .then((res) => {
        // Close the modal if the callback function is provided
        if (onUserCreated) {
          onUserCreated();
        }

        // Navigate or perform any other actions if needed
      
        // console.log("Réponse réussie:", res);
      });

   };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      try {
        const dataURL = await readFileAsDataURL(file);
        setData({ ...data, image: dataURL });
      } catch (error) {
        console.error("Error reading file:", error);
        setData({ ...data, image: "" });
      }
    } else {
      setData({ ...data, image: "" });
    }
  };

  // Async function to read file as Data URL
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error("Failed to read file."));
        }
      };

      reader.onerror = () => {
        reject(new Error("Error reading file."));
      };

      reader.readAsDataURL(file);
    });
  };


  return (
    <div className="container pt-4">
      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-12">
          <label htmlFor="inputName" className="form-label">
            Nom
          </label>
          <input
            type="text"
            className="form-control"
            id="inputName"
            placeholder="..."
            autoComplete="off"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
          />
          {errors.name && <p className="text-danger">{errors.name}</p>}
        </div>
        <div className="col-12">
          <label htmlFor="inputName" className="form-label">
            Prénom
          </label>
          <input
            type="text"
            className="form-control"
            id="inputName"
            placeholder="..."
            autoComplete="off"
            value={data.lastname}
            onChange={(e) => setData({ ...data, lastname: e.target.value })}
          />
          {errors.lastname && <p className="text-danger">{errors.lastname}</p>}
        </div>

        {/* <div className="col-12">
          <label htmlFor="inputHeure" className="form-label">
            Numéro de téléphone
          </label>
          <div className="input-group">
            <span className="input-group-text">+33</span>
            <input
              type="text"
              className="form-control"
              id="inputHeure"
              placeholder="..."
              autoComplete="off"
              value={data.phone}
              onChange={handlePhoneChange}
            />
          </div>
          {errors.phone && <p className="text-danger">{errors.phone}</p>}
        </div> */}

        <div className="col-12">
          <label htmlFor="inputEmail4" className="form-label">
            E-mail
          </label>
          <input
            type="email"
            className="form-control"
            id="inputEmail4"
            placeholder="..."
            autoComplete="off"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />
          {errors.email && <p className="text-danger">{errors.email}</p>}
          
        </div>
      
        {/* <div className="col-12">
          <label htmlFor="inputPassword4" className="form-label">
            Mot de passe
          </label>
          <input
            type="password"
            className="form-control"
            id="inputPassword4"
            placeholder="..."
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
          />
          {errors.password && <p className="text-danger">{errors.password}</p>}
        </div> */}

        <div className="col-12">
          <label htmlFor="inputAddress" className="form-label">
            Adresse
          </label>
          <input
            type="text"
            className="form-control"
            id="inputAddress"
            placeholder="Adresse Complete"
            autoComplete="off"
            value={data.address}
            onChange={(e) => setData({ ...data, address: e.target.value })}
          />
          {errors.address && <p className="text-danger">{errors.address}</p>}
        </div>

        <div className="col-md-6">
          <label htmlFor="inputVille" className="form-label">
            Ville
          </label>
          <input
            type="text"
            className="form-control"
            id="inputVille"
            placeholder="Ville"
            value={data.ville}
            onChange={(e) => setData({ ...data, ville: e.target.value })}
          />
          {errors.ville && <p className="text-danger">{errors.ville}</p>}
        </div>

        <div className="col-md-6">
          <label htmlFor="inputCodePostal" className="form-label">
            Code Postal
          </label>
          <input
            type="text"
            className="form-control"
            id="inputCodePostal"
            placeholder="Code Postal"
            value={data.codePostal}
            onChange={(e) => setData({ ...data, codePostal: e.target.value })}
          />
          {errors.codePostal && (
            <p className="text-danger">{errors.codePostal}</p>
          )}
        </div>

        <div className="col-12 mb-3">
          <label className="form-label" htmlFor="inputGroupFile01">
            Selectionner une Image
          </label>
          <input
            type="file"
            className="form-control"
            id="inputGroupFile01"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              if (file) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                  const dataURL = reader.result as string;
                  setData({ ...data, image: dataURL });
                };
              } else {
                setData({ ...data, image: "" });
              }
            }}
          />
        </div>
        <div className="col-12">
          <Button type="submit">ajouter</Button>
       

        </div>
      </form>
    </div>
  );
}

export default AddExistingStudents;
