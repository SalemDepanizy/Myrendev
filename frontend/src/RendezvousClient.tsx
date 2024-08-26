import React, { useEffect, useState } from "react";
import moment from "moment"; // Assuming you are using moment for date handling in Timetable
import Timetable from "./components/Timetable";
import { fetcher } from "./axios";
import { tokenAtom } from "./lib/atoms/auth";
import useSWR from "swr";
import { Result } from "antd";
import { set } from "date-fns";

function RendezvousClient() {
	const [verifer, setverifer] = React.useState(false);
	const [token, setToken] = React.useState<any>();
	const [isConfirmed, setIsConfirmed] = useState(false); // Adjusted state for clarity

	useEffect(() => {
		const queryParams = new URLSearchParams(window.location.search);
		const tokenParam = queryParams.get("token");
		setToken(tokenParam);
		if (tokenParam) {
			fetcher(`/rendezvous/validatetoken/${tokenParam}`, {
				method: "POST",
			})
				.then((response) => {
					// Directly access the data property from the Axios response
					const data = response.data;

					if (data.slotConfirmed) {
						setIsConfirmed(true); // Update based on slotConfirmed status
					} else {
						setverifer(true); // Adjusted to setVerifer for naming consistency; define it if not already defined
					}
				})
				.catch((error) =>
					console.error("Error validating token:", error)
				);
		}
	}, []);

	const [days, setDays] = useState("");
	const [available, setAvailable] = useState("");

	const {
		data: donnees,
		isLoading: loadingStudents,
		error: errorStudents,
	} = useSWR("/clientsChoice/get/all", async (url) => {
		return (await fetcher.get(url)).data as any[];
	});

	const [date, setDate] = useState<any>();
	const [relationKey, setRelationKey] = useState<string>("");
	const [options, setOptions] = useState<string[]>([]);
	const [tempsInter, setTempsInter] = useState<number>(0);
	const [staffs, setStaffs] = useState<string[]>([]);

	useEffect(() => {
		if (donnees) {
			const filteredData = donnees?.filter(
				(donnee) => donnee.key === token
			);
			console.log("filteredData:", filteredData);
			const relationKey = filteredData[0].relationKey;
			const date = new Date(filteredData[0].date);
			const mydate = date.toISOString();

			const tempsInter = filteredData[0].tempsInter;

			const options = filteredData[0].options;
			const staffs = filteredData[0].staffIds;
			setTempsInter(tempsInter);
			setOptions(options);
			setRelationKey(relationKey);
			setDate(mydate);
			setStaffs(staffs);
		}
	});

	const donneesFiltrees = donnees?.filter((donnee) => donnee.key === token);

	useEffect(() => {
		if (donneesFiltrees && donneesFiltrees.length > 0) {
			setDays(donneesFiltrees[0].days);

			setAvailable(donneesFiltrees[0].available);
		} else {
			console.log("Aucune donnée avec la clé spécifiée trouvée.");
		}
	});
	// Dummy data for demonstration, replace with actual data/logic as needed
	// const date = moment(); // Current date, for example
	const hours = 2; // Example hours value

	// Styles
	const cardStyle = {
		maxWidth: "90%", // Adjust the card width as needed
		margin: "20px auto", // Centers the card on the page with margin top and bottom
		padding: "20px", // Padding inside the card
		boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Simple box shadow for a card-like appearance
		borderRadius: "10px", // Optional: rounds the corners of the card
	};

	return (
		<div style={cardStyle}>
			{/* Conditional rendering based on isConfirmed state */}
			{isConfirmed ? (
				<Result title="Vous avez déjà sélectionné un créneau." />
			) : (
				<Timetable
					token={token}
					relationKey={relationKey}
					date={moment(date)} // Use moment() to get the current date
					daysFirst={days}
					available={available}
					hours={2} // Example: Assume 2 hours is a value you've determined
					onDataFromChild={(data) => {}} // Placeholder function, replace or remove as necessary
					limiterHours={0}
					limiterMinutes={0}
					options={options}
					tempsInter={tempsInter}
					staffs={staffs}
				/>
			)}
		</div>
	);
}

export default RendezvousClient;
