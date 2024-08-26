import Permit from "./lib/hooks/Permit";
import DashboardEntrp from "./components/DashboardEntrp";
import DashboardClient from "./components/DashboardClient";
import DashboardEmpl from "./components/DashboardEmpl";

function Home() {
	return (
		<div>
			<Permit roles={["ENTREPRISE", "ADMIN"]}>
				<DashboardEntrp />
			</Permit>
			<Permit roles={["STUDENTS"]}>
				<DashboardClient />
			</Permit>
			<Permit roles={["MONITOR"]}>
				<DashboardEmpl />
			</Permit>
		</div>
	);
}

export default Home;
