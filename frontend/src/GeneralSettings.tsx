import React, { useState } from "react";
import SettingsPage from "./CorpSetting"; // Ensure this path matches your file structure
import SettingsProfilePage from "./SettingsProfilePage"; // Ensure this path matches your file structure
import { useAuth } from "./lib/hooks/auth";
import DeleteAccount from "./components/SupressionDeCompte";
const GeneralSettings = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("");

  const renderSectionContent = () => {
    switch (activeSection) {
      case "personalInfo":
        return user?.type === "ENTREPRISE" ? <SettingsPage /> : null;
      case "profileSettings":
        return <SettingsProfilePage />;
      case "deleteAccount":
        return user?.type === "ENTREPRISE" || user?.type === "STUDENTS" ? (
          <DeleteAccount />
        ) : null;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Bienvenue dans les paramètres généraux
            </h2>
            <p className="text-md text-gray-600 mb-4">
              Sélectionnez une section pour personnaliser vos paramètres
            </p>
            <div className="text-center text-lg">Sélectionnez une rubrique</div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      {}
      <div className="w-1/4 bg-white h-full overflow-auto fixed">
        <div className="p-5 border-r border-gray-200 h-full">
          <div className="space-y-4">
            <div>
              {user?.type === "ENTREPRISE" ? (
                <div
                  className="group relative flex items-center gap-x-6 rounded-lg p-5 text-sm leading-6 hover:bg-indigo-50 cursor-pointer"
                  onClick={() => setActiveSection("personalInfo")}
                >
                  <div
                    style={{ textAlign: "center" }}
                    className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white mx-auto"
                  >
                    <svg
                      className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
                      />
                    </svg>
                  </div>
                  <div className="flex-auto hidden md:block">
                    <div className="block font-semibold text-gray-900">
                      Paramètres des créneaux
                    </div>
                    <p className="mt-1 text-gray-600">
                      Paramètres des créneaux pour rendez-vous
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Profile Settings Section */}
            <div
              className="group relative flex items-center gap-x-6 rounded-lg p-5 text-sm leading-6 hover:bg-indigo-50 cursor-pointer"
              onClick={() => setActiveSection("profileSettings")}
            >
              <div
                style={{ textAlign: "center" }}
                className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white mx-auto"
              >
                <svg
                  className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m-9 6h9m4 0a9 9 0 110-18 9 9 0 010 18zm0-4a5 5 0 100-10 5 5 0 000 10z"
                  />
                </svg>
              </div>
              <div className="flex-auto hidden md:block">
                <div className="block font-semibold text-gray-900">
                  Paramètres E-mail
                </div>
                <p className="mt-1 text-gray-600">
                  Paramètres des horaires d'envoie d'e-mails
                </p>
              </div>
            </div>

            {/* delete accoutn */}

            {user?.type === "ENTREPRISE" || user?.type === "STUDENTS" ? (
              <div
                className="group relative flex items-center gap-x-6 rounded-lg p-5 text-sm leading-6 hover:bg-indigo-50 cursor-pointer"
                onClick={() => setActiveSection("deleteAccount")}
              >
                <div
                  style={{ textAlign: "center" }}
                  className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white mx-auto"
                >
                  <svg
                    className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m-9 6h9m4 0a9 9 0 110-18 9 9 0 010 18zm0-4a5 5 0 100-10 5 5 0 000 10z"
                    />
                  </svg>
                </div>
                <div className="flex-auto hidden md:block">
                  <div className="block font-semibold text-gray-900">
                    Paramètres profil
                  </div>
                  <p className="mt-1 text-gray-600">Supprimer le compte</p>
                </div>
              </div>
            ) : null}

            {/* Additional sections can be added here */}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-gray-50 overflow-auto ml-[25%]">
        {renderSectionContent()}
      </div>
    </div>
  );
};

export default GeneralSettings;
