import React, { useEffect, useState } from "react";
import { Alert, Rate, Result, message } from "antd";
// import Button from "./components/Button";
import { Button, Flex } from "antd";
import { Rating } from "@mui/material";
import { useAuth } from "./lib/hooks/auth";
import {
	Link,
	Navigate,
	useNavigate,
	useParams,
	useSearchParams,
} from "react-router-dom";
import axios from "axios";
import useSWR from "swr";
import { fetcher } from "./axios";

interface Question {
	id: number;
	text: string;
	rating: number;
}

interface Question {
	id: number;
	text: string;
	note: number; // Ajout du champ 'note'
}
interface Satisfaction {
	id: string;
	questions: Question[];
	comment: String;
	redirect_url: string;
	redirect_grade: number;
}

interface SatisfactionData {
	data: {
		Satisfaction: Satisfaction[];
	};
}

function Satisfaction({}) {
	const customStyle = {
		fontSize: 20,
		color: "blue",
	};
	const navigate = useNavigate();
	const [formComment, setFormComment] = useState("");
	const [selectedSatisfactionId, setSelectedSatisfactionId] =
		useState<string>("");

	const queryParams = new URLSearchParams(window.location.search);
	const token = queryParams.get("token");

	const [questions, setQuestions] = useState<Question[]>([]);
	const [loadings, setLoadings] = useState<boolean[]>([]);

	const handleRatingChange = (newRating: number, questionId: number) => {
		const updatedQuestions = questions.map((question) =>
			question.id === questionId
				? { ...question, note: newRating }
				: question
		);

		setQuestions(updatedQuestions);
	};

	const calculateAverageRating = (): number | null => {
		if (questions.length === 0) return null;
		const total = questions.reduce(
			(acc, question) => acc + question.note,
			0
		); // Utilisez question.note
		return total / questions.length;
	};

	const averageRating = calculateAverageRating();

	const {
		data: satisfactions,
		isLoading: loadingSatisfactions,
		error: errorSatisfactions,
		mutate: refresh,
	} = useSWR("/satisfaction/clientSatifaction", async (url) => {
		const response = await fetcher.get(
			`${url}?token=${queryParams.get("token")}`
		);

		const satisfaction = response.data as SatisfactionData;
		setQuestions(satisfaction.data.Satisfaction[0]?.questions);
		return satisfaction;
	});
	useEffect(() => {
		// Assuming that the first satisfaction is the one we want
		const firstSatisfaction = satisfactions?.data.Satisfaction[0];
		if (firstSatisfaction) {
			setQuestions(
				firstSatisfaction.questions.map((q) => ({ ...q, rating: 0 }))
			); // Initialize all ratings to 0
		}
	}, [satisfactions]);

	useEffect(() => {
		if (
			satisfactions?.data?.Satisfaction &&
			satisfactions?.data?.Satisfaction?.length > 0
		) {
			setQuestions(satisfactions?.data?.Satisfaction[0].questions);
			setSelectedSatisfactionId(satisfactions?.data?.Satisfaction[0].id);
		}
	}, [satisfactions]);

	const handleSubmit = async (event) => {
		event.preventDefault();

		// Start loading immediately
		setLoadings((prevLoadings) => {
			const newLoadings = [...prevLoadings];
			newLoadings[0] = true;
			return newLoadings;
		});

		// Introduce a delay before performing redirection logic
		setTimeout(async () => {
			try {
				const postData = {
					satisfactionId: selectedSatisfactionId,
					comments: formComment,
					notegeneral: averageRating,
					token: queryParams.get("token"),
					questionNotes: questions.map(({ id, note }) => ({
						questionId: id,
						note,
					})),
				};

				await fetcher.post(`/satisfactionreponse/create`, postData);
				// await fetcher.post('/satisfactionreponse/emails-to-entreprise');
				const redirectGrade =
					satisfactions?.data?.Satisfaction[0]?.redirect_grade!;
				const redirectUrl =
					satisfactions?.data?.Satisfaction[0]?.redirect_url!;

				// Redirection logic after successful creation and delay
				if (averageRating !== null && averageRating >= redirectGrade) {
					message.info(
						"Merci pour votre avis. Nous allons vous rediriger vers notre lien Google Avis dans quelques instants. Nhésitez pas à nous laisser votre avis.",
						4,
						() => (window.location.href = redirectUrl)
					);
				} else {
					navigate("/messagePage"); // or another logic for redirection
				}
			} catch (err) {
				console.error(
					"Erreur lors de la création de la réponse de satisfaction:",
					err
				);
			} finally {
				// Stop loading after attempting submission and logic execution
				setLoadings((prevLoadings) => {
					const newLoadings = [...prevLoadings];
					newLoadings[0] = false;
					return newLoadings;
				});
			}
		}, 3000);
	};

	// const enterLoading = (index: number) => {
	//   setLoadings((prevLoadings) => {
	//     const newLoadings = [...prevLoadings];
	//     newLoadings[index] = true;
	//     return newLoadings;
	//   });

	//   setTimeout(() => {
	//     setLoadings((prevLoadings) => {
	//       const newLoadings = [...prevLoadings];
	//       newLoadings[index] = false;
	//       return newLoadings;
	//     });
	//   }, 6000);
	// };

	const [isLoading, setIsLoading] = useState(true); // Corrected to include isLoading state
	const [isTokenValid, setIsTokenValid] = useState(true);

	useEffect(() => {
		const verifyToken = async () => {
			if (!token) {
				return; // Early exit if no token is present
			}

			setIsLoading(true);
			try {
				const response = await fetcher.get(
					`/satisfactionReponse/verify/${token}`
				);

				if (response.data.message !== "Token is valid and not used") {
					// navigate("/valid");
					setIsTokenValid(response.data?.tokenUsage?.used);
				}
			} catch (error) {
				console.error("Error verifying token:", error);
				// Consider handling different types of errors differently
			} finally {
				setIsLoading(false);
			}
		};

		verifyToken();
	}, [token, navigate]);

	return (
		<div className="min-h-screen bg-white py-6 flex flex-col justify-center sm:py-12">
			{!isTokenValid ? (
				<form className="row g-3 " onSubmit={handleSubmit}>
					<div className="py-3 sm:max-w-xl sm:mx-auto">
						<div className="bg-white min-w-1xl flex flex-col rounded-xl shadow-lg">
							<div className="px-12 py-6 text-center">
								<h2 className="text-gray-800 text-3xl font-semibold">
									Votre Avis Nous Intéresse!
								</h2>
							</div>

							{/* {satisfactions?.map((satisfaction, index) => {
              return <div key={index}>{satisfaction.question}</div>;
            })} */}

							<div className="bg-blue-200 w-full flex flex-col items-center">
								<div className="flex flex-col items-center py-6 space-y-3">
									<>
										<span className="italic text-xl text-gray-800">
											{Array.isArray(
												satisfactions?.data
													?.Satisfaction
											) &&
												satisfactions?.data?.Satisfaction?.map(
													(satisfaction) => (
														<div
															key={
																satisfaction?.id
															}
														>
															{satisfaction.questions.map(
																(question) => (
																	<div
																		key={
																			question.id
																		}
																		className="flex flex-col items-center mb-8"
																	>
																		<div className="mb-4">
																			{
																				question.text
																			}
																		</div>
																		<Rate
																			allowHalf
																			value={
																				question.note
																			} // Utilisez directement `question.note` au lieu de `questions[question.id]?.rating`
																			onChange={(
																				newRating
																			) =>
																				handleRatingChange(
																					newRating,
																					question.id
																				)
																			}
																			style={
																				customStyle
																			}
																		/>
																	</div>
																)
															)}
														</div>
													)
												)}
										</span>
									</>
								</div>
								<div className="w-3/4 flex flex-col">
									<textarea
										id="feedback"
										rows={3}
										value={formComment}
										onChange={(e) =>
											setFormComment(e.target.value)
										}
										className="p-4 text-gray-500 rounded-xl resize-none"
										placeholder="Laissez un message, si vous le souhaitez"
									></textarea>

									{/* <Button
                    className="py-3 my-8 text-lg bg-gradient-to-r  rounded-xl text-white"
                    type="submit"
                  >
                    Évaluez maintenant
                  </Button> */}

									<Button
										className=" my-8 px-4 me-2 mb-10 text-sm font-medium text-center text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:focus:ring-cyan-800 rounded-xl"
										type="primary"
										loading={loadings[0]}
										onClick={handleSubmit}
									>
										Évaluez maintenant
									</Button>
								</div>
							</div>
						</div>
						<div className="h-20 flex items-center justify-center">
							{averageRating !== null && (
								<div className="flex items-center">
									<Rate
										allowHalf
										value={averageRating}
										style={customStyle}
									/>
									<div
										style={{
											marginLeft: "10px",
											fontWeight: "bold",
										}}
									>
										{typeof averageRating === "number" &&
										!isNaN(averageRating)
											? averageRating.toFixed(1)
											: ""}
										/5
									</div>
								</div>
							)}
						</div>

						<div className="mt-8 text-gray-700 flex flex-row justify-center">
							<div>
								<a className="font-bold" href="#">
									MyRendev
								</a>
							</div>
						</div>
					</div>
				</form>
			) : (
				<div>
					<Result
						title="Vous avez déjà répondu au questionnaire."
						// extra={
						//   <Button type="primary" key="console">
						//     Go Console
						//   </Button>
						// }
					/>
				</div>
			)}
		</div>
	);
}

export default Satisfaction;
