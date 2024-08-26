import { FaFileCirclePlus, FaDeleteLeft } from "react-icons/fa6";

const QuestionInput = ({ value, onChange, onRemove }) => (
  <div className="flex items-center gap-1 mb-2">
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder="Entrez votre question ici..."
      className="flex-1 p-2 border border-gray-300 rounded placeholder:italic placeholder:text-sm text-sm"
    />
    <button
      onClick={onRemove}
      className="p-2 text-red-500 transform duration-500 ease-in-out hover:scale-100 hover:text-gray-300"
    >
      <FaDeleteLeft className="w-6 h-6" />
    </button>
  </div>
);

export default QuestionInput;