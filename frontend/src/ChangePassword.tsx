import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetcher } from "./axios";
import Button from "./components/Button";
import { useAuth } from "./lib/hooks/auth";
import { Link } from "react-router-dom";
import { message } from "antd";

const changePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

function ChangePassword() {
  const [visible, setVisible] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
  });
  return (
    <div className=" min-h-screen bg-white py-6 flex flex-col justify-center sm:py-12">
      <div className="py-3 sm:max-w-xl sm:mx-auto">
        <div className="bg-white min-w-xl flex flex-col rounded-xl shadow-lg">
          <div className="px-12 py-5">
            <div className="max-w-sm w-full text-gray-600">
              <div className="text-center">
                <img
                  src="../src/assets/logo.png"
                  width={150}
                  className="mx-auto"
                />
                <div className="mt-5 space-y-2">
                  <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl">
                    Modifier votre mot de passe
                  </h3>
                </div>
              </div>
              <form
                onSubmit={handleSubmit(async (data) => {
                  const res = await fetcher.patch("/auth/updatePassword", {
                    newPassword: data.newPassword,
                  });
                  if (res.status === 200) {
                    message.success(
                      "Votre mot de passe a été modifié avec succès!",
                      () => {
                        window.location.reload(); // Refresh the page after showing the message
                      }
                    );
                  } else {
                    alert(res.data.message);
                  }
                })}
                className="mt-8 space-y-5"
              >
                <div>
                  <label className="font-medium">
                    Nouveau mot de passe
                    <span className="text-red-500">*</span>
                  </label>
                  <div className=" mt-2  text-gray-500 bg-white outline-none border focus:border-indigo-600 shadow-sm rounded-lg flex items-center">
                    <input
                      type={visible ? "text" : "password"}
                      required
                      className="w-full px-3 py-2 text-black outline-none "
                      {...register("newPassword")}
                    />

                    <div
                      className="mr-2 cursor-pointer text-gray-400"
                      onClick={() => setVisible(!visible)}
                    >
                      {visible ? <Eye size={20} /> : <EyeOff size={20} />}
                    </div>
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-medium">
                    Confirmer le mot de passe
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full mt-2 px-3 py-2  bg-white outline-none border focus:border-indigo-600 shadow-sm rounded-lg text-black "
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button
                  className="w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150"
                  type="submit"
                >
                  Modifier le mot de passe
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
