import {TextInput} from "react-native-paper";
import {useState} from "react";

function MoneyInput({ value, label, setValue, canStartWithZero = false, ...props }) {
	const [error, setError] = useState(false);

	return <TextInput
		mode="outlined"
		label={label}
		value={value}
		onChangeText={text => {
			if (text.length === 0) {
				setValue("");
				return;
			}

			let textToSet = text.trim().replace(/-/g, "").replace(/,/g, ".").replace(/\s/g, "");

			while (textToSet.indexOf(".") !== textToSet.lastIndexOf(".")) {
				textToSet = textToSet.substring(0, textToSet.lastIndexOf("."));
			}

			if (textToSet.startsWith(".") || (!canStartWithZero && textToSet.startsWith("0"))) {
				textToSet = "";
			}

			if (textToSet.includes(".") && textToSet.length - textToSet.indexOf(".") > 3) {
				textToSet = textToSet.substring(0, textToSet.indexOf(".") + 3)
			}

			try {
				const result = parseFloat(textToSet);

				if (isNaN(result) && textToSet.length > 0) { // noinspection ExceptionCaughtLocallyJS
					throw new Error();
				}

				setError(false);
			} catch {
				setError(true);
			}

			setValue(textToSet);
		}}
		right={<TextInput.Affix text="zł" />}
		inputMode="numeric"
		keyboardType="number-pad"
		error={error}
		{...props}
	/>;
}

export default MoneyInput;
