import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetcher } from "./axios";
import Button from "./components/Button";
import useSWR from "swr";

interface Question {
  id: number;
  text: string;
  
}

interface Satisfaction {
  title: string;
  questions: Question[];
  comment: String;
  redirect_url: string;
  redirect_grade: number;
  

}

const SatisfactionEdit = ({ satisfactionId, onClose }) => {
  const [data, setData] = useState<Satisfaction>({
    title: "",
    questions: [],
    comment: "",
    redirect_url: "",
    redirect_grade: 0,
    
  });
  const [formTitle, setFormTitle] = useState("");
  const [urlRedirection, setUrlRedirection] = useState("https://");
  const [rangeValue, setRangeValue] = useState(1);
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([
    // { id: 1, text: "" }, // Vous pouvez avoir une question par défaut ici
  ]);

  const {
    data: satisfaction,
    isLoading: loadingSatisfaction,
    error: errorSatisfaction,
    mutate: refresh,
  } = useSWR(`/satisfaction/get/${id}`, async (url) => {
    if (!id && satisfactionId) return null;
    return (await fetcher.get(url)).data as Satisfaction;
  });

  // useEffect(() => {
  //   fetcher.get(`/satisfaction/${id}`)
  //     .then(res => {

  //     })
  //     .catch(err => {
  //       console.error('Erreur lors du chargement des données:', err);
  //     });
  // }, [id]);

  useEffect(() => {
    if (satisfactionId) {
      fetcher
        .get(`/satisfaction/${satisfactionId}`)
        .then((res) => {
        
          setData(res.data);
          setFormTitle(res.data.title);
          setUrlRedirection(res.data.redirect_url);
          setRangeValue(res.data.redirect_grade);
          setQuestions(res.data.questions); // Ajoutez cette
        })
        .catch((err) => {
          console.error("Error fetching satisfaction data:", err);
        });
    }
  }, [satisfactionId]);

  // useEffect(() => {
  //   // If initialData is provided, use it to set the form fields.
  //   if (initialData) {
  //     setData(initialData);
  //     setFormTitle(initialData.title);
  //     setUrlRedirection(initialData.redirect_url);
  //     setRangeValue(initialData.redirect_grade);
  //     setQuestions(initialData.questions);
  //   }
  // }, [initialData]); // Depend on initialData

  // const handleQuestionChange = (id: number, newText: string) => {
  //   const updatedQuestions = data.questions.map((question) =>
  //     question.id === id ? { ...question, text: newText } : question
  //   );
  //   setData({...data, questions: updatedQuestions});
  // };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: questions.length + 1,
      text: "",
    };
    setQuestions(questions.concat(newQuestion));
  };

  // const handleRemoveQuestion = (id: number) => {
  //   setQuestions(questions.filter((question) => question.id !== id));
  // };

  const handleQuestionChange = (id: number, newText: string) => {
    const updatedQuestions = questions.map((question) =>
      question.id === id ? { ...question, text: newText } : question
    );
    setQuestions(updatedQuestions);
  };

  // const handleAddQuestion = () => {
  //   const newQuestion: Question = {
  //     id: Date.now(), // Utiliser Date.now() pour un identifiant unique temporaire
  //     text: "",
  //   };
  //   setQuestions([...questions, newQuestion]);
  // };

  const handleRemoveQuestion = (id: number) => {
    setQuestions(questions.filter((question) => question.id !== id));
  };

  const handleSubmit = (event) => {
    event.preventDefault();


  // Suppression de la clé `comment` si elle est vide ou non définie
  
  

    const questionsData = questions.map((question) => ({
      text: question.text,
    }));

    const updatedData = {
      ...data,
      title: formTitle,
      redirect_url: urlRedirection,
      redirect_grade: rangeValue,
      questions: questionsData,
    ...(data.comment ? { comment: data.comment } : {}),

    };



    fetcher
      .patch(`/satisfaction/update/${satisfactionId ?? id}`, updatedData)
      .then((res) => {
        window.location.reload();
      })
      .catch((err) => {
        console.error("Erreur lors de la mise à jour:", err);
        onClose();
      });
  };

  // useEffect(() => {
  //   console.log("satisfactionId:", satisfactionId);
  //   if (satisfaction) {
  //     setFormTitle(satisfaction.title);
  //     setUrlRedirection(satisfaction.redirect_url);
  //     setRangeValue(satisfaction.redirect_grade);
  //     setQuestions(satisfaction.questions);
  //   }
  // }, [satisfaction]);

  return (
    <div className="flex justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titre
        </label>

        <div className="mb-6">
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded placeholder:italic placeholder:text-sm mb-6"
            placeholder="Titre du formulaire"
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
            className="flex items-center first-letter:align-center p-2 mr-2 bg-black  rounded-xl hover:rounded-3xl hover:bg-gray-600   duration-300 text-white shadow-black/20 transition-all hover:shadow-lg hover:shadow-black/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none text-sm"
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

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lien de redirection
        </label>
        <input
          type="text"
          value={urlRedirection}
          onChange={(e) => setUrlRedirection(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded placeholder:italic placeholder:text-sm mb-6"
          placeholder="Lien de redirection vers google form"
        />
        <div className="">
          <label className="block text-sm font-medium text-gray-700 ">
            Note minimum pour la redirection
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
        <div className="col-12">
          <Button
            type="submit"
            // className="flex items-center first-letter:align-center p-2.5 mr-2 bg-black  rounded-xl hover:rounded-3xl hover:bg-gray-600  duration-300 text-white shadow-black/20 transition-all hover:shadow-lg hover:shadow-black/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none font-bold"
          >
            Mettre à jour le formulaire
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SatisfactionEdit;
