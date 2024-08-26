"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_express15 = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_cookie_parser = __toESM(require("cookie-parser"));

// src/lib/typed/index.ts
var import_zod = require("zod");
var ApiResponse = class {
  constructor(data, status = 200) {
    this.status = status;
    this.data = {};
    this.data = data;
  }
};
var ApiError = class extends Error {
  constructor(message, status = 500) {
    super(message);
    this.message = message;
    this.status = status;
  }
};
function typed(config2) {
  return async (req, res) => {
    var _a, _b, _c, _d, _e, _f;
    try {
      const input = (_c = (_b = (_a = config2.schemas) == null ? void 0 : _a.input) == null ? void 0 : _b.parse(req.body)) != null ? _c : {};
      const params = (_f = (_e = (_d = config2.schemas) == null ? void 0 : _d.params) == null ? void 0 : _e.parse(req.params)) != null ? _f : {};
      const context = config2.context ? await config2.context({ req, res }) : {};
      const result = await config2.handler({
        input,
        params,
        req,
        res,
        ctx: context
      });
      if (result instanceof ApiResponse) {
        res.status(result.status).json(result.data);
      } else {
        res.status(200).json(result);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json({ message: error.message });
      } else if (error instanceof import_zod.z.ZodError || error instanceof Error && error.name === "ZodError") {
        res.status(400).send(error);
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  };
}

// src/prisma/index.ts
var import_client = require("@prisma/client");
var client = new import_client.PrismaClient();

// src/router/users/index.ts
var import_express = require("express");
var import_zod3 = require("zod");

// src/router/users/schema.ts
var import_zod2 = require("zod");
var createUser = import_zod2.z.object({
  name: import_zod2.z.string(),
  lastname: import_zod2.z.string(),
  phone: import_zod2.z.string(),
  phone2: import_zod2.z.string(),
  phone3: import_zod2.z.string(),
  email: import_zod2.z.string().email(),
  password: import_zod2.z.string().min(8),
  address: import_zod2.z.string(),
  heure: import_zod2.z.number().optional(),
  ville: import_zod2.z.string(),
  codePostal: import_zod2.z.string(),
  etage: import_zod2.z.string().optional(),
  // Add etage field
  code_acces: import_zod2.z.string().optional(),
  // Add code_acces field
  code_acces_supplementaire: import_zod2.z.string().optional(),
  // Add code_acces_supplementaire field
  // heuresup: z.number(),
  interphone: import_zod2.z.string().optional(),
  // Add interphone field
  image: import_zod2.z.string(),
  type: import_zod2.z.enum(["STUDENTS", "MONITOR", "ADMIN", "COMMERCIAL", "ENTREPRISE"]),
  resetPasswordToken: import_zod2.z.string().optional(),
  resetPasswordExpiry: import_zod2.z.number().optional(),
  color: import_zod2.z.string().optional(),
  // resetPasswordUsed: z.boolean().optional(),
  userType: import_zod2.z.enum(["Professionnel", "Particulier"]),
  // Add this line
  companyName: import_zod2.z.string().optional()
  // Add companyName field
});
var createMonitor = import_zod2.z.object({
  name: import_zod2.z.string().optional(),
  lastname: import_zod2.z.string().optional(),
  phone: import_zod2.z.string().optional(),
  email: import_zod2.z.string().email(),
  password: import_zod2.z.string().min(8),
  address: import_zod2.z.string().optional(),
  image: import_zod2.z.string().optional(),
  ville: import_zod2.z.string().optional(),
  codePostal: import_zod2.z.string().optional(),
  color: import_zod2.z.string().optional(),
  title: import_zod2.z.string().optional(),
  userType: import_zod2.z.enum(["Professionnel", "Particulier"]),
  // Add this line
  companyName: import_zod2.z.string().optional()
  // Add companyName field
});
var updateUser = import_zod2.z.object({
  name: import_zod2.z.string().optional(),
  lastname: import_zod2.z.string().optional(),
  phone: import_zod2.z.string().optional(),
  phone2: import_zod2.z.string().optional(),
  phone3: import_zod2.z.string().optional(),
  name_entreprise: import_zod2.z.string().optional(),
  name_manager: import_zod2.z.string().optional(),
  email: import_zod2.z.string().email().optional(),
  address: import_zod2.z.string().optional(),
  heure: import_zod2.z.number().optional(),
  image: import_zod2.z.string().optional(),
  ville: import_zod2.z.string().optional(),
  codePostal: import_zod2.z.string().optional(),
  active: import_zod2.z.boolean().optional(),
  // Added active field
  // heuresup: z.number().optional(),
  resetPasswordToken: import_zod2.z.string().optional(),
  resetPasswordExpiry: import_zod2.z.number().optional(),
  // resetPasswordUsed: z.boolean().optional(),
  color: import_zod2.z.string().optional()
});
var updateMonitor = import_zod2.z.object({
  name: import_zod2.z.string().optional(),
  lastname: import_zod2.z.string().optional(),
  phone: import_zod2.z.string().optional(),
  email: import_zod2.z.string().email().optional(),
  password: import_zod2.z.string().min(8).optional(),
  address: import_zod2.z.string().optional(),
  ville: import_zod2.z.string().optional(),
  codePostal: import_zod2.z.string().optional(),
  active: import_zod2.z.boolean().optional(),
  // Added active field
  color: import_zod2.z.string().optional(),
  image: import_zod2.z.string().optional()
});
var createCommercial = import_zod2.z.object({
  name: import_zod2.z.string(),
  email: import_zod2.z.string().email(),
  password: import_zod2.z.string().min(8),
  color: import_zod2.z.string().optional()
});
var updateCommercial = import_zod2.z.object({
  name: import_zod2.z.string().optional(),
  email: import_zod2.z.string().email().optional(),
  password: import_zod2.z.string().min(8).optional(),
  active: import_zod2.z.boolean().optional(),
  // Added active field
  color: import_zod2.z.string().optional()
});
var createEntreprise = import_zod2.z.object({
  name_entreprise: import_zod2.z.string().optional(),
  name_manager: import_zod2.z.string().optional(),
  phone_entreprise: import_zod2.z.string().optional(),
  phone_manager: import_zod2.z.string().optional(),
  email: import_zod2.z.string().email(),
  password: import_zod2.z.string().min(8),
  address: import_zod2.z.string(),
  ville: import_zod2.z.string().optional(),
  codePostal: import_zod2.z.string().optional(),
  active: import_zod2.z.boolean(),
  color: import_zod2.z.string().optional()
});
var updateEntreprise = import_zod2.z.object({
  name_entreprise: import_zod2.z.string().optional(),
  name_manager: import_zod2.z.string().optional(),
  phone_entreprise: import_zod2.z.string().optional(),
  phone_manager: import_zod2.z.string().optional(),
  email: import_zod2.z.string().email().optional(),
  password: import_zod2.z.string().min(8).optional(),
  address: import_zod2.z.string().optional(),
  ville: import_zod2.z.string().optional(),
  codePostal: import_zod2.z.string().optional(),
  active: import_zod2.z.boolean().optional(),
  // Added active field
  color: import_zod2.z.string().optional()
});
var daySchema = import_zod2.z.object({
  // start: z.string(),
  // end: z.string(),
  interval: import_zod2.z.array(import_zod2.z.string())
}).optional();
var addOwner = import_zod2.z.object({
  clientId: import_zod2.z.string(),
  ownerName: import_zod2.z.string().optional()
});

// src/router/users/index.ts
var bcrypt = __toESM(require("bcrypt"));
var import_cuid2 = require("@paralleldrive/cuid2");

// src/lib/protect.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
function protect(...roles) {
  return async ({ req, res }) => {
    var _a;
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new ApiError("Unauthorized", 401);
    }
    const [_, token] = authHeader.trim().split(" ");
    if (!token) {
      throw new ApiError("Unauthorized", 401);
    }
    try {
      const payload = import_jsonwebtoken.default.verify(token, (_a = process.env.SECRET) != null ? _a : "");
      if (typeof payload === "string") {
        throw new ApiError("Unauthorized", 401);
      }
      if (!payload.user.id) {
        throw new ApiError("Unauthorized", 401);
      }
      const tokenData = { id: payload.user.id };
      const user = await client.user.findFirst({ where: tokenData });
      if (roles.length > 0) {
        if (!user) {
          throw new ApiError("Unauthorized", 401);
        }
        if (!roles.includes(user == null ? void 0 : user.type)) {
          throw new ApiError("Unauthorized", 401);
        }
        return user;
      }
      return user;
    } catch (error) {
      throw new ApiError("Unauthorized", 401);
    }
  };
}

// src/router/users/index.ts
var import_client2 = require("@prisma/client");
var import_nodemailer = __toESM(require("nodemailer"));
var import_multer = __toESM(require("multer"));
var router = (0, import_express.Router)();
var jwt2 = require("jsonwebtoken");
router.post(
  "/forget-password",
  typed({
    schemas: {
      input: import_zod3.z.object({
        email: import_zod3.z.string().email()
      })
    },
    async handler({ input }) {
      const { email } = input;
      try {
        const existingUser = await client.user.findUnique({
          where: {
            email
          }
        });
        if (!existingUser) {
          throw new ApiError("Utilisateur non trouv\xE9");
        }
        const resetToken = Math.random().toString(36).slice(2);
        await client.user.update({
          where: { id: existingUser.id },
          data: {
            resetPasswordToken: resetToken,
            resetPasswordExpiry: Date.now() + 36e5
            // Exemple : expire dans 1 heure
            // resetPasswordUsed: false,
          }
        });
        const resetLink = `${process.env.APP_URL}reset-password/${resetToken}`;
        const smtpConfig = {
          host: "smtp.ionos.fr",
          port: 465,
          secure: true,
          auth: {
            user: "ne-pas-repondre@myrendev.com",
            pass: "Liamedia2608150155@"
          }
        };
        const transporter = import_nodemailer.default.createTransport(smtpConfig);
        const mailOptions = {
          from: "ne-pas-repondre@myrendev.com",
          to: email,
          subject: "R\xE9initialisation de Votre Mot de Passe",
          text: `${process.env.APP_URL}reset-password/${resetToken}`,
          html: `
            <div style="text-align: center;">
            <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 200px;">
                <h1 style="color: #111;">R\xE9initialisation de Votre Mot de Passe</h1>
                <p>Vous avez demand\xE9 la r\xE9initialisation de votre mot de passe sur <strong>MyRendev</strong>. Pour proc\xE9der, veuillez cliquer sur le lien ci-dessous.</p>
    
                <!-- Bouton qui agit comme un lien -->
                <a href="${resetLink}" style="text-decoration: none;">
                    <button style="background-color: #4daac4;
                                   color: white;
                                   padding: 14px 25px;
                                   text-align: center;
                                   border: none;
                                   display: inline-block;
                                   border-radius: 5px;
                                   cursor: pointer;">
                        R\xE9initialiser le mot de passe
                    </button>
                </a>
            </div>
        `
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            throw new ApiError(
              "Erreur lors de l'envoi de l'e-mail de r\xE9initialisation"
            );
          } else {
          }
        });
        return new ApiResponse({
          message: "Email envoy\xE9 avec le lien de r\xE9initialisation"
        });
      } catch (error) {
        console.error(
          "Erreur lors de la r\xE9initialisation du mot de passe:",
          error
        );
        throw new ApiError(
          "Une erreur s'est produite lors de la r\xE9initialisation du mot de passe"
        );
      }
    }
  })
);
router.get(
  "/isTokenValid/:token",
  typed({
    schemas: {
      params: import_zod3.z.object({
        token: import_zod3.z.string()
      })
    },
    async handler({ params }) {
      const { token } = params;
      try {
        const existingUser = await client.user.findFirst({
          where: {
            resetPasswordToken: token,
            resetPasswordExpiry: { gte: Date.now() }
          }
        });
        if (!existingUser) {
          throw new ApiError(
            "Token de r\xE9initialisation invalide ou expir\xE9"
          );
        }
        return new ApiResponse({
          valid: true
        });
      } catch (e) {
        throw new ApiError(
          "Token de r\xE9initialisation invalide ou expir\xE9"
        );
      }
    }
  })
);
router.post(
  "/reset-password",
  typed({
    schemas: {
      input: import_zod3.z.object({
        token: import_zod3.z.string(),
        newPassword: import_zod3.z.string().min(8)
      })
    },
    async handler({ input }) {
      const { token, newPassword } = input;
      try {
        const existingUser = await client.user.findFirst({
          where: {
            resetPasswordToken: token,
            resetPasswordExpiry: { gte: Date.now() }
          }
        });
        if (!existingUser) {
          throw new ApiError(
            "Token de r\xE9initialisation invalide ou expir\xE9"
          );
        }
        const userData = {
          password: await bcrypt.hash(newPassword, 10),
          resetPasswordToken: null,
          resetPasswordExpiry: Date.now() + 36e5
          // ... (autres champs de mise à jour générés par Prisma, si nécessaire)
        };
        await client.user.update({
          where: { id: existingUser.id },
          data: userData
        });
        return new ApiResponse({
          message: "Mot de passe r\xE9initialis\xE9 avec succ\xE8s"
        });
      } catch (error) {
        console.error(
          "Erreur lors de la r\xE9initialisation du mot de passe:",
          error
        );
        throw new ApiError(
          "Une erreur s'est produite lors de la r\xE9initialisation du mot de passe"
        );
      }
    }
  })
);
router.get(
  "/all",
  typed({
    async handler(props) {
      const users2 = (await client.user.findMany()).map((user) => __spreadProps(__spreadValues({}, user), {
        password: void 0
      }));
      return new ApiResponse(users2);
    }
  })
);
router.get(
  "/get/student",
  typed({
    context: protect("ENTREPRISE"),
    async handler({ ctx }) {
      const users2 = (await client.ownership.findMany({
        where: {
          owner: {
            id: ctx.id
          },
          user: {
            type: "STUDENTS"
          }
        },
        include: {
          user: {
            include: { creator: true }
          }
        }
      })).map((owner) => __spreadProps(__spreadValues({}, owner.user), {
        password: void 0
      }));
      return new ApiResponse(users2);
    }
  })
);
router.get(
  "/get/monitor",
  typed({
    context: protect("ENTREPRISE"),
    async handler({ ctx }) {
      const users2 = (await client.ownership.findMany({
        where: {
          owner: {
            id: ctx.id
          },
          user: {
            type: "MONITOR"
          }
        },
        include: {
          user: {
            include: { availabilities: true }
          }
        }
      })).map((ownership) => __spreadProps(__spreadValues({}, ownership.user), {
        password: void 0
      }));
      return new ApiResponse(users2);
    }
  })
);
router.get(
  "/get/monitorAvail",
  typed({
    context: protect("ENTREPRISE"),
    // Ensure only authenticated entreprise can access this route
    async handler({ ctx }) {
      const users2 = (await client.ownership.findMany({
        where: {
          owner: {
            id: ctx.id
            // Use the entreprise ID from the context to filter monitors
          },
          user: {
            type: "MONITOR",
            availabilities: {
              some: {}
            }
          }
        },
        include: { user: true }
      })).map((ownership) => __spreadProps(__spreadValues({}, ownership.user), {
        password: void 0
        // Exclude password from the response for security
      }));
      return new ApiResponse(users2);
    }
  })
);
router.get(
  "/get/commercial",
  typed({
    async handler(props) {
      const users2 = (await client.user.findMany({
        where: { type: "COMMERCIAL" },
        include: {
          creator: true
        }
      })).map((user) => __spreadProps(__spreadValues({}, user), {
        password: void 0
      }));
      return new ApiResponse(users2);
    }
  })
);
router.get(
  "/get/entreprise",
  typed({
    async handler(props) {
      const users2 = (await client.user.findMany({
        where: { type: "ENTREPRISE" },
        include: {
          forfait: true,
          creator: true
        }
      })).map((user) => __spreadProps(__spreadValues({}, user), {
        password: void 0
      }));
      return new ApiResponse(users2);
    }
  })
);
router.post(
  "/student/info/email",
  typed({
    schemas: {
      input: import_zod3.z.object({ email: import_zod3.z.string() })
    },
    context: protect("ENTREPRISE"),
    async handler({ input }) {
      const { email } = input;
      const users2 = await client.user.findUnique({
        where: {
          email
        }
      });
      if (users2) {
        return new ApiResponse(users2);
      } else {
        return new ApiResponse({
          status: "error",
          message: "User not found"
        });
      }
    }
  })
);
router.get(
  "/get/ownership",
  typed({
    context: protect(),
    // Use authentication context
    async handler({ ctx }) {
      const disponibilites = await client.ownership.findMany({
        where: {
          ownerId: ctx.id
        }
      });
      return new ApiResponse(disponibilites);
    }
  })
);
router.get(
  "/get/ownership/:id",
  typed({
    schemas: {
      params: import_zod3.z.object({
        id: import_zod3.z.string()
      })
    },
    context: protect(),
    // Use authentication context
    async handler({ params, ctx }) {
      const disponibilites = await client.ownership.findMany({
        where: {
          userId: params.id
        },
        include: { owner: true }
      });
      return new ApiResponse(disponibilites);
    }
  })
);
router.get(
  "/get/ownership/owner/:id",
  typed({
    schemas: {
      params: import_zod3.z.object({
        id: import_zod3.z.string()
      })
    },
    context: protect(),
    // Use authentication context
    async handler({ params, ctx }) {
      const disponibilites = await client.ownership.findMany({
        where: {
          ownerId: params.id
        },
        include: { owner: true, user: true }
      });
      return new ApiResponse(disponibilites);
    }
  })
);
router.patch(
  "/update-status/:id",
  typed({
    schemas: {
      params: import_zod3.z.object({
        id: import_zod3.z.string()
      }),
      input: import_zod3.z.object({
        active: import_zod3.z.boolean()
      })
    },
    async handler({ params, input }) {
      const { id } = params;
      const { active } = input;
      try {
        const updatedUser = await client.user.update({
          where: { id },
          data: { active }
        });
        return new ApiResponse({
          success: true,
          message: `User ${active ? "activated" : "deactivated"} successfully.`,
          data: { userId: id, active: updatedUser.active }
        });
      } catch (error) {
        console.error("Error updating user status:", error);
        throw new ApiError("Failed to update user status");
      }
    }
  })
);
router.get(
  "/get/:id",
  typed({
    schemas: {
      params: import_zod3.z.object({
        id: import_zod3.z.string()
      })
    },
    async handler({ params }) {
      const user = await client.user.findUnique({
        where: {
          id: params.id
        },
        include: { forfait: true }
      });
      if (!user)
        throw new ApiError("Cet utilisateur n'existe pas");
      return new ApiResponse(user);
    }
  })
);
router.post(
  "/create",
  typed({
    schemas: {
      input: createUser
    },
    context: protect(),
    async handler({ input, ctx }) {
      var _b;
      const _a = input, { email } = _a, data = __objRest(_a, ["email"]);
      const id = (0, import_cuid2.createId)();
      const normalizedEmail = email.toLowerCase();
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const passwordResetToken = Math.random().toString(36).slice(2);
      const resetPasswordExpiry = Date.now() + 48 * 3600 * 1e3;
      const user = await client.user.create({
        data: __spreadProps(__spreadValues({}, data), {
          email: normalizedEmail,
          id,
          password: hashedPassword,
          resetPasswordToken: passwordResetToken,
          resetPasswordExpiry,
          userType: input.userType,
          companyName: input.companyName,
          etage: input.etage,
          code_acces: input.code_acces,
          code_acces_supplementaire: input.code_acces_supplementaire,
          interphone: input.interphone,
          creatorId: ctx == null ? void 0 : ctx.id
        })
      });
      const transporter = import_nodemailer.default.createTransport({
        host: "smtp.ionos.fr",
        port: 465,
        secure: true,
        auth: {
          user: "ne-pas-repondre@myrendev.com",
          pass: "Liamedia2608150155@"
        }
      });
      const mailOptions = {
        from: "ne-pas-repondre@myrendev.com",
        to: user.email,
        subject: "Bienvenue sur Notre Plateforme!",
        text: `${process.env.APP_URL}reset-password/${passwordResetToken}`,
        html: `
        <div style="text-align: center;">
          <h1 style="color: #111;">Bienvenue sur Notre Plateforme!</h1>
          <p>Votre compte a \xE9t\xE9 cr\xE9\xE9 avec succ\xE8s.</p>
          <p>Veuillez noter vos informations de connexion :</p>
          <p><strong>Email:</strong> ${normalizedEmail}</p>
          <p><strong>Mot de passe:</strong> ${input.password}</p>
          <p>Veuillez compl\xE9ter votre inscription en configurant votre mot de passe :</p>
          <a href="${process.env.APP_URL}reset-password/${passwordResetToken}" style="display: inline-block; background-color: #111; color: white; padding: 10px 20px; margin: 10px 0; border-radius: 5px; text-decoration: none;">Configurer le Mot de Passe</a>
          <p>Ce lien expirera dans 48 heures.</p>
        </div>
      `
      };
      const ownership = await client.ownership.create({
        data: {
          ownerName: (_b = ctx.name_entreprise) != null ? _b : "",
          user: {
            connect: {
              id
            }
          },
          owner: {
            connect: {
              id: ctx.id
            }
          }
        }
      });
      return new ApiResponse(user);
    }
  })
);
router.post(
  "/assign-client",
  typed({
    schemas: {
      input: addOwner
    },
    context: protect(),
    async handler({ input, ctx }) {
      var _a;
      try {
        const { clientId } = input;
        const ownerId = ctx.id;
        const ownership = await client.ownership.create({
          data: {
            ownerName: (_a = ctx.name_entreprise) != null ? _a : "",
            user: {
              connect: {
                id: clientId
              }
            },
            owner: {
              connect: {
                id: ownerId
              }
            }
          }
        });
        const responseData = {
          ownership,
          message: "Client attribu\xE9 avec succ\xE8s"
        };
        return new ApiResponse(responseData, 200);
      } catch (error) {
        console.error(
          "Erreur lors de l'attribution du client :",
          error
        );
        throw new Error("Impossible d'attribuer le client");
      }
    }
  })
);
var prisma = new import_client2.PrismaClient();
var storage = import_multer.default.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-between" + file.originalname);
  }
});
var upload = (0, import_multer.default)({ storage });
router.post(
  "/create/monitor",
  upload.single("file"),
  typed({
    schemas: {
      input: createMonitor
    },
    context: protect("ENTREPRISE"),
    async handler({ input, ctx, req }) {
      var _b, _c;
      const _a = input, { email } = _a, userData = __objRest(_a, ["email"]);
      const normalizedEmail = email.toLowerCase();
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const passwordResetToken = Math.random().toString(36).slice(2);
      const resetPasswordExpiry = Date.now() + 48 * 3600 * 1e3;
      const user = await prisma.user.create({
        data: __spreadProps(__spreadValues({}, userData), {
          email: normalizedEmail,
          password: hashedPassword,
          type: "MONITOR",
          resetPasswordToken: passwordResetToken,
          resetPasswordExpiry,
          creatorId: ctx == null ? void 0 : ctx.id
        })
      });
      if ((_b = req.body) == null ? void 0 : _b.filename) {
        await prisma.file.create({
          data: {
            filename: req.body.filename,
            originalFilename: req.body.originalname,
            userId: user.id
          }
        });
      }
      const transporter = import_nodemailer.default.createTransport({
        host: "smtp.ionos.fr",
        port: 465,
        secure: true,
        auth: {
          user: "ne-pas-repondre@myrendev.com",
          pass: "Liamedia2608150155@"
        }
      });
      const mailOptions = {
        from: "ne-pas-repondre@myrendev.com",
        to: user.email,
        subject: "Bienvenue sur Notre Plateforme!",
        text: `${process.env.APP_URL}reset-password/${passwordResetToken}`,
        html: `
          <div style="text-align: center;">
            <h1 style="color: #111;">Bienvenue sur Notre Plateforme!</h1>
            <p>Votre compte a \xE9t\xE9 cr\xE9\xE9 avec succ\xE8s.</p>
            <p>Veuillez noter vos informations de connexion :</p>
            <p><strong>Email:</strong> ${normalizedEmail}</p>
            <p><strong>Mot de passe:</strong> ${userData.password}</p>
            <p>Veuillez compl\xE9ter votre inscription en configurant votre mot de passe :</p>
            <a href="${process.env.APP_URL}reset-password/${passwordResetToken}" style="display: inline-block; background-color: #111; color: white; padding: 10px 20px; margin: 10px 0; border-radius: 5px; text-decoration: none;">Configurer le Mot de Passe</a>
            <p>Ce lien expirera dans 48 heures.</p>
          </div>
        `
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(`Error sending email: ${error}`);
        } else {
          console.log(`Email sent: ${info.response}`);
        }
      });
      await prisma.ownership.create({
        data: {
          ownerName: (_c = ctx.name_entreprise) != null ? _c : "",
          user: {
            connect: {
              id: user.id
            }
          },
          owner: {
            connect: {
              id: ctx.id
              // Assuming ctx.id is the entreprise's ID
            }
          }
        }
      });
      return new ApiResponse(user);
    }
  })
);
router.get("/api/files", async (req, res) => {
  const monitorId = req.query.monitorId;
  if (!monitorId || typeof monitorId !== "string") {
    return res.status(400).json({ error: "Monitor ID is required and must be a string" });
  }
  try {
    const files = await prisma.file.findMany({
      where: { userId: monitorId },
      select: {
        filename: true,
        originalFilename: true
        // Include this field if it exists in your schema
      }
    });
    res.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post(
  "/create/commercial",
  typed({
    schemas: {
      input: createCommercial
    },
    context: protect(),
    async handler({ input, ctx }) {
      const _a = input, { email } = _a, userData = __objRest(_a, ["email"]);
      const normalizedEmail = email.toLowerCase();
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await client.user.create({
        data: __spreadProps(__spreadValues({}, userData), {
          email: normalizedEmail,
          password: hashedPassword,
          type: "COMMERCIAL",
          creatorId: ctx == null ? void 0 : ctx.id
        })
      });
      const transporter = import_nodemailer.default.createTransport({
        host: "smtp.ionos.fr",
        port: 465,
        secure: true,
        auth: {
          user: "ne-pas-repondre@myrendev.com",
          pass: "Liamedia2608150155@"
        }
      });
      const mailOptions = {
        from: "ne-pas-repondre@myrendev.com",
        to: user.email,
        subject: "Bienvenue sur Notre Plateforme!",
        html: `
          <div style="text-align: center;">
            <h1 style="color: #111;">Bienvenue sur Notre Plateforme!</h1>
            <p>Votre compte commercial a \xE9t\xE9 cr\xE9\xE9 avec succ\xE8s.</p>
            <p>Veuillez noter vos informations de connexion :</p>
            <p><strong>Email:</strong> ${normalizedEmail}</p>
            <p><strong>Mot de passe:</strong> ${userData.password}</p>
            <p>Vous pouvez d\xE9sormais vous connecter \xE0 votre compte.</p>
          </div>
        `
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(`Error sending email: ${error}`);
        } else {
          console.log(`Email sent: ${info.response}`);
        }
      });
      return new ApiResponse(user);
    }
  })
);
router.post(
  "/create/entreprise",
  typed({
    schemas: {
      input: createEntreprise
    },
    context: protect(),
    async handler({ input, ctx }) {
      const _a = input, { email } = _a, userData = __objRest(_a, ["email"]);
      const normalizedEmail = email.toLowerCase();
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const passwordResetToken = Math.random().toString(36).slice(2);
      const user = await client.user.create({
        data: __spreadProps(__spreadValues({}, userData), {
          email: normalizedEmail,
          password: hashedPassword,
          type: "ENTREPRISE",
          resetPasswordToken: passwordResetToken,
          resetPasswordExpiry: Date.now() + 48 * 3600 * 1e3,
          creatorId: ctx == null ? void 0 : ctx.id
        })
      });
      const transporter = import_nodemailer.default.createTransport({
        host: "smtp.ionos.fr",
        port: 465,
        secure: true,
        auth: {
          user: "ne-pas-repondre@myrendev.com",
          pass: "Liamedia2608150155@"
        }
      });
      const mailOptions = {
        from: "ne-pas-repondre@myrendev.com",
        to: user.email,
        subject: "Compl\xE9tez Votre Inscription",
        text: `${process.env.APP_URL}reset-password/${passwordResetToken}`,
        html: `
        <div style="text-align: center;">
          <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 50px;">
          <h1 style="color: #111;">Bienvenue sur Notre Plateforme!</h1>
          <p>Votre compte a \xE9t\xE9 cr\xE9\xE9. Veuillez noter votre mot de passe pour la connexion :</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Mot de passe:</strong> ${userData.password}</p>
          <p>Veuillez compl\xE9ter votre inscription en configurant votre mot de passe :</p>
          <a href="${process.env.APP_URL}reset-password/${passwordResetToken}" style="display: inline-block; background-color: #111; color: white; padding: 10px 20px; margin: 10px 0; border-radius: 5px; text-decoration: none;">Configurer le Mot de Passe</a>
          <p>Ce lien expirera dans 48 heures.</p>
        </div>
        `
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(`Error sending email: ${error}`);
        } else {
          console.log(`Email sent: ${info.response}`);
        }
      });
      return new ApiResponse(user);
    }
  })
);
router.patch(
  "/update/:id",
  typed({
    schemas: {
      params: import_zod3.z.object({
        id: import_zod3.z.string()
      }),
      input: updateUser
    },
    async handler({ params, input }) {
      try {
        const existingUser = await client.user.findUnique({
          where: {
            id: params.id
          }
        });
        if (!existingUser) {
          throw new ApiError("Cet utilisateur n'existe pas");
        }
        const updatedUser = await client.user.update({
          where: {
            id: params.id
          },
          data: input
        });
        return new ApiResponse({
          success: true
        });
      } catch (error) {
        console.error("Error:", error);
        return new ApiError(
          "Une erreur s'est produite lors de la mise \xE0 jour de l'utilisateur"
        );
      }
    }
  })
);
router.patch(
  "/update/monitor/:id",
  typed({
    schemas: {
      params: import_zod3.z.object({
        id: import_zod3.z.string()
      }),
      input: updateMonitor
      // Use the updateUser schema for request body validation
    },
    async handler({ params, input }) {
      try {
        const existingUser = await client.user.findUnique({
          where: {
            id: params.id
          }
        });
        if (!existingUser) {
          throw new ApiError("Cet utilisateur n'existe pas");
        }
        const updatedUser = await client.user.update({
          where: {
            id: params.id
          },
          data: input
        });
        return new ApiResponse({
          success: true
        });
      } catch (error) {
        return new ApiError(
          "Une erreur s'est produite lors de la mise \xE0 jour de l'utilisateur"
        );
      }
    }
  })
);
router.patch(
  "/update/entreprise/:id",
  typed({
    schemas: {
      params: import_zod3.z.object({
        id: import_zod3.z.string()
      }),
      input: updateEntreprise
      // Use the updateUser schema for request body validation
    },
    async handler({ params, input }) {
      try {
        const existingUser = await client.user.findUnique({
          where: {
            id: params.id
          }
        });
        if (!existingUser) {
          throw new ApiError("Cet utilisateur n'existe pas");
        }
        const updatedUser = await client.user.update({
          where: {
            id: params.id
          },
          data: input
        });
        return new ApiResponse({
          success: true
        });
      } catch (error) {
        return new ApiError(
          "Une erreur s'est produite lors de la mise \xE0 jour de l'utilisateur"
        );
      }
    }
  })
);
router.post(
  "/availability",
  typed({
    context: protect(),
    schemas: {
      input: import_zod3.z.object({
        days: import_zod3.z.record(daySchema),
        // Utilisation de z.record pour un objet avec des clés de type string
        monitorId: import_zod3.z.string()
      })
    },
    async handler({ ctx, input }) {
      try {
        const { days, monitorId } = input;
        const promises = Object.entries(days).map(
          async ([day, value]) => {
            const intervals = (value == null ? void 0 : value.interval) || [];
            const availabilityMatch = await client.availability.findFirst({
              where: {
                day,
                monitor: {
                  id: monitorId
                }
              }
            });
            if (!availabilityMatch) {
              return client.availability.create({
                data: {
                  day,
                  intervals,
                  monitor: {
                    connect: {
                      id: monitorId
                    }
                  }
                }
              });
            } else {
              return client.availability.update({
                where: {
                  id: availabilityMatch.id
                },
                data: {
                  intervals
                }
              });
            }
          }
        );
        await Promise.all(promises);
        return new ApiResponse({ success: true });
      } catch (error) {
        throw new Error("Failed to handle availability");
      }
    }
  })
);
router.get(
  "/availability/:monitorId",
  typed({
    schemas: {
      params: import_zod3.z.object({
        monitorId: import_zod3.z.string()
      })
    },
    async handler({ params }) {
      try {
        const { monitorId } = params;
        const availability = await client.availability.findMany({
          where: {
            monitor: {
              id: monitorId
            }
          }
        });
        return new ApiResponse({
          success: true,
          data: availability
        });
      } catch (error) {
        console.error("Error fetching availability:", error);
        throw new Error("Failed to fetch availability");
      }
    }
  })
);
router.get(
  "/get/availability/all",
  typed({
    context: protect("ENTREPRISE"),
    async handler({ ctx }) {
      try {
        const availability = await client.availability.findMany({
          where: {
            monitor: {
              clients: {
                some: {
                  owner: {
                    id: ctx.id
                  }
                }
              }
            }
          },
          include: {
            monitor: true
          }
        });
        return new ApiResponse(availability);
      } catch (error) {
        console.error("Une erreur est survenue :", error);
        return new ApiResponse({ success: false });
      }
    }
  })
);
router.delete(
  "/delete/:id",
  typed({
    schemas: {
      params: import_zod3.z.object({
        id: import_zod3.z.string()
      })
    },
    async handler({ params }) {
      const user = await client.user.findUnique({
        where: { id: params.id }
      });
      const transporter = import_nodemailer.default.createTransport({
        host: "smtp.ionos.fr",
        port: 465,
        secure: true,
        auth: {
          user: "ne-pas-repondre@myrendev.com",
          pass: "Liamedia2608150155@"
        }
      });
      const mailOptions = {
        from: "ne-pas-repondre@myrendev.com",
        to: user == null ? void 0 : user.email,
        subject: "Confirmation de la suppression de votre compte",
        text: "Compte supprim\xE9",
        html: `
        <div style="text-align: center;">
          <h1 style="color: #111;">Confirmation de la suppression de votre compte</h1>
          <p class="message">
              Bonjour,<br><br>
              Nous vous confirmons que votre compte a \xE9t\xE9 supprim\xE9 avec succ\xE8s. Nous sommes d\xE9sol\xE9s de vous voir partir.<br><br>
              Si vous avez des questions ou des pr\xE9occupations, n'h\xE9sitez pas \xE0 nous contacter.<br><br>
              Merci de nous avoir donn\xE9 l'opportunit\xE9 de vous servir.<br><br>
              Cordialement,<br>
              L'\xE9quipe Support
            </p>
             <p class="signature">
              ---
              <br>
              Vous recevez cet email car votre compte a \xE9t\xE9 supprim\xE9.
            </p>
        </div>
      `
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(`Error sending email: ${error}`);
        } else {
          console.log(`Email sent: ${info.response}`);
        }
      });
      await client.user.delete({ where: { id: params.id } });
      return new ApiResponse({
        success: true
      });
    }
  })
);
router.delete(
  "/ownership/delete/:id",
  typed({
    schemas: {
      params: import_zod3.z.object({
        id: import_zod3.z.string()
      })
    },
    async handler({ params }) {
      await client.ownership.delete({ where: { id: params.id } });
      return new ApiResponse({
        success: true
      });
    }
  })
);
router.get(
  "/unsubscribe/:id",
  typed({
    schemas: {
      params: import_zod3.z.object({
        id: import_zod3.z.string()
      })
    },
    async handler({ params }) {
      const { id } = params;
      try {
        await client.user.update({
          where: { id },
          data: { isSubscribed: false }
        });
        return new ApiResponse({
          message: "Utilisateur d\xE9sabonn\xE9 avec succ\xE8s."
        });
      } catch (error) {
        throw new ApiError("Erreur lors de la d\xE9sinscription.");
      }
    }
  })
);
router.get(
  "/:email",
  typed({
    schemas: {
      params: import_zod3.z.object({ email: import_zod3.z.string() })
    },
    context: protect(),
    async handler({ params }) {
      const user = await client.user.findUnique({
        where: {
          email: params.email
        }
      });
      if (!user) {
        throw new ApiError("Response not found", 404);
      }
      return new ApiResponse(user);
    }
  })
);

