import {ScrollView, StyleSheet, View} from "react-native";
import {Button, Text, FAB, Dialog, Portal, Chip} from "react-native-paper";
import {useState} from "react";
import generateId from "../idgen";
import MoneyInput from "../MoneyInput";
import Decimal from "decimal.js";
import ExpenseCard from "../ExpenseCard";
import TextInputInAPortal from "../TextInputInAPortal";

/**
 * @param data {Data}
 * @param updateData {function}
 * @param tripModeData {TripModeData}
 * @returns {JSX.Element}
 * @constructor
 */
function Wydatki({ data, updateData, tripModeData }) {
	const [fullFabVisible, setFullFabVisible] = useState(true);
	const [newExpenseDialogOpen, setNewExpenseDialogOpen] = useState(false);
	const [expenseTitleInputText, setExpenseTitleInputText] = useState("");
	const [newExpenseOwersList, setNewExpenseOwersList] = useState(new Set());
	const [newExpenseCost, setNewExpenseCost] = useState("");
	const [nameInputDialogOpen, setNameInputDialogOpen] = useState(false);
	const [nameInputText, setNameInputText] = useState("");

	return (
		<>
			<ScrollView onMomentumScrollEnd={ev => setFullFabVisible(ev.nativeEvent.contentOffset.y === 0)}>
				<>
					{
						Object.entries(data).map(([expenseId, wydatek]) => <ExpenseCard
							key={expenseId}
							expenseId={expenseId}
							expenseData={wydatek}
							updateData={updateData}
							onePersonOwes={new Decimal(wydatek.cost).div(wydatek.owers.length + 1).toDecimalPlaces(2)}
						/>)
					}
					<View style={{height: 80}} />
				</>
			</ScrollView>
			<FAB
				icon="plus"
				label={fullFabVisible ? "Nowy wydatek" : ""}
				style={styles.fab}
				onPress={() => setNewExpenseDialogOpen(true)}
			/>
			<Portal>
				<Dialog visible={newExpenseDialogOpen} onDismiss={() => setNewExpenseDialogOpen(false)}>
					<Dialog.Title>Nowy wydatek</Dialog.Title>
					<Dialog.Content>
						<TextInputInAPortal
							mode="outlined"
							label="Tytuł"
							value={expenseTitleInputText}
							onChangeText={text => setExpenseTitleInputText(text)}
							style={{marginBottom: 20}}
							autoCorrect={false}
						/>
						<MoneyInput
							value={newExpenseCost}
							setValue={setNewExpenseCost}
							label="Koszt"
							style={{marginBottom: 20}}
						/>
						<Text variant="bodyMedium" style={{marginBottom: 5}}>Składające się osoby (oprócz Ciebie):</Text>
						{
							newExpenseOwersList.size === 0 &&
								<Text variant="bodyMedium" style={{color: "gray", marginBottom: 5}}>Nikogo tu jeszcze nie ma. Kliknij przycisk poniżej, aby zacząć dodawać osoby do składki.</Text>
						}
						<View style={{flexDirection: "row", flexWrap: "wrap"}}>
							<>
							{
								[...newExpenseOwersList].map(owerName =>
									<Chip
										key={owerName}
										style={{marginRight: 5, marginBottom: 5}}
										icon="account"
										onPress={() => setNewExpenseOwersList(prevState_ => {
											const prevState = new Set(prevState_);
											prevState.delete(owerName);
											return prevState;
										})}
									>{owerName}</Chip>
								)
							}
							</>
						</View>
						<Text variant="bodyMedium">Kliknij imię, aby usunąć je z listy.</Text>
						<Button
							mode="contained"
							style={{alignSelf: "flex-start", marginTop: 5}}
							icon="account-plus"
							onPress={() => setNameInputDialogOpen(true)}
						>
							Dodaj osobę
						</Button>
						{
							tripModeData.active && tripModeData.people.length > 0 &&
								<Button
									mode="outlined"
									style={{alignSelf: "flex-start", marginTop: 5}}
									icon="car"
									onPress={() => {
										setNewExpenseOwersList(prevState_ => {
											const prevState = new Set(prevState_);

											for (const personName of tripModeData.people) {
												prevState.add(personName);
											}

											return prevState;
										});
									}}
								>Dodaj wszystkich z wycieczki</Button>
						}
					</Dialog.Content>
					<Dialog.Actions>
						<Button
							onPress={() => {
								setExpenseTitleInputText("")
								setNewExpenseCost("");
								setNewExpenseOwersList(new Set());
								setNewExpenseDialogOpen(false);
							}}
						>Anuluj</Button>
						<Button
							onPress={() => {
								setNewExpenseDialogOpen(false);
								updateData(prevState_ => {
									const prevState = {...prevState_};
									prevState[generateId()] = {
										title: expenseTitleInputText.trim(),
										cost: newExpenseCost,
										owers: [...newExpenseOwersList].map(owerName => ({name: owerName, alreadyPaid: "0"}))
									};

									return prevState;
								});
								setExpenseTitleInputText("")
								setNewExpenseCost("");
								setNewExpenseOwersList(new Set());
							}}
							disabled={expenseTitleInputText.trim().length === 0 || newExpenseOwersList.size === 0 || newExpenseCost.length === 0}
						>
							Zrobione!
						</Button>
					</Dialog.Actions>
				</Dialog>
				<Dialog visible={nameInputDialogOpen} onDismiss={() => setNameInputDialogOpen(false)}>
					<Dialog.Title>Dodawanie osoby</Dialog.Title>
					<Dialog.Content>
						<TextInputInAPortal
							mode="outlined"
							label="Imię"
							value={nameInputText}
							onChangeText={text => setNameInputText(text)}
							autoFocus
						/>
					</Dialog.Content>
					<Dialog.Actions>
						<Button
							onPress={() => {
								setNameInputDialogOpen(false);
								setNewExpenseOwersList(prevState => {
									prevState.add(nameInputText.trim());
									return prevState;
								});
								setNameInputText("");
							}}
							disabled={nameInputText.trim().length === 0}
						>Dodaj</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
		</>
	);
}

const styles = StyleSheet.create({
	fab: {
		position: "absolute",
		margin: 16,
		right: 0,
		bottom: 0
	}
});

export default Wydatki;
