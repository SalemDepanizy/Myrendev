import { client } from "@/prisma";
import bcrypt from "bcrypt";

export async function seed() {
	const connectionMessage = await checkDatabaseConnection();
	console.log(connectionMessage);

	await users([
		{
			email: "student1@example.com",
			password: "student1pass",
			name: "John",
			lastname: "Doe",
			type: "STUDENTS",
		},
		{
			email: "student2@example.com",
			password: "student2pass",
			name: "Jane",
			lastname: "Smith",
			type: "STUDENTS",
		},
		{
			email: "monitor1@example.com",
			password: "monitor1pass",
			name: "Robert",
			lastname: "Johnson",
			type: "MONITOR",
		},
		{
			email: "admin@example.com",
			password: "adminpass",
			name: "Admin",
			lastname: "User",
			type: "ADMIN",
		},
		{
			email: "commercial@example.com",
			password: "commercialpass",
			name: "Sarah",
			lastname: "Brown",
			type: "COMMERCIAL",
		},
		{
			email: "enterprise1@example.com",
			password: "enterprisepass",
			name_entreprise: "Enterprise1",
			name_manager: "Manager",
			name: "Michael",
			lastname: "Williams",
			type: "ENTREPRISE",
		},
		{
			email: "enterprise2@example.com",
			password: "enterprisepass",
			name_entreprise: "Enterprise2",
			name_manager: "Manager",
			name: "Michael",
			lastname: "Williams",
			type: "ENTREPRISE",
		},
	]);
	console.log("Seeding complete");
}

async function users(
	data: {
		email: string;
		password: string;
		name: string;
		name_entreprise?: string;
		name_manager?: string;
		lastname: string;
		type: "STUDENTS" | "MONITOR" | "ADMIN" | "COMMERCIAL" | "ENTREPRISE";
	}[]
) {
	for (const user of data) {
		const currentUser = await client.user.findUnique({
			where: {
				email: user.email,
			},
		});
		if (currentUser) continue;
		await client.user.create({
			data: { ...user, password: await bcrypt.hash(user.password, 10) },
		});
		console.log(`Creating user: ${user.email}`);
	}
}

async function checkDatabaseConnection() {
	try {
		// Try to retrieve a unique record using a table from your schema
		// Make sure the table and column exist in your database
		const response = await client.$queryRaw`SELECT 1`;
		// If no error is thrown, the connection to the database is successful
		console.log("Database connection successful.");
		return "Database connection successful.";
	} catch (error) {
		// If an error is thrown, the connection to the database has failed
		console.error("Failed to connect to the database:", error);
		return "Failed to connect to the database.";
	}
}

export function init() {}
