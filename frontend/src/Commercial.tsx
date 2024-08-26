import React, { useState } from "react";
import { FaBriefcase, FaUsers, FaEye, FaEyeSlash } from "react-icons/fa";
import { useModal } from "./components/modal";
import useSWR from "swr";
import { fetcher } from "./axios";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import Button from "./components/Button";

export interface Entreprise {
  id: number;
  name_entreprise: string;
  name_manager: string;
  phone_entreprise: string;
  phone_manager: string;
  email: string;
  address: string;
  type: string;
}

function Commercial() {
  const [data2, setData2] = useState<{
    name_entreprise: string;
    name_manager: string;
    phone_entreprise: string;
    phone_manager: string;
    email: string;
    // password: string;
    address: string;
    id: string | null;
    active: boolean;
  }>({
    name_entreprise: "",
    name_manager: "",
    phone_entreprise: "",
    phone_manager: "",
    email: "",
    // password: "",
    address: "",
    active: true,
    id: null,
  });

  const {
    data: entreprises,
    isLoading: loadingEntreprises,
    error: errorEntreprises,
  } = useSWR("/users/get/entreprise", async (url) => {
    return (await fetcher.get(url)).data as Entreprise[];
  });

  const handleSubmit2 = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    // Generate a random password
    const randomPassword = Math.random().toString(36).slice(-8); // Example random password generation

    fetcher
      .post("/users/create/entreprise", {
        ...data2,
        password: randomPassword,
      })
      .then((res) => {
        window.location.reload();
      })
      // .catch((err) => console.log(err));
    // console.log("test");
  };

  // const handleDelete = (id) => {
  //   fetcher
  //     .delete(`/users/delete/${id}`)
  //     .then((res) => {
  //       if (res.data.success) {
  //         window.location.reload();
  //       } else {
  //         alert("Error");
  //       }
  //     })
  //     .catch((err) => console.log(err));
  // };

  const { Modal, openModal, closeModal } = useModal();
  const {
    Modal: Modal2,
    openModal: OpenModal2,
    closeModal: closeModal2,
  } = useModal();

  const [showPassword, setShowPassword] = useState(false);

  // const togglePasswordVisibility = () => {
  //   setShowPassword(!showPassword);
  // };

  const entrepriseCount = entreprises ? entreprises.length : 0;

  const formatPhoneNumber = (input) => {
    // Remove all non-numeric characters
    let numbers = input.replace(/\D/g, '');

    // Limit length to 11 characters
    numbers = numbers.substring(0, 10);

    // Format the numbers: 1 space after the first digit, then after every 2 digits
    const formatted = numbers
      .split('')
      .reduce((acc, digit, index) => {
        if (index !== 0 && index % 2 === 0) {
          return acc + ' ' + digit;
        }
        return acc + digit;
      }, '');
  

    return formatted;
  };

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white h-full">
      <div className="container px-6 py-8 mx-auto">
        <h3 className="text-3xl font-medium text-gray-700">
          Dashboard Commercial
        </h3>

        <div className="mt-4">
          <div className="flex flex-wrap -mx-6">
            <div className="w-full px-6 mt-6 sm:w-1/2 xl:w-1/3 sm:mt-0">
              <div className="flex items-center px-5 py-6 bg-white rounded-3xl shadow-sm">
                <div className="p-3 bg-orange-600 bg-opacity-75 rounded-full">
                  <FaBriefcase className="w-8 h-8 text-white" />
                </div>

                <div className="mx-5">
                  <h4 className="text-2xl font-semibold text-gray-700">
                    {entrepriseCount}
                  </h4>
                  <div className="text-gray-500">Total Entreprises</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto py-6 sm:px-6">
          <div className="px-4 py-4 -mx-4 sm:-mx-6 sm:px-6">
            <div className="flex justify-between">
              <h2 className="text-2xl font-semibold leading-tight">
                Liste Des Entreprises
              </h2>
              <Button onClick={OpenModal2} className="btn btn-success">
                Ajouter une Entreprise
              </Button>
              <Modal2 title="Ajouter une entreprise">
                <form className="w-full h-full" onSubmit={handleSubmit2}>
                  <div>
                    <div className="mt-4">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="name"
                      >
                        Nom De l'Entreprise :
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Enter name"
                        onChange={(e) =>
                          setData2({
                            ...data2,
                            name_entreprise: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="mt-4">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="name"
                      >
                        Nom Du Responsable :
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Enter name"
                        onChange={(e) =>
                          setData2({ ...data2, name_manager: e.target.value })
                        }
                      />
                    </div>
                    <div className="mt-4">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="phone"
                      >
                        Téléphone Entreprise :
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">+33</span>
                        <input
                        type="text"
                        id="phoneEntreprise"
                        className="form-control"
                        placeholder="Enter phone number"
                        value={data2.phone_entreprise}
                        onChange={(e) =>
                          setData2({
                            ...data2,
                            phone_entreprise: formatPhoneNumber(e.target.value),
                          })
                        }
                      />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="phone"
                      >
                        Téléphone Résponsable :
                      </label>
                      <div className="input-group">
                         <span className="input-group-text">+33</span>
                           <input
                             type="text"
                            className="form-control"
                            id="inputPhone"
                            placeholder="Entrez le numéro de téléphone"
                            autoComplete="off"
                            value={data2.phone_manager}
                            onChange={(e) =>
                              setData2({
                                ...data2,
                                phone_manager: formatPhoneNumber(e.target.value),
                              })
                            }
                           />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="email"
                      >
                        E-mail:
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Enter email"
                        onChange={(e) =>
                          setData2({ ...data2, email: e.target.value })
                        }
                      />
                    </div>
                    {/* <div className="mt-4">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="password"
                      >
                        Mots de Passe:
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          placeholder="Enter password"
                          onChange={(e) =>
                            setData2({ ...data2, password: e.target.value })
                          }
                        />
                        <button
                      type="button" // Add this line to prevent it from being a submit button
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                       </button>
                      </div>
                    </div> */}
                    <div className="mt-4">
                      <label
                        className="block text-gray-700 text-sm font-bold"
                        htmlFor="adresse"
                      >
                        Adresse:
                      </label>
                      <input
                        type="text"
                        id="adresse"
                        className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline my-3"
                        placeholder="Enter address"
                        onChange={(e) =>
                          setData2({ ...data2, address: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button
                      className="focus:outline-none modal-close px-4 bg-gray-400 p-3 rounded-lg text-black hover:bg-gray-300"
                      onClick={closeModal2}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      className="focus:outline-none px-4 bg-teal-500 p-3 ml-3 rounded-lg text-white hover:bg-teal-400"
                    >
                      Ajouter
                    </Button>
                  </div>
                </form>
              </Modal2>
            </div>
          </div>

          <div className="-mx-4 sm:-mx-6 sm:px-6 mt-4">
            <div className="py-4 align-middle inline-block min-w-full sm:px-6">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                        Nom de l'entreprise
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                        Nom du manager
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                        téléphone de l'entreprise
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                        téléphone du manager
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                        email
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                        address
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                        titre
                      </th>
                      <th className="px-6 py-3 bg-gray-50"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Sample table rows */}
                    {entreprises?.map((entreprises, index) => {
                      return (
                        <tr>
                          <td className="px-6 py-4">
                            {/* Insert the image tag */}
                            <div className="text-sm font-medium leading-5 text-gray-900">
                              {entreprises.name_entreprise}
                            </div>
                            <div className="text-sm leading-5 text-gray-500">
                              Auto Ecole
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium leading-5 text-gray-900">
                              {entreprises.name_manager}
                            </div>
                            <div className="text-sm leading-5 text-gray-500">
                              {entreprises.email}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium leading-5 text-gray-900">
                              {entreprises.phone_entreprise}
                            </div>
                            <div className="text-sm leading-5 text-gray-500">
                              {entreprises.name_entreprise}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium leading-5 text-gray-900">
                              {entreprises.phone_manager}
                            </div>
                            <div className="text-sm leading-5 text-gray-500">
                              {entreprises.name_manager}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium leading-5 text-gray-900">
                              {entreprises.email}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium leading-5 text-gray-900">
                              {entreprises.address}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                              {entreprises.type}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">{/* Other content goes here */}</div>
      </div>
    </main>
  );
}

export default Commercial;
