// import React, { useEffect, useState } from 'react';
// import Select, { ValueType } from 'react-select';

// interface Suggestion {
//   value: string;
//   label: string;
//   info?: string;
// }

// interface AutocompleteProps {
//   suggestionsData: string[];
//   idData: string[];
//   suggestionsInfo: string[];
//   onDataFromChild: (id: string , index : any) => void;
//   defaultValue: string;
//   numnberOfPeople?: number;
//   clearInputValue?: boolean;
// }

// const Autocomplete: React.FC<AutocompleteProps> = ({
//   suggestionsData,
//   idData,
//   suggestionsInfo,
//   onDataFromChild,
//   defaultValue,
//   numnberOfPeople = 1, // Default to 1 if numnberOfPeople is not provided
//   clearInputValue = false,
// }) => {
//   const [selectedOptions, setSelectedOptions] = useState<Array<ValueType<Suggestion>>>([]);
//   const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
//   const [baseValues, setBaseValues] = useState<string[]>(Array(numnberOfPeople).fill('Selectionner'));

//   useEffect(() => {
//     // Map suggestionsData to suggestions array
//     const newSuggestions = suggestionsData.map((suggestion, index) => ({
//       value: idData[index],
//       label: suggestion,
//       info: suggestionsInfo[index],
//     }));
//     setSuggestions(newSuggestions);
//   }, [suggestionsData, idData, suggestionsInfo]);

//   useEffect(() => {
//     // Initialize selected options based on defaultValue
//     const defaultOptions: ValueType<Suggestion>[] = Array(numnberOfPeople).fill(null);
//     setSelectedOptions(defaultOptions);
//   }, [numnberOfPeople]);

//   const handleOptionChange = (selectedOption: ValueType<Suggestion>, index: number) => {
//     const newSelectedOptions = [...selectedOptions];
//     newSelectedOptions[index] = selectedOption;
//     setSelectedOptions(newSelectedOptions);

//     if (selectedOption) {
//       const option = selectedOption as Suggestion;
//       const newBaseValues = [...baseValues];
//       newBaseValues[index] = option.label;
//       setBaseValues(newBaseValues);
//       onDataFromChild(option.value,index);
//     } else {
//       const newBaseValues = [...baseValues];
//       newBaseValues[index] = 'Selectionner';
//       setBaseValues(newBaseValues);
//       onDataFromChild('',index);
//     }
//   };

//   const formatOptionLabel = ({ label, info }: Suggestion) => (
//     <div>
//       <div>{label}</div>
//       {info && <div style={{ fontSize: 12, color: 'gray' }}>{info}</div>}
//     </div>
//   );

//   return (
//     <div className="relative">
//       {Array.from({ length: numnberOfPeople }).map((_, index) => (
//         <div key={index} className="mb-4">
//           <Select
//             value={selectedOptions[index]}
//             onChange={(selectedOption) => handleOptionChange(selectedOption, index)}
//             options={suggestions}
//             isClearable={true}
//             isSearchable={true}
//             placeholder={baseValues[index]}
//             formatOptionLabel={formatOptionLabel}
//           />
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Autocomplete;

import React, { useEffect, useState, useCallback } from "react";
import Select, { ValueType } from "react-select";

interface Suggestion {
	value: string;
	label: string;
	info?: string;
}

interface AutocompleteProps {
	suggestionsData: string[];
	idData: string[];
	suggestionsInfo: string[];
	onDataFromChild: (id: string, index: number) => void;
	defaultValue: string;
	numnberOfPeople?: number;
	clearInputValue?: boolean;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
	suggestionsData,
	idData,
	suggestionsInfo,
	onDataFromChild,
	defaultValue,
	numnberOfPeople = 1,
	clearInputValue = false,
}) => {
	const [selectedOptions, setSelectedOptions] = useState<
		Array<ValueType<Suggestion>>
	>([]);
	const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
	const [baseValues, setBaseValues] = useState<string[]>(
		Array(numnberOfPeople).fill("Selectionner")
	);

	useEffect(() => {
		// Map suggestionsData to suggestions array
		const newSuggestions = suggestionsData.map((suggestion, index) => ({
			value: idData[index],
			label: suggestion,
			info: suggestionsInfo[index],
		}));
		setSuggestions(newSuggestions);
	}, [suggestionsData, idData, suggestionsInfo]);

	useEffect(() => {
		// Initialize selected options based on numnberOfPeople
		const defaultOptions: ValueType<Suggestion>[] =
			Array(numnberOfPeople).fill(null);
		setSelectedOptions(defaultOptions);
	}, [numnberOfPeople]);

	// Function to clear all selections
	const clearSelections = useCallback(() => {
		const clearedOptions: ValueType<Suggestion>[] =
			Array(numnberOfPeople).fill(null);
		setSelectedOptions(clearedOptions);
		const clearedBaseValues = Array(numnberOfPeople).fill("Selectionner");
		setBaseValues(clearedBaseValues);
		// Notify parent component that the values are cleared
		clearedOptions.forEach((_, index) => onDataFromChild("", index));
	}, [numnberOfPeople, onDataFromChild]);

	useEffect(() => {
		if (clearInputValue) {
			clearSelections();
		}
	}, [clearInputValue, idData]);

	const handleOptionChange = (
		selectedOption: ValueType<Suggestion>,
		index: number
	) => {
		const newSelectedOptions = [...selectedOptions];
		newSelectedOptions[index] = selectedOption;
		setSelectedOptions(newSelectedOptions);

		if (selectedOption) {
			const option = selectedOption as Suggestion;
			const newBaseValues = [...baseValues];
			newBaseValues[index] = option.label;
			setBaseValues(newBaseValues);
			onDataFromChild(option.value, index);
		} else {
			const newBaseValues = [...baseValues];
			newBaseValues[index] = "Selectionner";
			setBaseValues(newBaseValues);
			onDataFromChild("", index);
		}
	};

	const formatOptionLabel = ({ label, info }: Suggestion) => (
		<div>
			<div>{label}</div>
			{info && <div style={{ fontSize: 12, color: "gray" }}>{info}</div>}
		</div>
	);

	return (
		<div className="relative">
			{Array.from({ length: numnberOfPeople }).map((_, index) => (
				<div key={index}>
					<Select
						value={selectedOptions[index]}
						onChange={(selectedOption) =>
							handleOptionChange(selectedOption, index)
						}
						options={suggestions}
						isClearable={true}
						isSearchable={true}
						placeholder={baseValues[index]}
						formatOptionLabel={formatOptionLabel}
					/>
				</div>
			))}
		</div>
	);
};

export default Autocomplete;
