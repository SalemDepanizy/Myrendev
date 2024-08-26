import axios from "axios";
import { tokenAtom } from "../lib/atoms/auth";

export const fetcher = axios.create({
	// baseURL: "https://api.myrendev.com/",
	// baseURL: "https://api.myrendev.com/",
	baseURL: "http://localhost:3000/",

	withCredentials: true,
	headers: {
		Authorization: `Bearer ${tokenAtom.snapshot() ?? "error"}`,
	},
});