// src/router/auth/index.ts
var import_express2 = require("express");
var bcrypt2 = __toESM(require("bcrypt"));
var import_zod4 = require("zod");
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var router2 = (0, import_express2.Router)();
router2.get("/all", async (req, res) => {
});
router2.post(
  "/login",
  typed({
    schemas: {
      input: import_zod4.z.object({
        email: import_zod4.z.string().email(),
        password: import_zod4.z.string().min(8)
      })
    },
    async handler({ input }) {
      var _a, _b;
      const normalizedEmail = input.email.toLowerCase();
      const user = await client.user.findFirst({
        where: {
          email: normalizedEmail
          // Use the normalized email
        }
      });
      if (!user) {
        throw new ApiError("Cet utilisateur n'existe pas", 404);
      }
      if (!user.active) {
        throw new ApiError("Ce compte utilisateur est d\xE9sactiv\xE9", 403);
      }
      if (!await bcrypt2.compare(input.password, (_a = user.password) != null ? _a : "")) {
        throw new ApiError("Mot de passe incorrect", 404);
      }
      const token = import_jsonwebtoken2.default.sign(
        {
          user: __spreadProps(__spreadValues({}, user), {
            image: void 0,
            password: void 0
          })
        },
        (_b = process.env.SECRET) != null ? _b : "",
        { expiresIn: "1d" }
      );
      return new ApiResponse({ token });
    }
  })
);
router2.post(
  "/verify",
  typed({
    schemas: {
      input: import_zod4.z.object({
        token: import_zod4.z.string()
      })
    },
    async handler({ input }) {
      var _a;
      try {
        const payload = await import_jsonwebtoken2.default.verify(
          input.token,
          (_a = process.env.SECRET) != null ? _a : ""
        );
        if (typeof payload != "string") {
          return new ApiResponse({ success: true, data: payload });
        } else {
          throw new ApiError("not valid", 401);
        }
      } catch (error) {
        throw new ApiError("not valid", 401);
      }
    }
  })
);
router2.get(
  "/me",
  typed({
    context: protect(),
    async handler({ ctx }) {
      return new ApiResponse(
        __spreadProps(__spreadValues({}, ctx), {
          password: void 0
        })
        // {}
      );
    }
  })
);
router2.patch("/update/:id", (req, res) => {
});
router2.delete("/delete", (req, res) => {
});
router2.patch(
  "/updatePassword",
  typed({
    schemas: {
      input: import_zod4.z.object({
        newPassword: import_zod4.z.string().min(8)
      })
    },
    context: protect(),
    async handler({ input, ctx }) {
      const user = await client.user.findUnique({
        where: {
          id: ctx.id
        }
      });
      if (!user) {
        throw new ApiError("Cet utilisateur n'existe pas", 404);
      }
      const password = await bcrypt2.hash(input.newPassword, 10);
      const updatedUser = await client.user.update({
        where: {
          id: ctx.id
        },
        data: {
          password
        }
      });
      return new ApiResponse(updatedUser);
    }
  })
);
async function verifyPassword(inputPassword, userPassword) {
  if (!await bcrypt2.compare(inputPassword, userPassword)) {
    throw new ApiError("Mot de passe incorrect", 404);
  }
}
router2.post(
  "/verify-password",
  typed({
    schemas: {
      input: import_zod4.z.object({
        password: import_zod4.z.string()
      })
    },
    context: protect(),
    async handler({ input, ctx }) {
      var _a;
      try {
        console.log("ctx.id", ctx.id);
        const user = await client.user.findUnique({
          where: {
            id: ctx.id
          }
        });
        if (!user) {
          throw new ApiError("Cet utilisateur n'existe pas", 404);
        }
        await verifyPassword(input.password, (_a = user.password) != null ? _a : "");
        return new ApiResponse(
          { message: "Mot de passe v\xE9rifi\xE9 avec succ\xE8s" },
          200
        );
      } catch (error) {
        return new ApiResponse(
          {
            error: "Une erreur est survenue lors de la ve\u0301rification du mot de passe."
          },
          500
        );
      }
    }
  })
);

