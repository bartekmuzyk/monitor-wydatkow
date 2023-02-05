import {ScrollView} from "react-native";
import {useEffect, useState} from "react";
import {IconButton, List, Text} from "react-native-paper";
import Decimal from "decimal.js";

/**
 * @param data {Data}
 * @returns {JSX.Element}
 * @constructor
 */
function Dlugi({ data }) {
	const [debtData, setDebtData] = useState({});
	const [totalDebt, setTotalDebt] = useState(new Decimal(0));

	useEffect(() => {
		const debtDataToSet = {};

		for (const expenseData of Object.values(data)) {
			for (const ower of expenseData.owers) {
				const stillOwes = new Decimal(expenseData.cost).div(expenseData.owers.length + 1).sub(ower.alreadyPaid).toDecimalPlaces(2);

				if (stillOwes.lessThanOrEqualTo(0)) {
					continue;
				}

				if (!debtDataToSet.hasOwnProperty(ower.name)) {
					debtDataToSet[ower.name] = {owes: new Decimal(0), expenses: []};
				}

				debtDataToSet[ower.name].owes = debtDataToSet[ower.name].owes.add(stillOwes);
				debtDataToSet[ower.name].expenses.push([expenseData.title, stillOwes]);
			}
		}

		setDebtData(debtDataToSet);

		if (Object.keys(debtDataToSet).length > 0) {
			setTotalDebt(Decimal.sum(...Object.values(debtDataToSet).map(v => v.owes)));
		}
	}, [data]);

	return (
		<ScrollView>
			<IconButton icon="hand-coin" size={50} style={{alignSelf: "center"}} />
			<Text variant="displaySmall" style={{margin: 10, textAlign: "center"}}>W sumie wszyscy wiszą Ci {totalDebt.toFixed(2)}zł</Text>
			{
				Object.entries(debtData).map(([owerName, {owes, expenses}]) => {
					return <List.Item
						key={owerName}
						title={`${owerName} - wisi Ci ${owes.toFixed(2)}zł`}
						description={`Nie zapłacił całości dla tych wydatków:\n${expenses.map(([expenseTitle, leftToPay]) => `• ${expenseTitle} (${leftToPay.toFixed(2)}zł)`).join("\n")}`}
						descriptionNumberOfLines={30}
						descriptionEllipsizeMode="clip"
					/>
				})
			}
		</ScrollView>
	);
}

export default Dlugi;