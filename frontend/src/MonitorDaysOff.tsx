import MultipleDayPicker from "../src/components/DayPicker";

function MonitorDaysOff() {
	return (
		<div className="container mx-auto px-6 sm:px-4 py-10">
			<h1 className="text-2xl font-bold lg:pl-10 mb-5">Demande Congé</h1>
			<MultipleDayPicker param={true} onDataFromChild={() => {}} />
		</div>
	);
}

export default MonitorDaysOff;
