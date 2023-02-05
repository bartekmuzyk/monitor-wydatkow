import React, {useEffect, useState} from "react";
import {TextInput} from "react-native-paper";

// https://github.com/callstack/react-native-paper/issues/1668#issuecomment-586005762
const TextInputInAPortal = props => {
	const [value, setValue] = useState(props.value);

	useEffect(() => {
		if(value !== props.value)
			setValue(props.value)
	}, [props.value]);

	const onChangeText = (text) => {
		setValue(text)
		props.onChangeText(text)
	};

	return React.createElement(TextInput, {...props, value, onChangeText})
};

export default TextInputInAPortal;
