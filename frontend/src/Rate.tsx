import React, { useEffect, useState } from "react";
import { Rate } from "antd";
import Button from "./components/Button";
import { Rating } from "@mui/material";
import { useAuth } from "./lib/hooks/auth";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import useSWR from "swr";
import { fetcher } from "./axios";

interface Question {
  id: number;
  text: string;
  rating: number;
}
interface Satisfaction {
  // title: string;
  id:string;
  questions: Question[];
  comment: String;
  redirect_url: string;
  redirect_grade: number;
}

interface SatisfactionData {
  data:{
    Satisfaction: Satisfaction[];
  }
}

// interface SatisfactionReponse{
//   satisfactionId: String;
//   comments:  String;
//   note: number;
//   userId: String;
// }

function App({}) {
  const customStyle = {
    fontSize: 20, // Adjust the size as per your preference
    color: "blue",
  };
  const navigate = useNavigate();
  const [formComment, setFormComment] = useState("");
  const [selectedSatisfactionId, setSelectedSatisfactionId] = useState<string>("");

  const [questions, setQuestions] = useState<Question[]>([]);

  const {token}= useParams();


  const handleRatingChange = (newRating: number, questionId: number) => {
    const updatedQuestions = questions.map((question) =>
      question.id === questionId ? { ...question, rating: newRating } : question
    );

    setQuestions(updatedQuestions);
  };

  const calculateAverageRating = (): number | null => {
    if (questions.length === 0) return null;
    const total = questions.reduce((acc, question) => acc + question.rating, 0);
    return total / questions.length;
  };
  const averageRating = calculateAverageRating();

  const {
    data: satisfactions,
    isLoading: loadingSatisfactions,
    error: errorSatisfactions,
    mutate: refresh,
  } = useSWR("/satisfaction/clientSatifaction", async (url) => {
    const response = await fetcher.get(url,{
        params:{
          token,
        }
    });
    console.log("API Response:", response.data);
    const satisfaction = response.data as SatisfactionData;
    setQuestions(satisfaction.data.Satisfaction[0]?.questions);
    return satisfaction;
  });

  // useEffect(() => {
  //   if (satisfactionId) {
  //     fetcher
  //       .get(`/satisfaction/${satisfactionId}`)
  //       .then((res) => {
  //         console.log("Satisfaction data:", res.data);
  //         setData(res.data);
  //         setQuestions(res.data.questions);
  //       })
  //       .catch((err) => {
  //         console.error("Error fetching satisfaction data:", err);
  //       });
  //   }
  // }, [satisfactionId]);

  // useEffect(() => {
  //   console.log(questions);
  // }, [questions]);

  // console.log(satisfactions?.data?.Satisfaction[0].id, "tghth");

  // useEffect(() => {
  //   console.log("ID actuel:", satisfactionId);
  // }, [satisfactionId]);

  // useEffect(() => {
  //   if (satisfactions?.data?.Satisfaction?.length > 0) {
  //     setSelectedSatisfactionId(satisfactions?.data?.Satisfaction[0].id);
  //   }
  // }, [satisfactions]);

  useEffect(() => {
    if (satisfactions?.data?.Satisfaction && satisfactions?.data?.Satisfaction?.length > 0) {
      setQuestions(satisfactions?.data?.Satisfaction[0].questions);
      setSelectedSatisfactionId(satisfactions?.data?.Satisfaction[0].id);
    }
  }, [satisfactions]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!selectedSatisfactionId) {
      console.error("ID de satisfaction non spécifié");
      return;
    }


    const postData = {
      satisfactionId: selectedSatisfactionId,
      comments: formComment,
      note: averageRating,
      token: token,
    };

    const redirectGrade = satisfactions?.data?.Satisfaction[0]?.redirect_grade!;
    const redirectUrl = satisfactions?.data?.Satisfaction[0]?.redirect_url!;

    fetcher
      .post(`/satisfactionreponse/create`, postData) // Assurez-vous que l'URL correspond au point de terminaison de votre API pour créer une réponse de satisfaction
      .then((res) => {
        // Logique de redirection après création réussie
        if (averageRating !== null && averageRating > redirectGrade) {
          window.location.href = redirectUrl
          } else {
          navigate("/messagePage"); // ou une autre logique de redirection
        }
      })
      .catch((err) => {
        console.error(
          "Erreur lors de la création de la réponse de satisfaction:",
          err
        );
      });
  };




  return (
    <div className="min-h-screen bg-white py-6 flex flex-col justify-center sm:py-12">
      <form className="row g-3 " onSubmit={handleSubmit}>
        <div className="py-3 sm:max-w-xl sm:mx-auto">
          <div className="bg-white min-w-1xl flex flex-col rounded-xl shadow-lg">
            <div className="px-12 py-5 text-center">
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
                    {Array.isArray(satisfactions?.data?.Satisfaction) &&
                      satisfactions?.data?.Satisfaction?.map((satisfaction) => (
                        <div key={satisfaction?.id}>
                          {satisfaction.questions.map((question) => (
                            <div
                              key={question.id}
                              className="flex flex-col items-center mb-8"
                            >
                              <div className="mb-4">{question.text}</div>
                              <Rate
                                allowHalf
                                value={questions[question.id]?.rating}
                                onChange={(newRating) =>
                                  handleRatingChange(newRating, question.id)
                                }
                                style={customStyle}
                              />
                            </div>
                          ))}
                        </div>
                      ))}
                  </span>
                </>
              </div>
              <div className="w-3/4 flex flex-col">
                <textarea
                  id="feedback"
                  rows={3}
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  className="p-4 text-gray-500 rounded-xl resize-none"
                  placeholder="Laissez un message, si vous le souhaitez"
                ></textarea>

                <Button
                  className="py-3 my-8 text-lg bg-gradient-to-r  rounded-xl text-white"
                  type="submit"
                >
                  Évaluez maintenant
                </Button>
              </div>
            </div>
          </div>
          <div className="h-20 flex items-center justify-center">
            {averageRating !== null && (
              <Rate allowHalf value={averageRating} style={customStyle} />
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
    </div>
  );
}

export default App;
