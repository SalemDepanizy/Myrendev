import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AvisDashboard({
	satisfactionResponse,
}: {
	satisfactionResponse: any;
}) {
	const navigate = useNavigate();
	const [satisfactionStats, setSatisfactionStats] = useState({
		tresSatisfait: 0,
		satisfait: 0,
		insatisfait: 0,
	});

	useEffect(() => {
		if (satisfactionResponse?.data) {
			const total = satisfactionResponse.data.length;
			const counts = satisfactionResponse.data.reduce(
				(acc, cur) => {
					if (cur.notegeneral < 2.5) acc.insatisfait++;
					else if (cur.notegeneral <= 3.5) acc.satisfait++;
					else acc.tresSatisfait++;
					return acc;
				},
				{ insatisfait: 0, satisfait: 0, tresSatisfait: 0 }
			);

			setSatisfactionStats({
				insatisfait: (counts.insatisfait / total) * 100,
				satisfait: (counts.satisfait / total) * 100,
				tresSatisfait: (counts.tresSatisfait / total) * 100,
			});
		}
	}, [satisfactionResponse]);

	const handleStatClick = (category) => {
		navigate(`/Details/${category}`);
	};

	return (
		<div>
			<div className="bg-white shadow-md hover:shadow-lg px-4 py-6 border border-gray-900/10 rounded-xl">
				<h4 className="text-lg font-semibold text-gray-700">
					Notation
				</h4>
				<div className="flex flex-row-reverse flex-wrap justify-center gap-4 mt-2">
					{Object.entries(satisfactionStats)?.map(([key, value]) => {
						const svgPath = {
							tresSatisfait:
								"M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z",
							satisfait:
								"M15.182 15.182a25.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z",
							insatisfait:
								"M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z",
						}[key];
						return (
							<div
								className="relative flex flex-col items-center py-2 rounded-full cursor-pointer transform transition-transform duration-300 hover:scale-110"
								onClick={() => handleStatClick(key)}
								style={{ minWidth: "150px" }}
								key={key}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
									className={`w-16 h-16 ${
										key === "insatisfait"
											? "text-red-500"
											: key === "satisfait"
											? "text-blue-500"
											: "text-green-500"
									}`}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d={svgPath}
									/>
								</svg>
								<div className="absolute bottom-full mb-2 w-32 bg-black text-red-500 text-center text-xs rounded py-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
									Lorem Ipsum
								</div>
								<div className="text-center">
									<h2 className="text-3xl font-bold">
										{isNaN(value) ? "0" : value.toFixed(0)}%
									</h2>
									<h5 className="text-gray-500 mt-1">
										{key === "tresSatisfait"
											? "Très satisfait"
											: key === "satisfait"
											? "Satisfait"
											: "Insatisfait"}
									</h5>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export default AvisDashboard;