// src/index.ts
var import_multer4 = __toESM(require("multer"));
var import_path = __toESM(require("path"));

// src/router/forfait/index.ts
var import_express3 = require("express");

// src/router/forfait/schema.ts
var import_zod5 = require("zod");
var createForfait = import_zod5.z.object({
  name: import_zod5.z.string(),
  heure: import_zod5.z.number(),
  selectMorePeople: import_zod5.z.boolean(),
  numberOfPeople: import_zod5.z.number(),
  monitorId: import_zod5.z.string().optional()
  // Add this line
});
var updateForfait = import_zod5.z.object({
  name: import_zod5.z.string().optional(),
  heure: import_zod5.z.number().optional(),
  selectMorePeople: import_zod5.z.boolean().optional(),
  numberOfPeople: import_zod5.z.number().optional(),
  monitorId: import_zod5.z.any().optional()
  // Add this line
});

// src/router/forfait/index.ts
var import_zod6 = require("zod");
var router3 = (0, import_express3.Router)();
router3.get(
  "/all",
  typed({
    context: protect(),
    async handler(props) {
      const forfaits = await client.ownership.findMany({
        where: {
          owner: {
            id: props.ctx.id
          }
        },
        include: {
          forfait: {
            include: {
              monitor: true
              // Include monitor
            }
          }
        }
      });
      const forfaitsList = forfaits.map((o) => o.forfait).filter(Boolean);
      return new ApiResponse(forfaitsList);
    }
  })
);
router3.get(
  "/:id",
  typed({
    schemas: {
      params: import_zod6.z.object({
        id: import_zod6.z.string()
      })
    },
    context: protect(),
    async handler({ params, ctx }) {
      const forfait = await client.forfait.findUnique({
        where: {
          id: params.id
        }
      });
      if (!forfait) {
        throw new ApiError("Ce forfait n'existe pas");
      }
      return new ApiResponse(forfait);
    }
  })
);
router3.post(
  "/create",
  typed({
    schemas: { input: createForfait },
    context: protect(),
    async handler({ input, ctx }) {
      try {
        const forfait = await client.ownership.create({
          data: {
            owner: {
              connect: {
                id: ctx.id
              }
            },
            forfait: {
              create: input
            }
          },
          include: {
            forfait: true
          }
        });
        return new ApiResponse(forfait);
      } catch (error) {
        console.error("Error during forfait creation:", error);
        return new ApiError(
          "Une erreur s'est produite lors de la cr\xE9ation du forfait"
        );
      }
    }
  })
);
router3.patch(
  "/update/:id",
  typed({
    schemas: {
      params: import_zod6.z.object({
        id: import_zod6.z.string()
      }),
      input: updateForfait
      // Schéma pour la validation du corps de la requête
    },
    async handler({ params, input }) {
      try {
        const existingForfait = await client.forfait.findUnique({
          where: {
            id: params.id
          }
        });
        if (!existingForfait) {
          throw new ApiError("Ce forfait n'existe pas");
        }
        await client.forfait.update({
          where: {
            id: params.id
          },
          data: __spreadValues({}, input)
        });
        return new ApiResponse({
          success: true
        });
      } catch (error) {
        console.error(error);
        return new ApiError(
          "Une erreur s'est produite lors de la mise \xE0 jour du forfait"
        );
      }
    }
  })
);
router3.delete(
  "/delete/:id",
  typed({
    schemas: {
      params: import_zod6.z.object({
        id: import_zod6.z.string()
      })
    },
    async handler({ params }) {
      await client.forfait.delete({ where: { id: params.id } });
      return new ApiResponse({
        success: true
      });
    }
  })
);

// src/index.ts
var import_jsonwebtoken5 = __toESM(require("jsonwebtoken"));
var import_dotenv = require("dotenv");

// src/router/vehicule/index.ts
var import_express4 = require("express");

// src/router/vehicule/schema.ts
var import_zod7 = require("zod");
var createVehicule = import_zod7.z.object({
  vehicleBrand: import_zod7.z.string(),
  vehiculeType: import_zod7.z.enum(["Voiture", "Moto"]),
  plate: import_zod7.z.string(),
  type: import_zod7.z.enum(["MANUEL", "AUTOMATIQUE"]),
  monitorId: import_zod7.z.string().optional(),
  startDate: import_zod7.z.string().optional(),
  endDate: import_zod7.z.string().optional(),
  entrepriseId: import_zod7.z.string().optional(),
  carteGris: import_zod7.z.string().optional(),
  assurance: import_zod7.z.string().optional(),
  permis: import_zod7.z.string().optional()
});
var updateVehicule = import_zod7.z.object({
  vehicleBrand: import_zod7.z.string().optional(),
  vehiculeType: import_zod7.z.enum(["Voiture", "Moto"]).optional(),
  plate: import_zod7.z.string().optional(),
  type: import_zod7.z.enum(["MANUEL", "AUTOMATIQUE"]).optional(),
  monitorId: import_zod7.z.string().optional(),
  carteGris: import_zod7.z.string().optional(),
  assurance: import_zod7.z.string().optional(),
  permis: import_zod7.z.string().optional()
});

