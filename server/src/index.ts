import express, { response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { usersRouter } from "@/router/users";
import { authRouter } from "@/router/auth";
import multer from "multer";
import path from "path";
import { forfaitRouter } from "./router/forfait";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { vehiculeRouter } from "./router/vehicule";
import { disponibiliteRouter } from "./router/disponibilite";
import { seed } from "./seed";
import { rendezvousRouter } from "./router/rendezvous"; // Add this line
import { delayedRendezvousRouter } from "./router/delayedrendezvous"; // Add this line
import { init } from "@paralleldrive/cuid2";
import { client } from "./prisma";
import { satisfactiontRouter } from "@/router/Satisfaction";
import { emailRouter } from "./router/mailing";
import { emailAdminRouter } from "./router/adminmailing";
import { clientChoiceRouter } from "./router/clientsChoice";
import { CorpSettingRouter } from "./router/CorpSetting";
import { clientAuthorizationRouter } from "./router/clientAuthorization";
import nodemailer from "nodemailer";
import cron from "node-cron";
import { sendEmails } from "./lib/email";
import { satisfactionReponseRouter } from "./router/SatisfactionReponse"; // Adjust the path as necessary
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

/*
setup
*/
const app = express();
config();
seed();
init();
const corsOptions = {
	origin: [/^http:\/\/localhost:5173$/, /^https:\/\/(?:.+\.)*myrendev\.com$/],
	credentials: true,
	methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/auth", authRouter);
app.use("/forfait", forfaitRouter);
app.use("/users", usersRouter);
app.use("/vehicule", vehiculeRouter);
app.use("/disponibilite", disponibiliteRouter);
app.use("/rendezvous", rendezvousRouter);
app.use("/delayedrendezvous", delayedRendezvousRouter);
app.use(express.json({ limit: "10mb" }));
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/satisfaction", satisfactiontRouter);
app.use("/mailing", emailRouter);
app.use("/adminmailing", emailAdminRouter);
app.use("/clientsChoice", clientChoiceRouter);
app.use("/CorpSetting", CorpSettingRouter);
app.use("/satisfactionReponse", satisfactionReponseRouter);
app.use("/clientAuthorization", clientAuthorizationRouter);
app.use("/uploads", express.static(path.join(__dirname, "public/images")));

app.listen(3000, () => {
	console.log("Running");
});

let fileNameArray: { filename: string }[] = [];
interface CustomRequest extends express.Request {
	someData: string;
}

const attachDataMiddleware = (
	req: any,
	res: express.Response,
	next: express.NextFunction
) => {
	req.someData = fileNameArray;
	next();
};

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		// cb(null, "./src/uploads/");
		cb(null, "./uploads/");
	},
	filename: function (req, file, cb) {
		const customName =
			Date.now() + Math.round(Math.random() * 1e9) + file.originalname;
		cb(null, customName);
	},
});

const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
	const file = req.file;
	if (!file) return res.status(400).send("No file uploaded.");
	return res.status(201).json(file.filename);
});

app.post("/uploads", upload.array("files", 10), (req, res) => {
	const files: any = req.files;
	if (!req.files) return res.status(400).send("No files uploaded.");
	const fileNames = files.map((file: any) => file.filename);
	return res.status(201).json(fileNames);
});

app.get("/api/images/:imageName", (req, res) => {
	const imageName = req.params.imageName;
	const imagePath = path.join(__dirname, "./uploads/", imageName);

	res.sendFile(imagePath);
});
app.get("/api/multiple-images/:imageName", (req, res) => {
	const imageName = req.params.imageName;
	const imagePath = path.join(__dirname, "../uploads", imageName);

	res.sendFile(imagePath);
});

app.patch("/users/update/:id", upload.single("image"), async (req, res) => {
	const { id } = req.params;
	let updateData = { ...req.body };

	if (req.file) {
		updateData.image = `/images/${req.file.filename}`;
	}

	try {
		const updatedUser = await client.user.update({
			where: { id },
			data: updateData,
		});
		res.json({ success: true, user: updatedUser });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
});

app.get("/download/:filename", (req, res) => {
	const filename = req.params.filename;
	const filePath = path.join(__dirname, "public/images", filename);
	res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
	res.setHeader("Content-Type", "application/octet-stream");
	res.sendFile(filePath, (err) => {
		if (err) {
			console.error("Error sending file:", err);
			res.status(500).send("Internal Server Error");
		}
	});
});

cron.schedule("* * * * *", async () => {
	const now = new Date();

	const rendezVousList = await client.rendezVous.findMany({
		where: {
			dateTime: {
				lte: now,
			},
			emailSent: {
				not: true,
			},
		},
		include: {
			client: true,
			forfait: true,
			user: true,
		},
	});

	for (const rendezVous of rendezVousList) {
		if (!rendezVous.client.isSubscribed) continue;
		const endTimeString = rendezVous.creneau.split(" - ")[1];
		const [endHour, endMinute] = endTimeString.split(":").map(Number);
		const endDate = new Date(rendezVous.dateTime);
		endDate.setHours(endHour, endMinute, 0, 0);
		const delay = endDate.getTime() + 1 * 60 * 1000 - now.getTime();
		// const formattedDate = moment(rendezVous.dateTime).format("DD MMM YYYY");

		const formattedDate = rendezVous.dateTime
			? format(
					typeof rendezVous.dateTime === "string"
						? parseISO(rendezVous.dateTime)
						: rendezVous.dateTime,
					"dd MMM yyyy",
					{ locale: fr }
			  )
			: "Default Value or Operation";

		console.log("ive been called");

		await client.rendezVous.update({
			where: { id: rendezVous.id },
			data: { emailSent: true }, // Cette mise à jour est faite immédiatement pour empêcher les doubles envois
		});

		if (delay > 0) {
			setTimeout(async () => {
				const payload = {
					rendezVousId: rendezVous.id,
					clientId: rendezVous.client.id,
				};

				const token = jwt.sign(payload, process.env.SECRET!, {
					expiresIn: "1d",
				});

				await client.tokenUsage.upsert({
					where: {
						token: token, // Specify the unique identifier
					},
					update: {
						used: false, // Update fields if the record exists
						// Add any other fields you want to update for existing records
					},
					create: {
						token: token,
						used: false, // Specify fields for creating a new record
						// Add any other fields necessary for creating a new record
					},
				});

				const nameEntreprise = rendezVous?.user?.name_entreprise;

				// L'envoi de l'e-mail est effectué ici, après le délai de 2 minutes
				sendEmails({
					email: rendezVous.client.email,
					subject: "Votre avis nous intéresse",
					content: `
          <div style="text-align: center;">
          <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 200px;">
          
          <h1>Chère ${rendezVous.client.name}, </h1>
          <p> L'entreprise <strong> ${nameEntreprise} </strong>, nous aimerions connaître votre avis sur le rendez-vous de l'intervention du <strong> ${formattedDate} </strong>, que vous avez eu avec nous.</p>
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
          `,
				});

				// Si nécessaire, une confirmation d'envoi peut être enregistrée ici, mais cela pourrait nécessiter une logique supplémentaire pour gérer les cas où l'envoi échoue après cette étape.
			}, delay);
		} else {
		}
	}
});
