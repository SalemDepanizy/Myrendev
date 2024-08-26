import React, { useState } from "react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { fetcher } from "../axios";
import useSWR, { mutate } from "swr";

interface QuestionData {
  id: number;
  text: string;
}

interface AddSatisfactionProps {
  onSatisfactionCreated: () => void;
}

interface SatisfactionData {
  title: string;
  question: QuestionData[];
  redirect_url: string;
  redirect_grade: number;
  comment: String;
}

function AddSatisfaction({ onSatisfactionCreated }: AddSatisfactionProps) {
  const [data, setData] = useState<SatisfactionData>({
    title: "",
    question: [],
    redirect_url: "",
    redirect_grade: 0,
    comment: " ",
  });

  const [rangeValue, setRangeValue] = useState(1);
  const [formTitle, setFormTitle] = useState("");
  const [urlRedirection, setUrlRedirection] = useState("https://");
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuestionData[]>([
    { id: 1, text: "" }, // Vous pouvez avoir une question par défaut ici
  ]);
  // const { data: satisfactions } = useSWR("/satisfaction/all", fetcher);

  // const { data: rendezvous } = useSWR(
  //   "/rendezvous/all",
  //   async (url) => {
  //     const rendezvous = (await (
  //       await fetcher.get(url)
  //     ).data) as {
  //       id: string;
  //       title: string;
  //       dateTime: string;
  //       crenau: string;
  //     }[];

  //     return rendezvous;
  //   },
  //   {
  //     onSuccess: (data) => {
  //       if (data.length) {
  //         setRendezvousId(data[0].id);
  //       }
  //     },
  //   }
  // );

  const [rendezvousId, setRendezvousId] = useState("");

  const handleAddQuestion = () => {
    const newQuestion: QuestionData = {
      id: questions.length + 1,
      text: "",
    };
    setQuestions(questions.concat(newQuestion));
  };

  const handleRemoveQuestion = (id: number) => {
    setQuestions(questions.filter((question) => question.id !== id));
  };

  const handleQuestionChange = (id: number, newText: string) => {
    const updatedQuestions = questions.map((question) =>
      question.id === id ? { ...question, text: newText } : question
    );
    setQuestions(updatedQuestions);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const questionsData = questions.map((question) => ({
      text: question.text,
      // Assurez-vous que cette valeur est définie
    }));

    const submitData = {
      ...data,
      title: formTitle,
      questions: questionsData, // Assurez-vous que cette valeur est correctement définie
      redirect_url: urlRedirection,
      redirect_grade: rangeValue,
      comment: "",
      rendezvous_id: rendezvousId,
      // Ajoutez d'autres champs si nécessaire
    };
    fetcher
      .post("/satisfaction/create", submitData)
      .then((res) => {
        onSatisfactionCreated();
        window.location.reload();
      })
      .catch((err) => {
        console.error("Error during request:", err);
      });
  };

  

  return (
    <div className="flex justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <h2 className="text-2xl font-medium text-gray-900 mb-4">
          Créer un formulaire
        </h2>

        <p className="text-sm text-gray-500  mb-4">
          Ajoutez un formulaire de satisfaction à votre entreprise
        </p>

        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Titre
        </label>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Titre du formulaire"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded placeholder:italic placeholder:text-sm"
          />
        </div>

        <div className="flex items-center mb-2.5">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mr-2"
          >
            Questions
          </label>

          <Button
            onClick={handleAddQuestion}
            type="button"
            className="flex items-center first-letter:align-center p-2 mr-2 bg-black shadow-black/20 rounded-xl hover:rounded-3xl hover:bg-gray-600  duration-300 text-white  transition-all hover:shadow-lg hover:shadow-black/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none text-sm"
          >
            Ajouter une question
          </Button>
        </div>

        {questions.map((question) => (
          <div key={question.id} className="flex items-center mb-3">
            <input
              className="shadow appearance-none border rounded flex-1 py-2 px-3 text-gray-700 mr-4"
              type="text"
              placeholder={`Question ${question.id}`}
              value={question.text}
              onChange={(e) =>
                handleQuestionChange(question.id, e.target.value)
              }
            />
            <button
              type="button"
              onClick={() => handleRemoveQuestion(question.id)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Supprimer
            </button>
          </div>
        ))}

        {/* <div className="flex justify-end mb-6">
          <button
            type="button"
            onClick={handleAddQuestion}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Ajouter une question
          </button>
        </div> */}

        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Lien de redirection
        </label>

        <div className="mb-6">
          <input
            className="w-full p-2 border border-gray-300 rounded placeholder:italic placeholder:text-sm"
            type="text"
            placeholder="Lien de redirection vers google form"
            value={urlRedirection}
            onChange={(e) => setUrlRedirection(e.target.value)}
          />
          {/* <p className="text-gray-600 text-xs italic">
            Lien de redirection après la soumission du formulaire.
          </p> */}
        </div>

        <div className="">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Note minimum pour déclenché la redirecion
          </label>
          <div className="flex items-center mb-3">
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={rangeValue}
              onChange={(e) => setRangeValue(Number(e.target.value))}
              className="w-4/5"
            />
            <input
              type="number"
              min="1"
              max="5"
              step="0.5"
              value={rangeValue}
              onChange={(e) => setRangeValue(Number(e.target.value))}
              className="w-1/5 p-2 border border-gray-300 rounded "
            />
          </div>
        </div>

        {/* <select
          name="rendezvous"
          value={rendezvousId}
          onChange={(e) => setRendezvousId(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-6"
          style={{ height: "40px" }}
        >
          <option value="" disabled>
            Choisir un rendez-vous
          </option>
          {rendezvous?.map((rendezvous) => (
            <option key={rendezvous.id} value={rendezvous.id}>
              {rendezvous.title} - {rendezvous.dateTime} - {rendezvous.crenau}
            </option>
          ))}
        </select> */}

        <Button
          type="submit"
          className="flex items-center first-letter:align-center p-2.5 mr-2 bg-black  duration-300 text-white shadow-black/20 transition-all hover:shadow-lg hover:shadow-black/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none font-bold"
        >
          Créer le formulaire
        </Button>
      </form>
    </div>
  );
}

export default AddSatisfaction;