// src/router/vehicule/index.ts
var import_zod8 = require("zod");
var import_multer2 = __toESM(require("multer"));
var import_client3 = require("@prisma/client");
var router4 = (0, import_express4.Router)();
router4.get(
  "/all",
  typed({
    context: protect(),
    async handler({ ctx }) {
      const vehicules = await client.vehicule.findMany({
        include: {
          entreprise: true,
          monitor: true
          // Include this line to fetch associated monitor data
        },
        where: {
          entrepriseId: ctx.id
        }
      });
      return new ApiResponse(vehicules);
    }
  })
);
router4.get(
  "/:id",
  typed({
    schemas: {
      params: import_zod8.z.object({
        id: import_zod8.z.string()
      })
    },
    async handler({ params }) {
      const vehicule = await client.vehicule.findUnique({
        where: {
          id: params.id
        }
      });
      if (!vehicule) {
        throw new ApiError("Ce forfait n'existe pas");
      }
      return new ApiResponse(vehicule);
    }
  })
);
var prisma2 = new import_client3.PrismaClient();
var storage2 = import_multer2.default.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});
var upload2 = (0, import_multer2.default)({ storage: storage2 });
router4.post(
  "/create",
  upload2.array("files"),
  typed({
    context: protect(),
    schemas: { input: createVehicule },
    async handler({ input, ctx, req }) {
      try {
        if (!ctx || !ctx.id) {
          throw new Error("Context or Context ID is null");
        }
        const _a = input, { entrepriseId, monitorId } = _a, rest = __objRest(_a, ["entrepriseId", "monitorId"]);
        const vehiculeData = {
          plate: rest.plate,
          type: rest.type,
          vehicleBrand: rest.vehicleBrand,
          vehiculeType: rest.vehiculeType,
          startDate: rest.startDate,
          endDate: rest.endDate,
          entreprise: {
            connect: {
              id: ctx.id
            }
          },
          carteGris: rest == null ? void 0 : rest.carteGris,
          assurance: rest == null ? void 0 : rest.assurance,
          permis: rest == null ? void 0 : rest.permis
        };
        if (monitorId) {
          vehiculeData.monitor = {
            connect: {
              id: monitorId
            }
          };
        }
        const vehicule = await client.vehicule.create({
          data: vehiculeData
        });
        return new ApiResponse(vehicule);
      } catch (error) {
        console.error("Error creating vehicule:", error);
        throw error;
      }
    }
  })
);
router4.get("/api/files", async (req, res) => {
  const vehicleId = req.query.vehicleId;
  if (!vehicleId || typeof vehicleId !== "string") {
    return res.status(400).json({ error: "Vehicle ID is required and must be a string" });
  }
  try {
    const files = await prisma2.file.findMany({
      where: { vehiculeId: vehicleId },
      select: {
        filename: true,
        originalFilename: true
      }
    });
    res.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router4.patch(
  "/update/:id",
  typed({
    schemas: {
      params: import_zod8.z.object({
        id: import_zod8.z.string()
      }),
      input: updateVehicule
      // Use the updateUser schema for request body validation
    },
    async handler({ params, input }) {
      try {
        const existingVehicule = await client.vehicule.findUnique({
          where: {
            id: params.id
          }
        });
        if (!existingVehicule) {
          throw new ApiError("Ce Vehicule n'existe pas");
        }
        const updateVehicule2 = await client.vehicule.update({
          where: {
            id: params.id
          },
          data: input
        });
        return new ApiResponse({
          success: true
        });
      } catch (error) {
        return new ApiError(
          "Une erreur s'est produite lors de la mise \xE0 jour de l'utilisateur"
        );
      }
    }
  })
);
router4.delete(
  "/delete/:id",
  typed({
    schemas: {
      params: import_zod8.z.object({
        id: import_zod8.z.string()
      })
    },
    async handler({ params }) {
      await client.vehicule.delete({ where: { id: params.id } });
      return new ApiResponse({
        success: true
      });
    }
  })
);

// src/router/disponibilite/index.ts
var import_express5 = require("express");

// src/router/disponibilite/schema.ts
var import_zod9 = require("zod");
var MyTriStateEnum = import_zod9.z.enum(["TRUE", "FALSE", "PENDING"]);
var createDisponibilite = import_zod9.z.object({
  day: import_zod9.z.array(import_zod9.z.string()),
  from: import_zod9.z.string(),
  to: import_zod9.z.string(),
  extra: import_zod9.z.string().optional()
});
var updateDisponibilite = import_zod9.z.object({
  day: import_zod9.z.string().optional(),
  from: import_zod9.z.string().optional(),
  to: import_zod9.z.string().optional()
});
var createSuperposition = import_zod9.z.object({
  disabledDates: import_zod9.z.array(import_zod9.z.string()),
  selectedOption: import_zod9.z.string(),
  titre: import_zod9.z.string(),
  userId: import_zod9.z.string(),
  myTriState: MyTriStateEnum.optional(),
  reqToken: import_zod9.z.string().optional(),
  comment: import_zod9.z.string(),
  file: import_zod9.z.string().optional()
});

// src/router/disponibilite/index.ts
var import_zod10 = require("zod");
var router5 = (0, import_express5.Router)();
router5.get(
  "/all",
  typed({
    context: protect(),
    // Ensure user context is set correctly
    async handler({ ctx }) {
      const userId = ctx.id;
      const vehicules = await client.vehicule.findMany({
        where: {
          userId
          // Use the correct field as per your schema if different
        },
        include: {
          monitor: true
          // Includes monitor details; adjust as needed
        }
      });
      return new ApiResponse(vehicules);
    }
  })
);
router5.get(
  "/:id",
  typed({
    schemas: {
      params: import_zod10.z.object({
        id: import_zod10.z.string()
      })
    },
    async handler({ params }) {
      const disponibilite = await client.disponibilite.findUnique({
        where: {
          id: params.id
        }
      });
      if (!disponibilite) {
        throw new ApiError("Ce forfait n'existe pas");
      }
      return new ApiResponse(disponibilite);
    }
  })
);
router5.post(
  "/create",
  typed({
    schemas: {
      input: createDisponibilite
    },
    context: protect(),
    // Ensure the user is authenticated
    async handler({ input, ctx }) {
      const { day, from, to, extra } = input;
      const disponibilite = await client.disponibilite.create({
        data: __spreadProps(__spreadValues({}, input), {
          userId: ctx.id
          // Associate the new disponibilite with the authenticated user's ID
        })
      });
      return new ApiResponse(disponibilite);
    }
  })
);
router5.delete(
  "/delete/:id",
  typed({
    schemas: {
      params: import_zod10.z.object({
        id: import_zod10.z.string()
      })
    },
    async handler({ params }) {
      await client.disponibilite.delete({ where: { id: params.id } });
      return new ApiResponse({
        success: true
      });
    }
  })
);
router5.post(
  "/create/superposition",
  typed({
    schemas: {
      input: createSuperposition
    },
    context: protect(),
    async handler({ input, ctx }) {
      const savedSuperposition = await client.superposition.create({
        data: __spreadProps(__spreadValues({}, input), {
          enterpriseId: ctx.id,
          myTriState: "TRUE",
          reqToken: input.reqToken || ""
        })
      });
      return new ApiResponse(savedSuperposition);
    }
  })
);
router5.get(
  "/get/superposition",
  typed({
    context: protect(),
    // Use authentication context
    async handler({ ctx }) {
      const superpositions = await client.superposition.findMany({
        where: {
          enterpriseId: ctx.id
          // Filter by the authenticated user's ID
        },
        include: {
          user: true
        }
      });
      return new ApiResponse(superpositions);
    }
  })
);
router5.patch(
  "/update/superposition/:id",
  typed({
    context: protect(),
    schemas: {
      input: import_zod10.z.object({
        newDates: import_zod10.z.array(import_zod10.z.string()),
        titre: import_zod10.z.string(),
        userId: import_zod10.z.string(),
        comment: import_zod10.z.string(),
        file: import_zod10.z.string().optional()
      }),
      params: import_zod10.z.object({
        id: import_zod10.z.string()
      })
    },
    async handler({ params, input }) {
      try {
        const datesToUpdate = await client.superposition.update({
          where: { id: params.id },
          data: {
            disabledDates: input.newDates,
            titre: input == null ? void 0 : input.titre,
            userId: input == null ? void 0 : input.userId,
            comment: input == null ? void 0 : input.comment,
            file: input == null ? void 0 : input.file
          }
        });
        return new ApiResponse(datesToUpdate);
      } catch (error) {
        console.error(error);
        return new ApiResponse(
          { error: "Failed to update superposition" },
          500
        );
      }
    }
  })
);
router5.get(
  "/get/superposition/all",
  typed({
    context: protect(),
    // Use authentication context
    async handler({ ctx }) {
      const superpositions = await client.superposition.findMany();
      return new ApiResponse(superpositions);
    }
  })
);
router5.get(
  "/get/superposition/:id",
  typed({
    schemas: {
      params: import_zod10.z.object({
        id: import_zod10.z.string()
      })
    },
    context: protect(),
    // Use authentication context
    async handler({ params, ctx }) {
      const superpositions = await client.superposition.findUnique({
        where: {
          id: params.id
        },
        include: {
          user: true
        }
      });
      if (!superpositions) {
        return new ApiResponse({ error: "Superposition not found" });
      }
      return new ApiResponse(superpositions);
    }
  })
);
router5.get(
  "/get/superposition/entreprise/:entrepriseId/monitor/:monitorId",
  typed({
    schemas: {
      params: import_zod10.z.object({
        entrepriseId: import_zod10.z.string(),
        monitorId: import_zod10.z.string()
      })
    },
    async handler({ params }) {
      const superpositions = await client.superposition.findMany({
        where: {
          enterpriseId: params.entrepriseId,
          // Filter by the authenticated user's ID
          userId: params.monitorId
        },
        select: {
          disabledDates: true
        }
      });
      return new ApiResponse(superpositions);
    }
  })
);
router5.get(
  "/get/disponibilite",
  typed({
    context: protect(),
    // Use authentication context
    async handler({ ctx }) {
      const disponibilites = await client.disponibilite.findMany({
        where: {
          userId: ctx.id
          // Filter by the authenticated user's ID
        }
      });
      return new ApiResponse(disponibilites);
    }
  })
);
router5.delete(
  "/deletes/:id",
  typed({
    schemas: {
      params: import_zod10.z.object({
        id: import_zod10.z.string()
      })
    },
    async handler({ params }) {
      await client.superposition.delete({ where: { id: params.id } });
      return new ApiResponse({
        success: true
      });
    }
  })
);
router5.delete(
  "/deleteDisponibilite/:id",
  typed({
    schemas: {
      params: import_zod10.z.object({
        id: import_zod10.z.string()
      })
    },
    async handler({ params }) {
      await client.disponibilite.delete({ where: { id: params.id } });
      return new ApiResponse({
        success: true
      });
    }
  })
);

// src/seed/index.ts
var import_bcrypt = __toESM(require("bcrypt"));
async function seed() {
  const connectionMessage = await checkDatabaseConnection();
  console.log(connectionMessage);
  await users([
    {
      email: "student1@example.com",
      password: "student1pass",
      name: "John",
      lastname: "Doe",
      type: "STUDENTS"
    },
    {
      email: "student2@example.com",
      password: "student2pass",
      name: "Jane",
      lastname: "Smith",
      type: "STUDENTS"
    },
    {
      email: "monitor1@example.com",
      password: "monitor1pass",
      name: "Robert",
      lastname: "Johnson",
      type: "MONITOR"
    },
    {
      email: "admin@example.com",
      password: "adminpass",
      name: "Admin",
      lastname: "User",
      type: "ADMIN"
    },
    {
      email: "commercial@example.com",
      password: "commercialpass",
      name: "Sarah",
      lastname: "Brown",
      type: "COMMERCIAL"
    },
    {
      email: "enterprise1@example.com",
      password: "enterprisepass",
      name_entreprise: "Enterprise1",
      name_manager: "Manager",
      name: "Michael",
      lastname: "Williams",
      type: "ENTREPRISE"
    },
    {
      email: "enterprise2@example.com",
      password: "enterprisepass",
      name_entreprise: "Enterprise2",
      name_manager: "Manager",
      name: "Michael",
      lastname: "Williams",
      type: "ENTREPRISE"
    }
  ]);
  console.log("Seeding complete");
}
async function users(data) {
  for (const user of data) {
    const currentUser = await client.user.findUnique({
      where: {
        email: user.email
      }
    });
    if (currentUser)
      continue;
    await client.user.create({
      data: __spreadProps(__spreadValues({}, user), { password: await import_bcrypt.default.hash(user.password, 10) })
    });
    console.log(`Creating user: ${user.email}`);
  }
}
async function checkDatabaseConnection() {
  try {
    const response2 = await client.$queryRaw`SELECT 1`;
    console.log("Database connection successful.");
    return "Database connection successful.";
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    return "Failed to connect to the database.";
  }
}

// src/router/rendezvous/index.ts
var import_express6 = require("express");

// src/router/rendezvous/schema.ts
var import_zod11 = require("zod");
var createRendezvous = import_zod11.z.object({
  title: import_zod11.z.string(),
  dateTime: import_zod11.z.string(),
  description: import_zod11.z.string().optional(),
  clientId: import_zod11.z.string().optional(),
  forfaitId: import_zod11.z.string(),
  monitorId: import_zod11.z.string(),
  creneau: import_zod11.z.string(),
  creator: import_zod11.z.string().optional(),
  enterpriseName: import_zod11.z.string().optional(),
  entrepriseId: import_zod11.z.string().optional(),
  enterpriseContact: import_zod11.z.array(import_zod11.z.string()).optional(),
  relationKey: import_zod11.z.string().optional(),
  isValid: import_zod11.z.boolean().optional(),
  duration: import_zod11.z.string().optional(),
  price: import_zod11.z.string().optional()
});
var updateRendezvous = import_zod11.z.object({
  rendezvousId: import_zod11.z.string(),
  // ID of the rendezvous to update
  title: import_zod11.z.string().optional(),
  // Optional fields that can be updated
  dateTime: import_zod11.z.string().optional(),
  description: import_zod11.z.string().optional(),
  clientId: import_zod11.z.string().optional(),
  forfaitId: import_zod11.z.string().optional(),
  monitorId: import_zod11.z.string().optional(),
  creneau: import_zod11.z.string().optional(),
  creator: import_zod11.z.string().optional(),
  enterpriseName: import_zod11.z.string().optional(),
  entrepriseId: import_zod11.z.string().optional(),
  images: import_zod11.z.array(
    import_zod11.z.object({
      id: import_zod11.z.string(),
      // ID of the image to update
      filename: import_zod11.z.string().optional(),
      // Optional fields that can be updated
      rendezVousId: import_zod11.z.string()
      // ID of the rendezvous associated with the image
    })
  ).optional(),
  isValid: import_zod11.z.boolean().optional()
});
var updateSchedule = import_zod11.z.object({
  rendezvousId: import_zod11.z.string(),
  // ID of the rendezvous to update
  dateTime: import_zod11.z.string().optional(),
  creneau: import_zod11.z.string().optional()
});
var updateDate = import_zod11.z.object({
  //  rendezvousId: z.string(), // ID of the rendezvous to update
  dateTime: import_zod11.z.string().optional()
  // params: z.object({
  //   id: z.string(), // Define id as a string parameter
  // }),
});
var majRendezVous = import_zod11.z.object({
  dateTime: import_zod11.z.string().optional(),
  creneau: import_zod11.z.string().optional(),
  relationKey: import_zod11.z.string().optional(),
  isValid: import_zod11.z.boolean().optional(),
  creator: import_zod11.z.string().optional()
});

// src/router/rendezvous/index.ts
var import_zod12 = require("zod");
var import_nodemailer2 = __toESM(require("nodemailer"));
var import_client4 = require("@prisma/client");
var import_multer3 = __toESM(require("multer"));
var router6 = (0, import_express6.Router)();
var prisma3 = new import_client4.PrismaClient();
var { v4: uuidv4 } = require("uuid");
router6.post(
  "/send-mail-to-student",
  typed({
    context: protect(),
    schemas: {
      input: import_zod12.z.object({
        email: import_zod12.z.string().email(),
        available: import_zod12.z.any().optional(),
        // Call optional() method here
        days: import_zod12.z.string().optional(),
        // Call optional() method here
        date: import_zod12.z.string().optional(),
        // Include the date parameter
        key: import_zod12.z.string().optional(),
        // Call optional() method here
        relationKey: import_zod12.z.string(),
        tempsInter: import_zod12.z.number().optional(),
        options: import_zod12.z.array(import_zod12.z.string()).optional(),
        staffIds: import_zod12.z.array(import_zod12.z.string()).optional()
      })
    },
    async handler({ input, ctx }) {
      const token = uuidv4();
      const { email } = input;
      const smtpConfig = {
        host: "smtp.ionos.fr",
        port: 465,
        secure: true,
        auth: {
          user: "ne-pas-repondre@myrendev.com",
          pass: "Liamedia2608150155@"
        }
      };
      const expirationPeriod = 24 * 60 * 60 * 1e3;
      const transporter = import_nodemailer2.default.createTransport(smtpConfig);
      await prisma3.choiceClient.create({
        data: {
          available: input.available,
          days: input.days,
          // Using non-null assertion operator (!)
          date: input.date,
          key: token,
          relationKey: input.relationKey,
          tempsInter: input.tempsInter,
          options: input.options,
          staffIds: input.staffIds
        }
      });
      await prisma3.token.create({
        data: {
          token,
          email,
          isAccessed: false,
          expiresAt: new Date(Date.now() + expirationPeriod)
          // choiceClientId: choiceClient.id,
        }
      });
      const entreprisename = await prisma3.user.findUnique({
        where: {
          id: ctx.id
        },
        select: {
          name_entreprise: true
        }
      });
      const mailOptions = {
        from: "ne-pas-repondre@myrendev.com",
        to: email,
        subject: "Invitation pour prendre un rendez-vous",
        html: `
          <div style="text-align: center;">
            <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 50px;">
            <h1 style="color: #111;">Veuillez Cliquer sur le lien pour prendre un rendez-vous</h1>
            <p>L'entreprise ${entreprisename == null ? void 0 : entreprisename.name_entreprise} vous \xE0 demand\xE9 de prendre un RDV sur <strong>MyRendev</strong>. Pour proc\xE9der, veuillez cliquer sur le lien ci-dessous.</p>
            <a href="${process.env.APP_URL}rendezvousclient?token=${token}" style="display: inline-block; background-color: #111; color: white; padding: 10px 20px; margin: 10px 0; border-radius: 5px; text-decoration: none;">Prendre un Rendez-vous</a>
          </div>
        `
      };
      try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
        return new ApiResponse({
          message: "Email envoy\xE9 avec succ\xE8s"
        });
      } catch (error) {
        console.error("Error sending email:", error);
        throw new ApiError("Erreur lors de l'envoi de l'e-mail");
      }
    }
  })
);
router6.post("/validatetoken/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const foundToken = await prisma3.token.findUnique({
      where: { token }
    });
    if (!foundToken) {
      return res.status(404).json({ message: "Token not found" });
    }
    if (/* @__PURE__ */ new Date() > foundToken.expiresAt) {
      return res.status(400).json({ message: "Token has expired" });
    }
    res.json({
      message: "Token validated successfully",
      slotConfirmed: foundToken.slotConfirmed,
      // Return slotConfirmed status
      email: foundToken.email
      // Include the email associated with the token
    });
  } catch (error) {
    console.error("Error validating token:", error);
    res.status(500).json({ message: "An error occurred while validating the token" });
  }
});
router6.patch("/confirmedToken/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const updatedToken = await client.token.update({
      where: { token },
      data: { slotConfirmed: true }
      // Example: deactivating by setting 'active' to false
    });
    return new ApiResponse(updatedToken);
  } catch (error) {
    console.error("Error validating token:", error);
    res.status(500).json({ message: "An error occurred while validating the token" });
  }
});
router6.get(
  "/all",
  typed({
    context: protect("ENTREPRISE"),
    async handler({ ctx, params, input }) {
      const rendezvous = await client.rendezVous.findMany({
        where: {
          owner: {
            owner: {
              id: ctx.id
            }
          }
        },
        include: {
          client: true,
          forfait: true,
          monitor: true
          // images: true, // Include images
        }
      });
      return new ApiResponse(rendezvous);
    }
  })
);
router6.get(
  "/:enterpriseId/monitor/:monitorId",
  typed({
    schemas: {
      params: import_zod12.z.object({
        enterpriseId: import_zod12.z.string(),
        monitorId: import_zod12.z.string()
      })
    },
    async handler({ params }) {
      const rendezvous = await client.rendezVous.findMany({
        where: {
          enterpriseId: params.enterpriseId,
          monitor: {
            id: params.monitorId
          }
        },
        select: {
          dateTime: true,
          creneau: true,
          duration: true
        }
      });
      return new ApiResponse(rendezvous);
    }
  })
);
router6.get(
  "/:id",
  typed({
    schemas: {
      params: import_zod12.z.object({
        id: import_zod12.z.string()
      })
    },
    context: protect(),
    async handler({ ctx, params, input }) {
      const rendezvous = await client.rendezVous.findUnique({
        where: {
          id: params.id
        }
      });
      if (!rendezvous) {
        throw new ApiError("Ce rendezvous n'existe pas");
      }
      return new ApiResponse(rendezvous);
    }
  })
);
router6.get(
  "/get/byClient/:id",
  typed({
    schemas: {
      params: import_zod12.z.object({
        id: import_zod12.z.string()
      })
    },
    context: protect(),
    async handler({ ctx, params, input }) {
      const rendezvous = await client.rendezVous.findMany({
        where: {
          clientId: params.id
        },
        include: {
          client: true
          // images: true,
        }
      });
      if (!rendezvous) {
        throw new ApiError("Ce rendezvous n'existe pas");
      }
      return new ApiResponse(rendezvous);
    }
  })
);
router6.get(
  "/get/byEmployee/:id",
  typed({
    schemas: {
      params: import_zod12.z.object({
        id: import_zod12.z.string()
      })
    },
    context: protect(),
    async handler({ ctx, params, input }) {
      const rendezvous = await client.rendezVous.findMany({
        where: {
          monitorId: params.id
        },
        include: {
          client: true
        }
      });
      if (!rendezvous) {
        throw new ApiError("Ce rendezvous n'existe pas");
      }
      return new ApiResponse(rendezvous);
    }
  })
);
var storage3 = import_multer3.default.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});
var upload3 = (0, import_multer3.default)({ storage: storage3 });
router6.post(
  "/create",
  upload3.array("files", 10),
  // Handle multiple file uploads
  typed({
    context: protect(),
    schemas: { input: createRendezvous },
    async handler({ input, ctx, req }) {
      var _a, _b, _c, _d, _e, _f, _g;
      try {
        const rest = __objRest(input, []);
        const creneau = rest.creneau;
        const dateTime = rest.dateTime;
        const isValidVerif = rest.isValid === void 0 ? true : false;
        const forfait = await prisma3.forfait.findUnique({
          where: { id: rest.forfaitId },
          select: { name: true, heure: true }
          // Only select the name
        });
        const rendezvous = await prisma3.rendezVous.create({
          data: {
            title: rest.title,
            dateTime: dateTime || "",
            description: rest.description,
            creneau,
            creator: (_a = ctx.name_manager) != null ? _a : "",
            enterpriseName: (_b = ctx.name_entreprise) != null ? _b : "",
            enterpriseId: ctx.id,
            enterpriseContact: [(_c = ctx.email) != null ? _c : "", (_d = ctx.phone_entreprise) != null ? _d : ""],
            relationKey: (_e = rest.relationKey) != null ? _e : "",
            isValid: isValidVerif,
            price: rest.price,
            duration: (_f = Number(rest.duration || (forfait == null ? void 0 : forfait.heure))) != null ? _f : 0,
            client: {
              connect: {
                id: (_g = rest.clientId) != null ? _g : ""
              }
            },
            forfait: {
              connect: {
                id: rest.forfaitId
              }
            },
            monitor: {
              connect: {
                id: rest.monitorId
              }
            },
            user: {
              connect: {
                id: ctx.id
              }
            },
            owner: {
              create: {
                owner: {
                  connect: {
                    id: ctx.id
                  }
                }
              }
            }
          }
        });
        const files = req.files;
        if (files && files.length > 0) {
          const fileCreatePromises = files.map(
            (file) => prisma3.file.create({
              data: {
                filename: file.filename,
                originalFilename: file.originalname,
                user: { connect: { id: ctx.id } },
                RendezVous: { connect: { id: rendezvous.id } }
                // <-- Use 'RendezVous' instead of 'rendezVous'
              }
            })
          );
          await Promise.all(fileCreatePromises);
        }
        const student = await prisma3.user.findUnique({
          where: {
            id: rest.clientId
          },
          select: {
            name: true,
            lastname: true,
            email: true,
            resetPasswordToken: true
          }
        });
        const configLink = `
        <a href="${process.env.APP_URL}reset-password/${student == null ? void 0 : student.resetPasswordToken}" 
        style="display: inline-block; background-color: #111; color: white; padding: 10px 20px; margin: 10px 0; border-radius: 5px; text-decoration: none;">
        Configurer le Mot de Passe</a>`;
        const formattedDate = rest.dateTime ? new Intl.DateTimeFormat("fr-FR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }).format(new Date(rest.dateTime)) : "";
        const entreprisename = await prisma3.user.findUnique({
          where: {
            id: ctx.id
          },
          select: {
            name_entreprise: true
          }
        });
        if (student && student.email) {
          const transporter = import_nodemailer2.default.createTransport({
            host: "smtp.ionos.fr",
            port: 465,
            secure: true,
            auth: {
              user: "ne-pas-repondre@myrendev.com",
              pass: "Liamedia2608150155@"
              // Your real password here
            }
          });
          const mailOptions = {
            from: "ne-pas-repondre@myrendev.com",
            to: student.email,
            subject: "Confirmation de votre Rendez-vous",
            html: `
              <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
                <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 100px; margin-bottom: 20px;">
                <h1 style="color: #0056b3;">Rendez-vous Confirm\xE9 avec ${entreprisename == null ? void 0 : entreprisename.name_entreprise}</h1>
                <p style="font-size: 16px; line-height: 1.5;">Bonjour <strong>${student.name} ${student.lastname}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.5;">Nous sommes heureux de confirmer votre rendez-vous pour le <strong>
                ${formattedDate}</strong>. Voici les d\xE9tails :</p>
                <div style="background-color: #f2f2f2; padding: 15px; margin: 20px 0; border-radius: 5px;">
                  <p style="margin: 0; font-size: 16px;"><strong>Intervention:</strong> ${forfait == null ? void 0 : forfait.name}</p>
                  <p style="margin: 0; font-size: 16px;"><strong>Temps d'intervention:</strong> ${forfait == null ? void 0 : forfait.heure} heures</p>
                  <p style="margin: 0; font-size: 16px;"><strong>Horaire (ESTIMATION):</strong> ${creneau}</p>
                </div>
                <p style="font-size: 16px; line-height: 1.5;">Nous vous remercions pour votre confiance et nous r\xE9jouissons de vous voir.</p>
                ${student.resetPasswordToken !== null ? configLink : ""}
              </div>
            `
          };
          const mailOptionsForOrder = {
            from: "ne-pas-repondre@myrendev.com",
            to: student.email,
            subject: "Confirmation de votre Rendez-vous",
            html: `
              <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
                <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 100px; margin-bottom: 20px;">
                <h1 style="color: #0056b3;">Commande Confirm\xE9 avec ${entreprisename == null ? void 0 : entreprisename.name_entreprise}</h1>
                <p style="font-size: 16px; line-height: 1.5;">Bonjour <strong>${student.name} ${student.lastname}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.5;">Nous sommes heureux de confirmer votre commande pour le <strong>
                ${formattedDate}</strong>. Voici les d\xE9tails :</p>
                <div style="background-color: #f2f2f2; padding: 15px; margin: 20px 0; border-radius: 5px;">
                  <p style="margin: 0; font-size: 16px;"><strong>Intervention:</strong> ${forfait == null ? void 0 : forfait.name}</p>
                  <p style="margin: 0; font-size: 16px;"><strong>Prix:</strong> ${rest == null ? void 0 : rest.price}</p>
                  <p style="margin: 0; font-size: 16px;"><strong>Vous pourrez r\xE9cuperer votre commande a ce cr\xE9neau (ESTIMATION):</strong> ${creneau}</p>

               
                </div>
                <p style="font-size: 16px; line-height: 1.5;">Nous vous remercions pour votre confiance et nous r\xE9jouissons de vous voir.</p>
                ${student.resetPasswordToken !== null ? configLink : ""}
              </div>
            `
          };
          try {
            if (isValidVerif === true && (forfait == null ? void 0 : forfait.heure) !== 0) {
              await transporter.sendMail(mailOptions);
            } else if ((forfait == null ? void 0 : forfait.heure) === 0 && isValidVerif === true) {
              await transporter.sendMail(mailOptionsForOrder);
            }
          } catch (error) {
            return new ApiResponse({ message: "Error sending email" });
          }
          console.log("Confirmation email sent to:", student.email);
        }
        return new ApiResponse(rendezvous);
      } catch (error) {
        console.error("Error creating rendezvous:", error);
        throw new ApiError("An error occurred while creating the rendezvous");
      }
    }
  })
);
router6.get("/api/files", async (req, res) => {
  const rendezVousId = req.query.rendezVousId;
  if (!rendezVousId || typeof rendezVousId !== "string") {
    return res.status(400).json({ error: "RendezVous ID is required and must be a string" });
  }
  try {
    const files = await prisma3.file.findMany({
      where: { rendezVousId },
      select: {
        filename: true,
        originalFilename: true
      }
    });
    res.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router6.post(
  "/update",
  typed({
    context: protect(),
    schemas: { input: updateRendezvous },
    // Assuming `updateRendezvous` schema is defined
    async handler({ input, ctx }) {
      var _a, _b;
      try {
        const rendezvousId = input.rendezvousId;
        const updatedRendezvous = await client.rendezVous.update({
          where: { id: rendezvousId },
          data: {
            title: input.title,
            dateTime: input.dateTime,
            description: input.description,
            creneau: input.creneau,
            client: {
              connect: {
                id: input.clientId
              }
            },
            forfait: {
              connect: {
                id: input.forfaitId
              }
            },
            monitor: {
              connect: {
                id: input.monitorId
              }
            }
          }
        });
        const student = await prisma3.user.findUnique({
          where: { id: input.clientId },
          select: { name: true, lastname: true, email: true }
        });
        const rdv = await prisma3.rendezVous.findUnique({
          where: { id: updatedRendezvous.id },
          include: {
            forfait: true,
            client: true,
            user: true
          }
        });
        if (student && student.email) {
          const transporter = import_nodemailer2.default.createTransport({
            host: "smtp.ionos.fr",
            port: 465,
            secure: true,
            auth: {
              user: "ne-pas-repondre@myrendev.com",
              pass: "Liamedia2608150155@"
            }
          });
          const mailOptions = {
            from: "ne-pas-repondre@myrendev.com",
            to: student.email,
            subject: "Confirmation de votre Rendez-vous mis \xE0 jour",
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
              <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 100px; margin-bottom: 20px;">
              <h1 style="color: #0056b3;">Rendez-vous avec ${rdv == null ? void 0 : rdv.enterpriseName}</h1>
              <h2 style="color: #0056b3;">modifier par ${rdv == null ? void 0 : rdv.enterpriseName}</h2>
              <p style="font-size: 16px; line-height: 1.5;">Bonjour <strong>${rdv == null ? void 0 : rdv.client.name} ${rdv == null ? void 0 : rdv.client.lastname}</strong>,</p>
              <p>Votre rendez-vous a \xE9t\xE9 mis \xE0 jour avec succ\xE8s.</p>
              <p style="font-size: 16px; line-height: 1.5;">Voici les d\xE9tails :</p>
              <div style="background-color: #f2f2f2; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p>Nouvelle date et cr\xE9neau : ${input.dateTime}</p>
                <p style="margin: 0; font-size: 16px;"><strong>Intervention:</strong> ${(_a = rdv == null ? void 0 : rdv.forfait) == null ? void 0 : _a.name}</p>
                <p style="margin: 0; font-size: 16px;"><strong>Temps d'intervention:</strong> ${(_b = rdv == null ? void 0 : rdv.forfait) == null ? void 0 : _b.heure} heures</p>
                <p style="margin: 0; font-size: 16px;"><strong>Horaire (ESTIMATION):</strong> ${input.creneau}</p>
              </div>
              <p style="font-size: 16px; line-height: 1.5;">Nous vous remercions pour votre confiance et nous r\xE9jouissons de vous voir.</p>
            </div>
          `
          };
          await transporter.sendMail(mailOptions);
          console.log("Confirmation email sent to:", student.email);
        }
        let rendezVousWithImage;
        if (input.images) {
          rendezVousWithImage = await Promise.all(
            input.images.map(async (image) => {
              if (image) {
                await client.image.update({
                  where: { id: image.id },
                  // Assuming `image.id` is provided to identify the image
                  data: {
                    filename: image.filename
                  }
                });
              }
            })
          );
        } else {
          rendezVousWithImage = updatedRendezvous;
        }
        return new ApiResponse(rendezVousWithImage);
      } catch (error) {
        console.error("Error updating rendezvous:", error);
        throw new ApiError("An error occurred while updating the rendezvous");
      }
    }
  })
);
router6.post(
  "/update-schedule",
  typed({
    context: protect(),
    schemas: { input: updateSchedule },
    // Assuming `updateRendezvous` schema is defined
    async handler({ input, ctx }) {
      try {
        const rendezvousId = input.rendezvousId;
        const updateSchedule2 = await client.rendezVous.update({
          where: { id: rendezvousId },
          data: {
            dateTime: input.dateTime,
            creneau: input.creneau
          }
        });
        const clientInfo = await prisma3.user.findUnique({
          where: { id: updateSchedule2.clientId },
          select: { name: true, lastname: true, email: true }
        });
        const enterpriseInfo = await prisma3.user.findUnique({
          where: { id: updateSchedule2.enterpriseId },
          select: { name_entreprise: true, lastname: true, email: true }
        });
        const forfaitInfo = await prisma3.forfait.findUnique({
          where: {
            id: updateSchedule2.forfaitId ? updateSchedule2.forfaitId : void 0
          },
          select: { name: true, heure: true }
        });
        if (clientInfo && clientInfo.email) {
          const transporter = import_nodemailer2.default.createTransport({
            host: "smtp.ionos.fr",
            port: 465,
            secure: true,
            auth: {
              user: "ne-pas-repondre@myrendev.com",
              pass: "Liamedia2608150155@"
            }
          });
          const mailOptions = {
            from: "ne-pas-repondre@myrendev.com",
            to: clientInfo.email,
            subject: "Rendez-vous mis \xE0 jour ",
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
              <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 100px; margin-bottom: 20px;">
              <h1 style="color: #0056b3;">Rendez-vous avec ${enterpriseInfo == null ? void 0 : enterpriseInfo.name_entreprise}</h1>
              <h2 style="color: #0056b3;">modifier par ${enterpriseInfo == null ? void 0 : enterpriseInfo.name_entreprise}</h2>
              <p style="font-size: 16px; line-height: 1.5;">Bonjour <strong>${clientInfo.name} ${clientInfo.lastname}</strong>,</p>
              <p>Votre rendez-vous a \xE9t\xE9 mis \xE0 jour avec succ\xE8s.</p>
              <p style="font-size: 16px; line-height: 1.5;">Voici les d\xE9tails :</p>
              <div style="background-color: #f2f2f2; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p>Nouvelle date et cr\xE9neau : ${input.dateTime}</p>
                <p style="margin: 0; font-size: 16px;"><strong>Intervention:</strong> ${forfaitInfo == null ? void 0 : forfaitInfo.name}</p>
                <p style="margin: 0; font-size: 16px;"><strong>Temps d'intervention:</strong> ${forfaitInfo == null ? void 0 : forfaitInfo.heure} heures</p>
                <p style="margin: 0; font-size: 16px;"><strong>Horaire (ESTIMATION):</strong> ${input.creneau}</p>
              </div>
              <p style="font-size: 16px; line-height: 1.5;">Nous vous remercions pour votre confiance et nous r\xE9jouissons de vous voir.</p>
            </div>
          `
          };
          await transporter.sendMail(mailOptions);
          console.log("Confirmation email sent to:", clientInfo.email);
        }
        return new ApiResponse(updateSchedule2);
      } catch (error) {
        console.error("Error updating rendezvous:", error);
        throw new ApiError("An error occurred while updating the rendezvous");
      }
    }
  })
);
router6.patch(
  "/update-date/:id",
  typed({
    // context: protect(),
    schemas: {
      input: updateDate,
      params: import_zod12.z.object({
        id: import_zod12.z.string()
        // Assuming `id` is a string
      })
    },
    // Assumant que le schéma `updateSchedule` est défini
    async handler({ params, input, ctx }) {
      var _a, _b;
      try {
        const updatedRendezvous = await client.rendezVous.update({
          where: { id: params.id },
          data: {
            dateTime: input.dateTime
            // creneau: "10:00 - 11:00",
          }
        });
        const clientInfo = await prisma3.user.findUnique({
          where: { id: updatedRendezvous.clientId },
          select: { name: true, lastname: true, email: true }
        });
        const rdv = await prisma3.rendezVous.findUnique({
          where: { id: updatedRendezvous.id },
          include: {
            forfait: true,
            client: true,
            user: true
          }
        });
        if (clientInfo && clientInfo.email) {
          const transporter = import_nodemailer2.default.createTransport({
            host: "smtp.ionos.fr",
            port: 465,
            secure: true,
            auth: {
              user: "ne-pas-repondre@myrendev.com",
              pass: "Liamedia2608150155@"
              // Assurez-vous que ce mot de passe est correct
            }
          });
          const mailOptions = {
            from: "ne-pas-repondre@myrendev.com",
            to: clientInfo.email,
            subject: "Rendez-vous mis \xE0 jour",
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
              <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 100px; margin-bottom: 20px;">
              <h1 style="color: #0056b3;">Rendez-vous avec ${rdv == null ? void 0 : rdv.enterpriseName}</h1>
              <h2 style="color: #0056b3;">modifier par ${rdv == null ? void 0 : rdv.enterpriseName}</h2>
              <p style="font-size: 16px; line-height: 1.5;">Bonjour <strong>${clientInfo.name} ${clientInfo.lastname}</strong>,</p>
              <p>Votre rendez-vous a \xE9t\xE9 mis \xE0 jour avec succ\xE8s.</p>
              <p style="font-size: 16px; line-height: 1.5;">Voici les d\xE9tails :</p>
              <div style="background-color: #f2f2f2; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p>Nouvelle date et cr\xE9neau : ${input.dateTime}</p>
                <p style="margin: 0; font-size: 16px;"><strong>Intervention:</strong> ${(_a = rdv == null ? void 0 : rdv.forfait) == null ? void 0 : _a.name}</p>
                <p style="margin: 0; font-size: 16px;"><strong>Temps d'intervention:</strong> ${(_b = rdv == null ? void 0 : rdv.forfait) == null ? void 0 : _b.heure} heures</p>
                <p style="margin: 0; font-size: 16px;"><strong>Horaire (ESTIMATION):</strong> ${rdv == null ? void 0 : rdv.creneau}</p>
              </div>
              <p style="font-size: 16px; line-height: 1.5;">Nous vous remercions pour votre confiance et nous r\xE9jouissons de vous voir.</p>
            </div>
          `
          };
          await transporter.sendMail(mailOptions);
        }
        return new ApiResponse(updatedRendezvous);
      } catch (error) {
        console.error("Erreur lors de la mise \xE0 jour du rendez-vous :", error);
        throw new ApiError(
          "Une erreur s'est produite lors de la mise \xE0 jour du rendez-vous"
        );
      }
    }
  })
);
router6.patch(
  "/update-by-client",
  typed({
    schemas: { input: majRendezVous },
    async handler({ input }) {
      var _a, _b, _c, _d;
      try {
        const relationKey = input.relationKey;
        const currentRdv = await client.rendezVous.findFirst({
          where: { relationKey },
          include: {
            client: true,
            forfait: true,
            user: true,
            monitor: true
          }
        });
        if (!currentRdv) {
          console.error("No rendezvous found for relationKey:", relationKey);
          throw new ApiError("Rendezvous not found");
        }
        const updatedRendezvous = await client.rendezVous.updateMany({
          where: { relationKey },
          data: {
            dateTime: input.dateTime,
            creneau: input.creneau,
            isValid: input.isValid,
            creator: (currentRdv == null ? void 0 : currentRdv.client.name) + " " + (currentRdv == null ? void 0 : currentRdv.client.lastname)
          }
        });
        const updatedRdv = await client.rendezVous.findFirst({
          where: { relationKey },
          include: {
            client: true,
            forfait: true,
            user: true,
            monitor: true
          }
        });
        const formattedDate = (updatedRdv == null ? void 0 : updatedRdv.dateTime) ? new Intl.DateTimeFormat("fr-FR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }).format(new Date(updatedRdv == null ? void 0 : updatedRdv.dateTime)) : "";
        const mailData = await client.rendezVous.findMany({
          where: { relationKey },
          include: { client: true }
        });
        const emails = mailData.map((item) => item.client.email);
        const student = await prisma3.user.findUnique({
          where: { email: emails[0] },
          select: { name: true, lastname: true, email: true, id: true }
        });
        if (student && student.email) {
          const transporter = import_nodemailer2.default.createTransport({
            host: "smtp.ionos.fr",
            port: 465,
            secure: true,
            auth: {
              user: "ne-pas-repondre@myrendev.com",
              pass: "Liamedia2608150155@"
            }
          });
          const mailOptions = {
            from: "ne-pas-repondre@myrendev.com",
            to: emails,
            subject: "Confirmation de votre Rendez-vous",
            html: `
              <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
                <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 100px; margin-bottom: 20px;">
                <h1 style="color: #0056b3;">Rendez-vous Confirm\xE9 avec ${updatedRdv == null ? void 0 : updatedRdv.enterpriseName}</h1>
                <p style="font-size: 16px; line-height: 1.5;">Bonjour <strong>${student.name} ${student.lastname}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.5;">Nous sommes heureux de confirmer votre rendez-vous pour le <strong>${formattedDate}</strong>. Voici les d\xE9tails :</p>
                <div style="background-color: #f2f2f2; padding: 15px; margin: 20px 0; border-radius: 5px;">
                  <p style="margin: 0; font-size: 16px;"><strong>Intervention:</strong> ${(_a = updatedRdv == null ? void 0 : updatedRdv.forfait) == null ? void 0 : _a.name}</p>
                  <p style="margin: 0; font-size: 16px;"><strong>Temps d'intervention:</strong> ${(_b = updatedRdv == null ? void 0 : updatedRdv.forfait) == null ? void 0 : _b.heure} heures</p>
                  <p style="margin: 0; font-size: 16px;"><strong>Horaire (ESTIMATION):</strong> ${updatedRdv == null ? void 0 : updatedRdv.creneau}</p>
                </div>
                <p style="font-size: 16px; line-height: 1.5;">Nous vous remercions pour votre confiance et nous r\xE9jouissons de vous voir.</p>
              </div>
            `
          };
          const mailOptionsFalse = {
            from: "ne-pas-repondre@myrendev.com",
            to: emails,
            subject: "Rendez-vous en attente de confirmation",
            html: `
              <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
                <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 100px; margin-bottom: 20px;">
                <h1 style="color: #0056b3;">Rendez-vous en attente de confirmation avec ${updatedRdv == null ? void 0 : updatedRdv.enterpriseName}</h1>
                <p style="font-size: 16px; line-height: 1.5;">Bonjour <strong>${student.name} ${student.lastname}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.5;">Votre demande de rendez-vous pour le <strong>${formattedDate}</strong> a \xE9t\xE9 re\xE7ue et est en attente de r\xE9ponse de la part de l'entreprise. Voici les d\xE9tails :</p>
                <div style="background-color: #f2f2f2; padding: 15px; margin: 20px 0; border-radius: 5px;">
                  <p style="margin: 0; font-size: 16px;"><strong>Intervention:</strong> ${(_c = updatedRdv == null ? void 0 : updatedRdv.forfait) == null ? void 0 : _c.name}</p>
                  <p style="margin: 0; font-size: 16px;"><strong>Temps d'intervention:</strong> ${(_d = updatedRdv == null ? void 0 : updatedRdv.forfait) == null ? void 0 : _d.heure} heures</p>
                  <p style="margin: 0; font-size: 16px;"><strong>Horaire (ESTIMATION):</strong> ${updatedRdv == null ? void 0 : updatedRdv.creneau}</p>
                </div>
                <p style="font-size: 16px; line-height: 1.5;">Nous vous remercions pour votre patience. Nous vous informerons d\xE8s que l'entreprise aura confirm\xE9 le rendez-vous.</p>
              </div>
            `
          };
          if (input.isValid === true) {
            await transporter.sendMail(mailOptions);
          } else {
            await transporter.sendMail(mailOptionsFalse);
          }
          const notificationMessage = `Rendez vous confirm\xE9 pour le client ${student.name} ${student.lastname} pour le ${formattedDate} \xE0 ${updatedRdv == null ? void 0 : updatedRdv.creneau}.`;
          const findOwnership = await prisma3.ownership.findFirst({
            where: {
              userId: student.id,
              ownerId: updatedRdv == null ? void 0 : updatedRdv.enterpriseId
            }
          });
          await prisma3.notification.create({
            data: {
              message: notificationMessage,
              userId: student.id,
              ownershipId: findOwnership ? findOwnership.id : ""
              // Replace with actual ownershipId value
            }
          });
          console.log("Notification created successfully.");
        }
        return new ApiResponse(updatedRendezvous);
      } catch (error) {
        console.error("Error updating rendezvous:", error);
        throw new ApiError("An error occurred while updating the rendezvous");
      }
    }
  })
);
router6.get(
  "/get/notifications",
  typed({
    context: protect("ENTREPRISE"),
    // Ensure only authenticated entreprise can access this route
    async handler({ ctx }) {
      const users2 = await client.notification.findMany({
        where: {
          ownership: {
            ownerId: ctx.id
            // Use the entreprise ID from the context to filter monitors
          }
        },
        include: { user: true }
      });
      return new ApiResponse(users2);
    }
  })
);
router6.post("/notifications/:id/mark-as-read", async (req, res, next) => {
  const { id } = req.params;
  try {
    const updatedNotification = await prisma3.notification.update({
      where: { id },
      data: { read: true }
    });
    res.status(200).json(updatedNotification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "An error occurred while marking notification as read" });
  }
});
router6.patch(
  "/update-status",
  typed({
    context: protect(),
    schemas: { input: updateRendezvous },
    // Assuming `updateRendezvous` schema is defined
    async handler({ input, ctx }) {
      var _a, _b;
      try {
        const updatedRendezvous = await client.rendezVous.update({
          where: { id: input.rendezvousId },
          data: {
            isValid: true
          }
        });
        const currentRdv = await client.rendezVous.findUnique({
          where: { id: input.rendezvousId },
          include: { client: true, forfait: true }
        });
        const mailData = await client.rendezVous.findMany({
          where: { clientId: input.clientId },
          include: { client: true }
        });
        const formattedDate = (currentRdv == null ? void 0 : currentRdv.dateTime) ? new Intl.DateTimeFormat("fr-FR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }).format(new Date(currentRdv == null ? void 0 : currentRdv.dateTime)) : "";
        const emails = mailData.map((item) => item.client.email);
        const student = await prisma3.user.findUnique({
          where: { email: emails[0] },
          select: { name: true, lastname: true, email: true }
        });
        if (student && student.email) {
          const transporter = import_nodemailer2.default.createTransport({
            host: "smtp.ionos.fr",
            port: 465,
            secure: true,
            auth: {
              user: "ne-pas-repondre@myrendev.com",
              pass: "Liamedia2608150155@"
            }
          });
          const mailOptions = {
            from: "ne-pas-repondre@myrendev.com",
            to: emails,
            subject: "Confirmation de votre Rendez-vous",
            html: `
              <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
                <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 100px; margin-bottom: 20px;">
                <h1 style="color: #0056b3;">Rendez-vous Confirm\xE9 avec ${currentRdv == null ? void 0 : currentRdv.enterpriseName}</h1>
                <p style="font-size: 16px; line-height: 1.5;">Bonjour <strong>${student.name} ${student.lastname}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.5;">Nous sommes heureux de confirmer votre rendez-vous pour le <strong>
                ${formattedDate}</strong>. Voici les d\xE9tails :</p>
                <div style="background-color: #f2f2f2; padding: 15px; margin: 20px 0; border-radius: 5px;">
                  <p style="margin: 0; font-size: 16px;"><strong>Intervention:</strong> ${(_a = currentRdv == null ? void 0 : currentRdv.forfait) == null ? void 0 : _a.name}</p>
                  <p style="margin: 0; font-size: 16px;"><strong>Temps d'intervention:</strong> ${(_b = currentRdv == null ? void 0 : currentRdv.forfait) == null ? void 0 : _b.heure} heures</p>
                  <p style="margin: 0; font-size: 16px;"><strong>Horaire (ESTIMATION):</strong> ${currentRdv == null ? void 0 : currentRdv.creneau}</p>
                </div>
                <p style="font-size: 16px; line-height: 1.5;">Nous vous remercions pour votre confiance et nous r\xE9jouissons de vous voir.</p>
              </div>
            `
          };
          await transporter.sendMail(mailOptions);
        }
        return new ApiResponse(updatedRendezvous);
      } catch (error) {
        console.error("Error updating rendezvous:", error);
        throw new ApiError("An error occurred while updating the rendezvous");
      }
    }
  })
);
router6.patch(
  "/desactivate/:id",
  typed({
    schemas: {
      params: import_zod12.z.object({
        id: import_zod12.z.string()
        // Define id as a string parameter
      })
    },
    async handler({ params }) {
      try {
        await client.rendezVous.update({
          where: { id: params.id },
          data: { isActivated: false }
          // Example: deactivating by setting 'active' to false
        });
        return new ApiResponse({
          success: true
        });
      } catch (error) {
        console.error("Error deactivating rendezVous:", error);
        return new ApiResponse({
          success: false,
          error: "Failed to deactivate rendezVous"
        });
      }
    }
  })
);
router6.delete(
  "/delete/:id",
  typed({
    schemas: {
      params: import_zod12.z.object({
        id: import_zod12.z.string()
      })
    },
    async handler({ params }) {
      await client.rendezVous.delete({ where: { id: params.id } });
      return new ApiResponse({
        success: true
      });
    }
  })
);

// src/router/delayedrendezvous/index.ts
var import_express7 = require("express");

// src/router/delayedrendezvous/schema.ts
var import_zod13 = require("zod");
var createDalayedRendezvous = import_zod13.z.object({
  title: import_zod13.z.string(),
  //   dateTime: z.string(),
  description: import_zod13.z.string().optional(),
  clientId: import_zod13.z.string(),
  forfaitId: import_zod13.z.string(),
  monitorId: import_zod13.z.string(),
  relationKey: import_zod13.z.string(),
  images: import_zod13.z.array(
    import_zod13.z.object({
      filename: import_zod13.z.string(),
      rendezVousId: import_zod13.z.string()
    })
  )
});

// src/router/delayedrendezvous/index.ts
var import_client5 = require("@prisma/client");
var router7 = (0, import_express7.Router)();
var prisma4 = new import_client5.PrismaClient();
router7.post(
  "/create",
  typed({
    context: protect(),
    schemas: { input: createDalayedRendezvous },
    async handler({ input, ctx }) {
      try {
        const _a = input, { images } = _a, rest = __objRest(_a, ["images"]);
        console.log("input", input);
        const rendezvousWithoutImages = await client.delayedRendezVous.create({
          data: {
            title: rest.title,
            relationKey: input.relationKey,
            //   dateTime: rest.dateTime,
            description: rest.description,
            //   creneau: creneau,
            client: {
              connect: {
                id: rest.clientId
              }
            },
            forfait: {
              connect: {
                id: rest.forfaitId
              }
            },
            monitor: {
              connect: {
                id: rest.monitorId
              }
            },
            owner: {
              create: {
                owner: {
                  connect: {
                    id: ctx.id
                  }
                }
              }
            }
          }
        });
        return new ApiResponse(rendezvousWithoutImages);
      } catch (error) {
        console.error("Error creating rendezvous:", error);
        throw new ApiError("An error occurred while creating the rendezvous");
      }
    }
  })
);
router7.get(
  "/all",
  typed({
    context: protect("ENTREPRISE"),
    async handler({ ctx, params, input }) {
      const rendezvous = await client.delayedRendezVous.findMany({
        where: {
          owner: {
            owner: {
              id: ctx.id
            }
          }
        },
        include: {
          client: true,
          forfait: true,
          monitor: true,
          images: true
          // Include images
        }
      });
      return new ApiResponse(rendezvous);
    }
  })
);

// src/index.ts
var import_cuid22 = require("@paralleldrive/cuid2");

// src/router/Satisfaction/index.ts
var import_express8 = require("express");
var import_zod15 = require("zod");

// src/router/Satisfaction/schema.ts
var import_zod14 = require("zod");
var createSatisfaction = import_zod14.z.object({
  title: import_zod14.z.string(),
  // rendezvous_id: z.string().optional(),
  questions: import_zod14.z.array(
    import_zod14.z.object({
      text: import_zod14.z.string(),
      rating: import_zod14.z.number().optional()
      // Assurez-vous que cela est optionnel si nécessaire
    })
  ),
  comment: import_zod14.z.string().optional(),
  redirect_url: import_zod14.z.string().optional(),
  redirect_grade: import_zod14.z.number().optional(),
  userId: import_zod14.z.string().optional()
  // Add this line
});
var updateSatisfaction = import_zod14.z.object({
  title: import_zod14.z.string().optional(),
  questions: import_zod14.z.array(
    import_zod14.z.object({
      text: import_zod14.z.string().optional(),
      rating: import_zod14.z.number().optional()
      // Assurez-vous que cela est optionnel si nécessaire
    })
  ).optional(),
  comment: import_zod14.z.string().optional(),
  redirect_url: import_zod14.z.string().optional(),
  redirect_grade: import_zod14.z.number().optional(),
  userId: import_zod14.z.string().optional()
  // Add this line
});

// src/router/Satisfaction/index.ts
var import_jsonwebtoken3 = __toESM(require("jsonwebtoken"));
var router8 = (0, import_express8.Router)();
router8.get(
  "/all",
  typed({
    context: protect(),
    async handler(props) {
      const satisfactions = await client.user.findUnique({
        where: {
          id: props.ctx.id
        },
        select: {
          Satisfaction: {
            include: {
              questions: true,
              satisfactionReponse: true
              // Inclure les questions liées
            }
          }
        }
      });
      return new ApiResponse({ data: satisfactions });
    }
  })
);
router8.get(
  "/clientSatifaction",
  typed({
    async handler(props) {
      const token = props.req.query.token;
      if (!token) {
        throw new ApiError("Token manquant", 400);
      }
      const decoded = import_jsonwebtoken3.default.verify(token, process.env.SECRET);
      if (!(decoded == null ? void 0 : decoded.clientId) || !(decoded == null ? void 0 : decoded.rendezVousId)) {
        throw new ApiError("Token invalide", 400);
      }
      const ownership = await client.ownership.findFirst({
        where: {
          userId: decoded.clientId
        }
      });
      const satisfactions = await client.user.findUnique({
        where: {
          id: ownership == null ? void 0 : ownership.ownerId
        },
        select: {
          Satisfaction: {
            include: {
              questions: true,
              satisfactionReponse: true
              // Inclure les questions liées
            }
          }
        }
      });
      return new ApiResponse({ data: satisfactions });
    }
  })
);
router8.get(
  "/:id",
  typed({
    schemas: {
      params: import_zod15.z.object({
        id: import_zod15.z.string()
      })
    },
    context: protect(),
    async handler({ params }) {
      try {
        const satisfaction = await client.satisfaction.findUnique({
          where: {
            id: params.id
          },
          include: {
            questions: true
            // Inclure les questions liées
            // RendezVous: true,
          }
        });
        if (!satisfaction) {
          throw new ApiError("Ce formulaire de satisfaction n'existe pas");
        }
        return new ApiResponse(satisfaction);
      } catch (error) {
        console.error(
          "Erreur lors de la r\xE9cup\xE9ration du formulaire de satisfaction:",
          error
        );
        throw new ApiError("Erreur interne du serveur", 500);
      }
    }
  })
);
router8.post(
  "/create",
  typed({
    schemas: { input: createSatisfaction },
    context: protect(),
    async handler({ input, ctx }) {
      try {
        console.log("Received data for satisfaction creation:", input);
        const satisfaction = await client.satisfaction.create({
          data: {
            title: input.title,
            redirect_url: input.redirect_url,
            redirect_grade: input.redirect_grade,
            comment: input.comment,
            // RendezVous: {
            //   connect: {
            //     id: input.rendezvous_id,
            //   },
            // },
            user: {
              connect: {
                id: ctx.id
              }
            }
          }
        });
        await Promise.all(
          input.questions.map(async (question) => {
            await client.question.create({
              data: {
                text: question.text,
                rating: question.rating,
                satisfaction: {
                  connect: {
                    id: satisfaction.id
                  }
                }
              }
            });
          })
        );
        console.log("Satisfaction created with questions:", satisfaction);
        return new ApiResponse({ data: satisfaction });
      } catch (error) {
        console.error("Error during satisfaction creation:", error);
        return new ApiError(
          "Une erreur s'est produite lors de la cr\xE9ation du formulaire de satisfaction"
        );
      }
    }
  })
);
router8.patch(
  "/update/:id",
  typed({
    schemas: {
      params: import_zod15.z.object({
        id: import_zod15.z.string()
      }),
      input: updateSatisfaction
      // Utilisez le schéma updateSatisfaction pour la validation de la requête
    },
    context: protect(),
    async handler({ params, input, ctx }) {
      console.log("ID pour mise \xE0 jour:", params.id);
      console.log("Donn\xE9es re\xE7ues pour mise \xE0 jour:", input);
      try {
        const existingSatisfaction = await client.satisfaction.findUnique({
          where: {
            id: params.id,
            userId: ctx.id
          }
        });
        if (!existingSatisfaction) {
          throw new ApiError("Ce formulaire de satisfaction n'existe pas");
        }
        const questionsUpdate = input.questions ? input.questions.map((question) => ({
          text: question.text,
          // Consider adding checks or fallbacks for `question.text` and `question.rating` if they can be undefined
          rating: question.rating
        })) : [];
        const updatedSatisfaction = await client.satisfaction.update({
          where: {
            id: params.id
          },
          data: {
            title: input.title,
            redirect_url: input.redirect_url,
            redirect_grade: input.redirect_grade,
            comment: input.comment,
            userId: input.userId,
            questions: {
              deleteMany: {},
              create: questionsUpdate
            }
          }
        });
        return new ApiResponse({
          data: updatedSatisfaction,
          message: "La satisfaction a \xE9t\xE9 mise \xE0 jour avec succ\xE8s"
        });
      } catch (error) {
        console.error(
          "Erreur lors de la mise \xE0 jour de la satisfaction:",
          error
        );
        return new ApiError(
          "Une erreur s'est produite lors de la mise \xE0 jour du formulaire de satisfaction"
        );
      }
    }
  })
);
router8.delete(
  "/delete/:id",
  typed({
    schemas: {
      params: import_zod15.z.object({
        id: import_zod15.z.string()
      })
    },
    async handler({ params, ctx }) {
      try {
        await client.question.deleteMany({
          where: {
            satisfactionId: params.id
          }
        });
        await client.satisfaction.delete({
          where: {
            id: params.id
          }
        });
        return new ApiResponse({
          message: "Le formulaire de satisfaction a \xE9t\xE9 supprim\xE9 avec succ\xE8s"
        });
      } catch (error) {
        console.error(
          "Erreur lors de la suppression du formulaire de satisfaction:",
          error
        );
        return new ApiResponse({ message: "Erreur interne du serveur" }, 500);
      }
    }
  })
);

// src/router/mailing/index.ts
var import_express9 = require("express");
var import_zod16 = require("zod");
var import_nodemailer3 = __toESM(require("nodemailer"));
var { v4: uuidv42 } = require("uuid");
var router9 = (0, import_express9.Router)();
var multer4 = require("multer");
var upload4 = multer4();
router9.post(
  "/personalize-email",
  upload4.array("files"),
  // Multer middleware to handle file uploads
  typed({
    schemas: {
      input: import_zod16.z.object({
        email: import_zod16.z.string().email().optional(),
        value: import_zod16.z.string().email().optional(),
        objets: import_zod16.z.string(),
        messages: import_zod16.z.string(),
        manualRecipient1: import_zod16.z.string().email().optional(),
        manualRecipient2: import_zod16.z.string().email().optional(),
        manualRecipient3: import_zod16.z.string().email().optional(),
        manualRecipient4: import_zod16.z.string().email().optional(),
        manualRecipient5: import_zod16.z.string().email().optional()
      })
    },
    async handler({ input, req }) {
      const {
        email,
        objets,
        messages,
        manualRecipient1,
        manualRecipient2,
        manualRecipient3,
        manualRecipient4,
        manualRecipient5,
        value
      } = input;
      const files = req.files;
      try {
        const existingUser = await client.user.findUnique({
          where: {
            email
          }
        });
        if (!existingUser) {
          throw new ApiError("Utilisateur non trouv\xE9");
        }
        const smtpConfig = {
          host: "smtp.ionos.fr",
          port: 465,
          secure: true,
          auth: {
            user: "ne-pas-repondre@myrendev.com",
            pass: "Liamedia2608150155@"
          }
        };
        const ccRecipients = [
          manualRecipient1,
          manualRecipient2,
          manualRecipient3,
          manualRecipient4,
          manualRecipient5
        ].filter(Boolean).join(",");
        const transporter = import_nodemailer3.default.createTransport(smtpConfig);
        const mailOptions = {
          from: "ne-pas-repondre@myrendev.com",
          to: email,
          cc: ccRecipients,
          subject: objets,
          text: messages,
          html: `
            <div style="text-align: center;">
              <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 50px;">
              <h1 style="color: #111;"></h1>
              <p>${messages} </p>
              <strong>MyRendev</strong>. .
            </div>
          `
        };
        if (files && files.length > 0) {
          mailOptions.attachments = files.map((file) => ({
            filename: file.originalname,
            content: file.buffer
          }));
        }
        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        return new ApiResponse({
          messages: "Email envoy\xE9 avec succ\xE8s"
        });
      } catch (error) {
        console.error("Erreur lors de l'envoi de l'e-mail:", error);
        throw new ApiError(
          "Une erreur s'est produite lors de l'envoi de l'e-mail"
        );
      }
    }
  })
);
router9.post(
  "/users-mail",
  upload4.array("files"),
  // Multer middleware to handle single file upload
  typed({
    schemas: {
      input: import_zod16.z.object({
        title: import_zod16.z.string(),
        email: import_zod16.z.string().email(),
        messages: import_zod16.z.array(import_zod16.z.string()),
        token: import_zod16.z.string().optional()
      })
    },
    context: protect(),
    async handler({ input, ctx, req }) {
      const { title, email, messages, token } = input;
      const files = req.files;
      const tokenToken = token || "";
      const convertToFrenchDate = (isoDate) => {
        const date = new Date(isoDate);
        return date.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });
      };
      const existingEntry = await client.superposition.findMany({
        where: {
          reqToken: token
        }
      });
      const frenchDates = messages.map(convertToFrenchDate);
      try {
        let encrypt2 = function(text) {
          return btoa(text);
        };
        var encrypt = encrypt2;
        const existingUser = await client.user.findUnique({
          where: {
            email
          }
        });
        if (!existingUser) {
          throw new ApiError("Utilisateur non trouv\xE9");
        }
        const smtpConfig = {
          host: "smtp.ionos.fr",
          port: 465,
          secure: true,
          auth: {
            user: "ne-pas-repondre@myrendev.com",
            pass: "Liamedia2608150155@"
          }
        };
        const transporter = import_nodemailer3.default.createTransport(smtpConfig);
        const dates = messages.join(",");
        const encryptedDates = encrypt2(dates);
        const id = ctx.id;
        const encryptedId = encrypt2(id);
        const encryptedToken = encrypt2(tokenToken);
        const encryptedTitle = encrypt2(title);
        const baseUrl = `${process.env.APP_URL}disponibilite`;
        const expireTime = /* @__PURE__ */ new Date();
        expireTime.setMinutes(expireTime.getMinutes() + 1);
        const timestamp = Math.floor(expireTime.getTime() / 1e3);
        const url = `${baseUrl}?dates=${encryptedDates}&id=${encryptedId}&title=${encryptedTitle}&timestamp=${timestamp}&token=${encryptedToken}`;
        const mailOptions = {
          from: "ne-pas-repondre@myrendev.com",
          to: existingUser.email,
          // Use the user's email dynamically
          subject: "Jour de cong\xE9s",
          html: `
            <div style="font-family: Arial, sans-serif; text-align: center; color: #111;">
              <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 100px; margin-bottom: 20px;">
              <h1 style="color: #333;">Notification de Cong\xE9</h1>
              <p style="font-size: 16px; line-height: 1.5; color: #555;">
                Voici les dates de cong\xE9s demand\xE9es :
              </p>              
              <ul style="list-style-type: none; padding: 0;">
                ${frenchDates.map(
            (message) => `<li style="margin: 10px 0; font-size: 16px; color: #333;">${message}</li>`
          ).join("")}
              </ul>
              <p style="font-size: 16px; line-height: 1.5; color: #555;">
                Merci de v\xE9rifier et confirmer ces dates.
              </p>
              <a href="${url}">Cliquez ici pour acc\xE9der \xE0 votre formulaire</a>
              <p style="font-size: 16px; line-height: 1.5; color: #555;">
                Cordialement,<br>
                <strong>MyRendev</strong>
              </p>
              <div style="margin-top: 20px; font-size: 12px; color: #aaa;">
                <p>
                  Ceci est un email automatique, merci de ne pas y r\xE9pondre.
                </p>
              </div>
            </div>
          `
        };
        if (files && files.length > 0) {
          mailOptions.attachments = files.map((file) => ({
            filename: file.originalname,
            content: file.buffer
          }));
        }
        const info = await transporter.sendMail(mailOptions);
        return new ApiResponse({
          messages: "Email envoy\xE9 avec succ\xE8s"
        });
      } catch (error) {
        console.error("Erreur lors de l'envoi de l'e-mail:", error);
        throw new ApiError(
          "Une erreur s'est produite lors de l'envoi de l'e-mail"
        );
      }
    }
  })
);
router9.post(
  "/contacteznous",
  typed({
    schemas: {
      input: import_zod16.z.object({
        subject: import_zod16.z.string().nonempty(),
        name: import_zod16.z.string().nonempty(),
        email: import_zod16.z.string().email(),
        phoneNumber: import_zod16.z.string().nonempty(),
        message: import_zod16.z.string().nonempty()
      })
    },
    async handler({ input }) {
      const { subject, name, email, phoneNumber, message } = input;
      try {
        const smtpConfig = {
          host: "smtp.ionos.fr",
          port: 465,
          secure: true,
          auth: {
            user: "ne-pas-repondre@myrendev.com",
            pass: "Liamedia2608150155@"
          }
        };
        const transporter = import_nodemailer3.default.createTransport(smtpConfig);
        const mailOptions = {
          from: "ne-pas-repondre@myrendev.com",
          to: "contact@myrendev.com",
          // Your email address here
          subject: `Message from ${name}: ${subject} (${phoneNumber})`,
          text: `Nom Complet: ${name}
Num\xE9ro de t\xE9l\xE9phone: ${phoneNumber}
Email: ${email}

Message:
${message}`
        };
        const info = await transporter.sendMail(mailOptions);
        return new ApiResponse({
          messages: "Email envoy\xE9 avec succ\xE8s"
        });
      } catch (error) {
        console.error("Erreur lors de l'envoi de l'e-mail:", error);
        throw new ApiError(
          "Une erreur s'est produite lors de l'envoi de l'e-mail"
        );
      }
    }
  })
);

// src/router/adminmailing/index.ts
var import_express10 = require("express");
var import_zod17 = require("zod");
var import_nodemailer4 = __toESM(require("nodemailer"));
var router10 = (0, import_express10.Router)();
var multer5 = require("multer");
var upload5 = multer5();
router10.post(
  "/personalize-admin-email",
  upload5.array("files"),
  // Multer middleware to handle file uploads
  typed({
    schemas: {
      input: import_zod17.z.object({
        email: import_zod17.z.string().email(),
        objets: import_zod17.z.string(),
        message: import_zod17.z.string()
      })
    },
    async handler({ input, req }) {
      const { email, objets, message } = input;
      const files = req.files;
      try {
        console.log("value1320:", email);
        console.log("Objets1230:", objets);
        console.log("Message13210:", message);
        const existingUser = await client.user.findUnique({
          where: {
            email
          }
        });
        if (!existingUser) {
          throw new ApiError("Utilisateur non trouv\xE9");
        }
        const smtpConfig = {
          host: "ssl0.ovh.net",
          port: 465,
          secure: true,
          auth: {
            user: "test@depanizy.com",
            pass: "test123456789"
          }
        };
        const transporter = import_nodemailer4.default.createTransport(smtpConfig);
        const mailOptions = {
          from: "test@depanizy.com",
          to: email,
          subject: objets,
          text: message,
          html: `
            <div style="text-align: center;">
              <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 50px;">
              <h1 style="color: #111;"></h1>
              <p>${message} </p>
              <strong>MyRendev</strong>. .
            </div>
          `
        };
        if (files && files.length > 0) {
          mailOptions.attachments = files.map((file) => ({
            filename: file.originalname,
            content: file.buffer
          }));
        }
        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        return new ApiResponse({
          message: "Email envoy\xE9 avec succ\xE8s"
        });
      } catch (error) {
        console.error("Erreur lors de l'envoi de l'e-mail:", error);
        throw new ApiError(
          "Une erreur s'est produite lors de l'envoi de l'e-mail"
        );
      }
    }
  })
);

// src/router/clientsChoice/index.ts
var import_express11 = require("express");

// src/router/clientsChoice/schema.ts
var import_zod18 = require("zod");
var confirmSlotSchema = import_zod18.z.object({
  userId: import_zod18.z.string().min(1, {
    message: "userId is required"
  }),
  confirmedDate: import_zod18.z.string(),
  confirmedTime: import_zod18.z.string(),
  token: import_zod18.z.string(),
  relationKey: import_zod18.z.string()
});

// src/router/clientsChoice/index.ts
var import_zod19 = require("zod");
var import_client6 = require("@prisma/client");
var prisma5 = new import_client6.PrismaClient();
var router11 = (0, import_express11.Router)();
router11.post(
  "/confirm-slot",
  typed({
    schemas: {
      input: confirmSlotSchema
    },
    async handler({ input }) {
      const { token, userId, confirmedDate, confirmedTime, relationKey } = input;
      const confirmedSlot = await prisma5.confirmedSlot.create({
        data: {
          userId,
          confirmedDate,
          confirmedTime,
          relationKey
        }
      });
      await prisma5.token.update({
        where: { token },
        data: { slotConfirmed: true }
      });
      return new ApiResponse(confirmedSlot);
    }
  })
);
router11.get("/user/by-email", async (req, res) => {
  const email = typeof req.query.email === "string" ? req.query.email : void 0;
  if (!email) {
    return res.status(400).json({ message: "Invalid or missing email parameter" });
  }
  try {
    const user = await client.user.findUnique({
      where: { email },
      select: { id: true }
      // Only return the user ID
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
router11.get(
  "/get/all",
  typed({
    async handler(props) {
      try {
        const choiceClient = await client.choiceClient.findMany();
        return new ApiResponse(choiceClient);
      } catch (error) {
        console.error(
          "Erreur lors de la r\xE9cup\xE9ration des superpositions :",
          error
        );
        return new ApiResponse(
          { error: "Erreur lors de la r\xE9cup\xE9ration des superpositions." },
          500
        );
      }
    }
  })
);
router11.get(
  "/get/confirmed/all",
  typed({
    async handler(props) {
      try {
        const confirmedSlot = await client.confirmedSlot.findMany();
        return new ApiResponse(confirmedSlot);
      } catch (error) {
        console.error(
          "Erreur lors de la r\xE9cup\xE9ration des superpositions :",
          error
        );
        return new ApiResponse(
          { error: "Erreur lors de la r\xE9cup\xE9ration des superpositions." },
          500
        );
      }
    }
  })
);
router11.delete(
  "/delete/:id",
  typed({
    schemas: {
      params: import_zod19.z.object({
        id: import_zod19.z.string()
      })
    },
    async handler({ params }) {
      await client.rendezVous.delete({ where: { id: params.id } });
      return new ApiResponse({
        success: true
      });
    }
  })
);

// src/router/CorpSetting/index.ts
var import_express12 = require("express");

// src/router/CorpSetting/schema.ts
var import_zod20 = require("zod");
var createCorpSetting = import_zod20.z.object({
  corpData: import_zod20.z.number().optional(),
  dayMoment: import_zod20.z.string().optional(),
  maxSlots: import_zod20.z.number().optional(),
  corpId: import_zod20.z.string().optional(),
  confirmationChoice: import_zod20.z.boolean().optional(),
  numberDays: import_zod20.z.number().optional(),
  numberWeeks: import_zod20.z.number().optional()
});

// src/router/CorpSetting/index.ts
var router12 = (0, import_express12.Router)();
router12.post(
  "/create",
  typed({
    context: protect(),
    schemas: {
      input: createCorpSetting
    },
    async handler({ input, ctx }) {
      try {
        const { corpData, dayMoment, maxSlots, corpId, confirmationChoice, numberDays, numberWeeks } = input;
        const corpDataOrDefault = corpData != null ? corpData : 0;
        const dayMomentOrDefault = dayMoment != null ? dayMoment : "all";
        const maxSlotsOrDefault = maxSlots != null ? maxSlots : 0;
        const id = corpId != null ? corpId : ctx.id;
        const confirm = confirmationChoice != null ? confirmationChoice : false;
        const numberDaysOrDefault = numberDays != null ? numberDays : 0;
        const numberWeeksOrDefault = numberWeeks != null ? numberWeeks : 0;
        await client.corpSetting.deleteMany({
          where: { corpId: id }
        });
        const CorpSetting = await client.corpSetting.create({
          data: {
            corpData: corpDataOrDefault,
            dayMoment: dayMomentOrDefault,
            maxSlots: maxSlotsOrDefault,
            corpId: id,
            confirmationChoice: confirm,
            numberDays: numberDaysOrDefault,
            numberWeeks: numberWeeksOrDefault
          }
        });
        return new ApiResponse(CorpSetting);
      } catch (error) {
        console.error("Erreur lors de la cr\xE9ation de CorpSetting :", error);
        throw new Error("Une erreur s'est produite lors de la cr\xE9ation de CorpSetting");
      }
    }
  })
);
router12.get(
  "/get/corpsetting",
  typed({
    context: protect(),
    async handler({ ctx }) {
      try {
        const CorpSetting = await client.corpSetting.findMany({
          where: { corpId: ctx.id }
        });
        return new ApiResponse(CorpSetting);
      } catch (error) {
        console.error("Erreur lors de la r\xE9cup\xE9ration des superpositions :", error);
        return new ApiResponse({ error: "Erreur lors de la r\xE9cup\xE9ration des superpositions." }, 500);
      }
    }
  })
);

// src/router/clientAuthorization/index.ts
var import_express13 = require("express");

// src/router/clientAuthorization/schema.ts
var import_zod21 = require("zod");
var codeConfirmationSchema = import_zod21.z.object({
  enterpriseId: import_zod21.z.string(),
  clientEmail: import_zod21.z.string(),
  secretCode: import_zod21.z.string(),
  enterpriseName: import_zod21.z.string()
});
var codeConfirmationMailSchema = import_zod21.z.object({
  clientEmail: import_zod21.z.string(),
  enterpriseName: import_zod21.z.string()
});

// src/router/clientAuthorization/index.ts
var import_zod22 = require("zod");
var import_client7 = require("@prisma/client");
var import_nodemailer5 = __toESM(require("nodemailer"));
var prisma6 = new import_client7.PrismaClient();
var router13 = (0, import_express13.Router)();
router13.post(
  "/create-authorization",
  typed({
    schemas: {
      input: codeConfirmationSchema
    },
    async handler({ input }) {
      const { enterpriseId, clientEmail, secretCode, enterpriseName } = input;
      const secretCode1 = Math.floor(Math.random() * 9e4) + 1e4;
      const secredcodeString = secretCode1.toString();
      const codeConfirmation = await prisma6.codeConfirmation.create({
        data: {
          enterpriseId,
          clientEmail,
          secretCode: secredcodeString
        }
      });
      try {
        const smtpConfig = {
          host: "smtp.ionos.fr",
          port: 465,
          secure: true,
          auth: {
            user: "ne-pas-repondre@myrendev.com",
            pass: "Liamedia2608150155@"
          }
        };
        const transporter = import_nodemailer5.default.createTransport(smtpConfig);
        const mailOptions = {
          from: "ne-pas-repondre@myrendev.com",
          to: clientEmail,
          subject: "Code",
          text: "message",
          html: `
            
            <div style="text-align: center;">
              <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 150px;">
              <h1 style="color: #111;"></h1>
              <p>${"text"} </p>
              <strong>MyRendev</strong>. .
              <h1>${enterpriseName} Souhaite-vous ajouter \xE0 sa liste de clients</h1>
              <h2>voici votre code de confirmation</h2>
              <span>${secretCode1}</span>
              <p>donner ce code \xE0 l'entreprise pour finaliser la proc\xE9dure</p>
            </div>
          
            `
        };
        const info = await transporter.sendMail(mailOptions);
        return new ApiResponse({
          message: "Email envoy\xE9 avec succ\xE8s",
          codeConfirmation
        });
      } catch (error) {
        console.error("Erreur lors de l'envoi de l'e-mail:", error);
        throw new ApiError(
          "Une erreur s'est produite lors de l'envoi de l'e-mail"
        );
      }
    }
  })
);
router13.get(
  "/:id",
  typed({
    schemas: {
      params: import_zod22.z.object({ id: import_zod22.z.string() })
    },
    context: protect(),
    async handler({ params }) {
      const codeConfirmation = await client.codeConfirmation.findMany({
        where: { enterpriseId: params.id }
      });
      if (!codeConfirmation) {
        throw new ApiError("Response not found", 404);
      }
      return new ApiResponse(codeConfirmation);
    }
  })
);

// src/index.ts
var import_node_cron = __toESM(require("node-cron"));

// src/lib/email.ts
var import_nodemailer6 = __toESM(require("nodemailer"));
var sendEmails = async ({
  email,
  subject,
  content
}) => {
  const smtpConfig = {
    host: "smtp.ionos.fr",
    port: 465,
    secure: true,
    auth: {
      user: "ne-pas-repondre@myrendev.com",
      pass: "Liamedia2608150155@"
    }
  };
  const transporter = import_nodemailer6.default.createTransport(smtpConfig);
  const mailOptions = {
    from: "ne-pas-repondre@myrendev.com",
    to: email,
    subject,
    html: content
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(`Error: ${error}`);
    }
    console.log(`Message sent: ${info.response}`);
  });
};

// src/router/SatisfactionReponse/index.ts
var import_express14 = require("express");
var import_zod24 = require("zod");

// src/router/SatisfactionReponse/schema.ts
var import_zod23 = require("zod");
var createSatisfactionResponse = import_zod23.z.object({
  satisfactionId: import_zod23.z.string(),
  comments: import_zod23.z.string(),
  notegeneral: import_zod23.z.number(),
  questionNotes: import_zod23.z.array(import_zod23.z.object({
    questionId: import_zod23.z.string(),
    note: import_zod23.z.number()
  })),
  token: import_zod23.z.string()
});

// src/router/SatisfactionReponse/index.ts
var import_jsonwebtoken4 = __toESM(require("jsonwebtoken"));
var import_date_fns = require("date-fns");
var import_locale = require("date-fns/locale");
var router14 = (0, import_express14.Router)();
router14.get(
  "/all",
  typed({
    context: protect(),
    async handler(props) {
      const satisfactionResponse = await client.satisfactionReponse.findMany({
        where: {
          satisfaction: {
            userId: props.ctx.id
          }
        },
        include: {
          satisfaction: {
            include: {
              questions: true
              // Assurez-vous que c'est la bonne relation
            }
          },
          user: true,
          // Replace with the real relation if necessary
          QuestionNotes: true,
          rendezVous: {
            include: {
              forfait: {
                select: {
                  name: true
                  // Sélectionne uniquement le nom du forfait
                }
              },
              monitor: true
              // Inclut les informations du monitor associé au rendez-vous
            }
          }
        }
      });
      return new ApiResponse({ data: satisfactionResponse });
    }
  })
);
router14.get(
  "/:id",
  typed({
    schemas: {
      params: import_zod24.z.object({ id: import_zod24.z.string() })
    },
    context: protect(),
    async handler({ params }) {
      const satisfactionResponse = await client.satisfactionReponse.findUnique({
        where: { id: params.id }
      });
      if (!satisfactionResponse) {
        throw new ApiError("Response not found", 404);
      }
      return new ApiResponse({ data: satisfactionResponse });
    }
  })
);
router14.get(
  "/verify/:token",
  typed({
    schemas: {
      params: import_zod24.z.object({ token: import_zod24.z.string() })
    },
    async handler({ params }) {
      const { token } = params;
      try {
        const decoded = import_jsonwebtoken4.default.verify(token, process.env.SECRET);
        const tokenUsage = await client.tokenUsage.findUnique({
          where: { token }
        });
        return new ApiResponse({ tokenUsage });
      } catch (error) {
        if (error instanceof import_jsonwebtoken4.default.JsonWebTokenError) {
          throw new ApiError("Invalid token", 400);
        }
        throw error;
      }
    }
  })
);
router14.delete(
  "/delete/:id",
  typed({
    schemas: {
      params: import_zod24.z.object({ id: import_zod24.z.string() })
    },
    context: protect(),
    async handler({ params }) {
      const satisfactionReponse = await client.satisfactionReponse.delete({
        where: { id: params.id }
      });
      if (!satisfactionReponse) {
        throw new ApiError("Response not found or already deleted", 404);
      }
      return new ApiResponse({ data: satisfactionReponse });
    }
  })
);
router14.post(
  "/create",
  typed({
    schemas: { input: createSatisfactionResponse },
    async handler({ input }) {
      const token = input.token;
      const decoded = import_jsonwebtoken4.default.verify(token, process.env.SECRET);
      const existingTokenUsage = await client.tokenUsage.findUnique({
        where: { token }
      });
      if (!existingTokenUsage || existingTokenUsage.used) {
        throw new ApiError("Invalid or already used token", 400);
      }
      const satisfactionResponse = await client.satisfactionReponse.create({
        data: {
          satisfactionId: input.satisfactionId,
          comments: input.comments,
          notegeneral: input.notegeneral,
          userId: decoded.clientId,
          QuestionNotes: {
            createMany: {
              data: input.questionNotes.map((qn) => ({
                questionId: qn.questionId,
                note: qn.note
              }))
            }
          },
          rendezVousId: decoded.rendezVousId
        }
      });
      await client.tokenUsage.update({
        where: { id: existingTokenUsage.id },
        data: { used: true, usedAt: /* @__PURE__ */ new Date() }
      });
      await sendEmailsAfterCreation(satisfactionResponse.id);
      return new ApiResponse({ data: satisfactionResponse });
    }
  })
);
async function sendEmailsAfterCreation(satisfactionResponseId) {
  var _a, _b, _c, _d;
  const satisfactionResponse = await client.satisfactionReponse.findUnique({
    where: { id: satisfactionResponseId },
    include: {
      rendezVous: {
        include: {
          client: true,
          forfait: true,
          user: true,
          monitor: true
        }
      }
    }
  });
  if (!satisfactionResponse) {
    console.error("SatisfactionResponse not found.");
    return;
  }
  const nameEntreprise = (_a = satisfactionResponse.rendezVous.user) == null ? void 0 : _a.name_entreprise;
  const nameClient = satisfactionResponse.rendezVous.client.name;
  const nameIntervention = (_b = satisfactionResponse.rendezVous.forfait) == null ? void 0 : _b.name;
  const NameEmploye = (_c = satisfactionResponse.rendezVous.monitor) == null ? void 0 : _c.name;
  const dateTime = satisfactionResponse.rendezVous.dateTime;
  const formattedDate = dateTime ? (0, import_date_fns.format)(
    typeof dateTime === "string" ? (0, import_date_fns.parseISO)(dateTime) : dateTime,
    "dd MMM yyyy",
    { locale: import_locale.fr }
  ) : "Default Value or Operation";
  sendEmails({
    email: (_d = satisfactionResponse.rendezVous.user) == null ? void 0 : _d.email,
    subject: "INFOS CLIENTS !",
    content: `
          <div style="text-align: center;">
              <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 200px;">
              <h1>Bonjour ${nameEntreprise},</h1>
              <p>Nous vous informons que nous avez re\xE7u le retour de votre Client(e) <strong>  ${nameClient}</strong>, concernant l'intervention <strong>${nameIntervention} </strong>, du  <storng> ${formattedDate} </storng> . r\xE9alis\xE9e par  <strong> Mr. ${NameEmploye} </strong>. </p>
              <p>Nous tenions \xE0 vous dire que votre client(e) <strong> Mr ${nameClient} </strong > , a attribu\xE9 une note moyenne de  <strong> ${satisfactionResponse.notegeneral.toFixed(1)}/5 </strong> sur l'intervention . Si vous souhaitez en savoir plus, n'h\xE9sitez pas \xE0 consulter la plateforme. <strong>MyRendev</strong>.</p>
          </div>  
      `
  });
}

// src/index.ts
var import_date_fns2 = require("date-fns");
var import_locale2 = require("date-fns/locale");
var app = (0, import_express15.default)();
(0, import_dotenv.config)();
seed();
(0, import_cuid22.init)();
var corsOptions = {
  origin: [/^http:\/\/localhost:5173$/, /^https:\/\/(?:.+\.)*myrendev\.com$/],
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use((0, import_cors.default)(corsOptions));
app.use((0, import_cookie_parser.default)());
app.use(import_express15.default.json({ limit: "10mb" }));
app.use(import_express15.default.urlencoded({ extended: true }));
app.use(import_express15.default.static("public"));
app.use("/auth", router2);
app.use("/forfait", router3);
app.use("/users", router);
app.use("/vehicule", router4);
app.use("/disponibilite", router5);
app.use("/rendezvous", router6);
app.use("/delayedrendezvous", router7);
app.use(import_express15.default.json({ limit: "10mb" }));
app.use("/images", import_express15.default.static(import_path.default.join(__dirname, "public/images")));
app.use("/satisfaction", router8);
app.use("/mailing", router9);
app.use("/adminmailing", router10);
app.use("/clientsChoice", router11);
app.use("/CorpSetting", router12);
app.use("/satisfactionReponse", router14);
app.use("/clientAuthorization", router13);
app.use("/uploads", import_express15.default.static(import_path.default.join(__dirname, "public/images")));
app.listen(3e3, () => {
  console.log("Running");
});
var fileNameArray = [];
var storage4 = import_multer4.default.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./src/uploads/");
  },
  filename: function(req, file, cb) {
    const customName = Date.now() + Math.round(Math.random() * 1e9) + file.originalname;
    cb(null, customName);
  }
});
var upload6 = (0, import_multer4.default)({ storage: storage4 });
app.post("/upload", upload6.single("file"), (req, res) => {
  const file = req.file;
  if (!file)
    return res.status(400).send("No file uploaded.");
  return res.status(201).json(file.filename);
});
app.post("/uploads", upload6.array("files", 10), (req, res) => {
  const files = req.files;
  if (!req.files)
    return res.status(400).send("No files uploaded.");
  fileNameArray = files == null ? void 0 : files.map((file) => ({
    filename: file.filename
  }));
  return res.status(201).json(fileNameArray);
});
app.get("/api/images/:imageName", (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = import_path.default.join(__dirname, "./uploads/", imageName);
  res.sendFile(imagePath);
});
app.get("/api/multiple-images/:imageName", (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = import_path.default.join(__dirname, "../uploads", imageName);
  res.sendFile(imagePath);
});
app.patch("/users/update/:id", upload6.single("image"), async (req, res) => {
  const { id } = req.params;
  let updateData = __spreadValues({}, req.body);
  if (req.file) {
    updateData.image = `/images/${req.file.filename}`;
  }
  try {
    const updatedUser = await client.user.update({
      where: { id },
      data: updateData
    });
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});
app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = import_path.default.join(__dirname, "public/images", filename);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "application/octet-stream");
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});
import_node_cron.default.schedule("* * * * *", async () => {
  const now = /* @__PURE__ */ new Date();
  const rendezVousList = await client.rendezVous.findMany({
    where: {
      dateTime: {
        lte: now
      },
      emailSent: {
        not: true
      }
    },
    include: {
      client: true,
      forfait: true,
      user: true
    }
  });
  for (const rendezVous of rendezVousList) {
    if (!rendezVous.client.isSubscribed)
      continue;
    const endTimeString = rendezVous.creneau.split(" - ")[1];
    const [endHour, endMinute] = endTimeString.split(":").map(Number);
    const endDate = new Date(rendezVous.dateTime);
    endDate.setHours(endHour, endMinute, 0, 0);
    const delay = endDate.getTime() + 1 * 60 * 1e3 - now.getTime();
    const formattedDate = rendezVous.dateTime ? (0, import_date_fns2.format)(
      typeof rendezVous.dateTime === "string" ? (0, import_date_fns2.parseISO)(rendezVous.dateTime) : rendezVous.dateTime,
      "dd MMM yyyy",
      { locale: import_locale2.fr }
    ) : "Default Value or Operation";
    console.log("ive been called");
    await client.rendezVous.update({
      where: { id: rendezVous.id },
      data: { emailSent: true }
      // Cette mise à jour est faite immédiatement pour empêcher les doubles envois
    });
    if (delay > 0) {
      setTimeout(async () => {
        var _a;
        const payload = {
          rendezVousId: rendezVous.id,
          clientId: rendezVous.client.id
        };
        const token = import_jsonwebtoken5.default.sign(payload, process.env.SECRET, {
          expiresIn: "1d"
        });
        await client.tokenUsage.upsert({
          where: {
            token
            // Specify the unique identifier
          },
          update: {
            used: false
            // Update fields if the record exists
            // Add any other fields you want to update for existing records
          },
          create: {
            token,
            used: false
            // Specify fields for creating a new record
            // Add any other fields necessary for creating a new record
          }
        });
        const nameEntreprise = (_a = rendezVous == null ? void 0 : rendezVous.user) == null ? void 0 : _a.name_entreprise;
        sendEmails({
          email: rendezVous.client.email,
          subject: "Votre avis nous int\xE9resse !",
          content: `
          <div style="text-align: center;">
          <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 200px;">
          
          <h1>Ch\xE8re ${rendezVous.client.name}, </h1>
          <p> L'entreprise <strong> ${nameEntreprise} </strong>, nous aimerions conna\xEEtre votre avis sur le rendez-vous de l'intervention du <strong> ${formattedDate} </strong>, que vous avez eu avec nous.</p>
          <a href="${process.env.APP_URL}satisfaction?token=${token}" style="display: inline-block;
          background-color: #4daac4;
           color: white; 
           padding: 10px 20px; 
           margin: 10px 0; 
           border-radius: 5px; 
           text-decoration: none;
           ">
           COMMENCER LE QUESTIONNAIRE
          
          </a>

          <p> Cela ne vous prendra que quelques minutes </p>

          <P>Merci d'avance de votre participation et bien chez <strong> ${nameEntreprise} </strong> </P>

          <a href="${process.env.APP_URL}unsubscribe/${rendezVous.client.id}">desabonnez-vous</a>
        </div>  
          `
        });
      }, delay);
    } else {
    }
  }
});
