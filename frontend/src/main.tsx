import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css"; // Corrected the import path
import App from "./App";
import { Toaster } from "./components/ui/toaster";

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <>
      <App />
      <div className="px-2 relative">
        <Toaster />
      </div>
    </>
  );
} else {
  // Handle the case where the 'root' element is not found
  console.error("The 'root' element was not found in the document.");
}
