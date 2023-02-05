import {Button, Card, Chip, Dialog, IconButton, List, Portal, Text} from "react-native-paper";
import Decimal from "decimal.js";
import MoneyInput from "./MoneyInput";
import {useState} from "react";
import TextInputInAPortal from "./TextInputInAPortal";

function ExpenseCard({ expenseId, expenseData, updateData, onePersonOwes }) {
	const infoContent = [
		["currency-usd", `Całkowity koszt: ${new Decimal(expenseData.cost).toFixed(2)}zł`],
		["account-multiple", `Na osobę: ${onePersonOwes.toFixed(2)}zł`]
	];

	const [nameInputText, setNameInputText] = useState("");

	/** @type {?string} */
	const initialActionsDialogOwerName = null;
	const [actionsDialogOwerName, setActionsDialogOwerName] = useState(initialActionsDialogOwerName);

	/** @type {?{owerName: string, dialogTitle: string, mode: "addForOwer"|"setForOwer"|"changeTotalCost"}} */
	const initialCostDialogContext = null;
	const [costDialogContext, setCostDialogContext] = useState(initialCostDialogContext);

	const [costDialogInputText, setCostDialogInputText] = useState("");
	const [nameInputDialogOpen, setNameInputDialogOpen] = useState(false);

	return (
		<>
			<Card style={{margin: 10}}>
				<Card.Title
					title={expenseData.title}
					titleVariant="displaySmall"
					right={props => <IconButton
						{...props}
						icon="delete"
						onPress={() => {
							updateData(prevState_ => {
								const prevState = {...prevState_};
								delete prevState[expenseId];

								return prevState;
							});
						}}
					/>}
				/>
				<Card.Content>
					{
						infoContent.map((value, index) =>
							<Chip key={index} icon={value[0]} style={{marginBottom: 10}}>{value[1]}</Chip>
						)
					}
					<Text variant="labelSmall">Składające się osoby:</Text>
					{
						expenseData.owers.map(ower => {
							const alreadyPaidAsDecimal = new Decimal(ower.alreadyPaid);

							let description = `Zapłacił ${alreadyPaidAsDecimal.greaterThan(onePersonOwes) ?
								`${alreadyPaidAsDecimal.toFixed(2)}zł (o ${(alreadyPaidAsDecimal.sub(onePersonOwes)).toFixed(2)}zł za dużo!)`
								:
								`${alreadyPaidAsDecimal.toFixed(2)}zł (do spłacenia długu zostało ${(onePersonOwes.sub(alreadyPaidAsDecimal)).toFixed(2)}zł)`
							}`;
							let icon = alreadyPaidAsDecimal.greaterThan(onePersonOwes) ? "alert" : "close";

							if (alreadyPaidAsDecimal.equals(onePersonOwes)) {
								description = "Zapłacił już całość i ma fajrant ez";
								icon = "check";
							} else if (alreadyPaidAsDecimal.equals(0)) {
								description = "Nic nie zapłacił jeszcze, darmozjad...";
								icon = "close";
							}

							return <List.Item
								key={ower.name}
								title={ower.name}
								description={description}
								left={props => <List.Icon {...props} icon={icon} />}
								onPress={() => setActionsDialogOwerName(ower.name)}
							/>;
						})
					}
					<Text variant="labelSmall">Naciśnij na osobę aby wyświetlić akcje.</Text>
				</Card.Content>
				<Card.Actions>
					<Button
						icon="account-plus"
						onPress={() => setNameInputDialogOpen(true)}
					>Dodaj osobę</Button>
					<Button
						icon="pencil"
						onPress={() => {
							setCostDialogContext({
								expenseId,
								owerName: null,
								dialogTitle: `Nowy koszt dla ${expenseData.title}`,
								mode: "changeTotalCost"
							});
						}}
					>Zmień koszt</Button>
				</Card.Actions>
			</Card>
			<Portal>
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
								updateData(prevState_ => {
									const prevState = {...prevState_};

									prevState[expenseId].owers.push({name: nameInputText.trim(), alreadyPaid: "0"});

									return prevState;
								});
							}}
							disabled={nameInputText.trim().length === 0}
						>Dodaj</Button>
					</Dialog.Actions>
				</Dialog>
				<Dialog visible={actionsDialogOwerName !== null} onDismiss={() => setActionsDialogOwerName(null)}>
					<Dialog.Title>{actionsDialogOwerName}</Dialog.Title>
					<Dialog.Content>
						<List.Item
							left={props => <List.Icon {...props} icon="cash-plus" />}
							title="Dokonaj wpłaty"
							description="Doda pieniądze do stanu spłaty wydatku przez tę osobę."
							descriptionNumberOfLines={3}
							onPress={() => {
								setCostDialogContext({
									owerName: actionsDialogOwerName,
									mode: "addForOwer",
									dialogTitle: `Wpłata w im. ${actionsDialogOwerName}`
								});
								setActionsDialogOwerName(null);
							}}
						/>
						<List.Item
							left={props => <List.Icon {...props} icon="pencil" />}
							title="Edytuj stan wpłaty"
							description="Pozwala ręcznie wpisać ilość wpłaconych pieniędzy przez tę osobę."
							descriptionNumberOfLines={3}
							onPress={() => {
								setCostDialogContext({
									owerName: actionsDialogOwerName,
									mode: "setForOwer",
									dialogTitle: `Zmiana wpłaty dla ${actionsDialogOwerName}`
								});
								setActionsDialogOwerName(null);
							}}
						/>
						<List.Item
							left={props => <List.Icon {...props} icon="exit-run" />}
							title="Usuń ze składki"
							description="Usunie osobę z listy składających się."
							onPress={() => {
								updateData(prevState_ => {
									const prevState = {...prevState_};

									if (prevState[expenseId]?.owers.length === 1) {
										alert(`${actionsDialogOwerName} jest ostatnią osobą w składce. Nie możesz jej usunąć.`);
										return prevState;
									}

									const indexToRemove = prevState[expenseId].owers.findIndex(ower => ower.name === actionsDialogOwerName);
									prevState[expenseId].owers.splice(indexToRemove, 1);

									return prevState;
								});
							}}
						/>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={() => setActionsDialogOwerName(null)}>Zamknij</Button>
					</Dialog.Actions>
				</Dialog>
				<Dialog visible={costDialogContext !== null} onDismiss={() => setCostDialogContext(null)}>
					<Dialog.Title>{costDialogContext?.dialogTitle}</Dialog.Title>
					<Dialog.Content>
						<MoneyInput
							label="Ilość pieniędzy"
							value={costDialogInputText}
							setValue={setCostDialogInputText}
							canStartWithZero
							autoFocus
						/>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={() => setCostDialogContext(null)}>Anuluj</Button>
						<Button
							onPress={() => {
								switch (costDialogContext.mode) {
									case "addForOwer":
										updateData(prevState_ => {
											const prevState = {...prevState_};
											const owerObject = prevState[expenseId]
												.owers
												.find(ower => ower.name === costDialogContext.owerName);

											owerObject.alreadyPaid = new Decimal(owerObject.alreadyPaid).add(costDialogInputText).toString();

											return prevState;
										});
										break;
									case "setForOwer":
										updateData(prevState_ => {
											const prevState = {...prevState_};
											const owerObject = prevState[expenseId]
												.owers
												.find(ower => ower.name === costDialogContext.owerName);

											owerObject.alreadyPaid = costDialogInputText;

											return prevState;
										});
										break;
									case "changeTotalCost":
										updateData(prevState_ => {
											const prevState = {...prevState_};

											prevState[expenseId].cost = costDialogInputText;

											return prevState;
										});
										break;
									default:
										console.warn(`Invalid mode: ${costDialogContext?.mode}`);
										break;
								}

								setCostDialogContext(null);
								setCostDialogInputText("");
							}}
							disabled={costDialogInputText.length === 0}
						>Dawaj</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
		</>
	);
}

export default ExpenseCard;
