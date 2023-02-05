import {Button, Chip, Dialog, FAB, IconButton, Portal, Text} from "react-native-paper";
import {StyleSheet, View} from "react-native";
import {useState} from "react";
import TextInputInAPortal from "../TextInputInAPortal";

/**
 * @typedef {{active: boolean, people: string[]}} TripModeData
 */

/**
 * @param tripModeData {TripModeData}
 * @param updateTripModeData
 * @returns {JSX.Element}
 * @constructor
 */
function TrybWycieczki({ tripModeData, updateTripModeData }) {
	const [nameInputDialogOpen, setNameInputDialogOpen] = useState(false);
	const [nameInputText, setNameInputText] = useState("");
	const [confirmTripModeDeactivationDialogOpen, setConfirmTripModeDeactivationDialogOpen] = useState(false);

	return (
		<>
			<View style={{alignItems: "center"}}>
				<IconButton icon="car" size={50} />
				<Text variant="displaySmall" style={{margin: 10, textAlign: "center"}}>Tryb wycieczki jest {tripModeData.active ? "włączony" : "wyłączony"}</Text>
				<Text variant="labelMedium" style={{marginLeft: 40, marginRight: 40, textAlign: "center", color: "#ccc"}}>
					Tryb wycieczki pozwala jednorazowo dodać listę osób, która może być wykorzystywana do szybszego tworzenia składek.
				</Text>
				{
					tripModeData.active ?
						<Button
							mode="contained"
							icon="stop"
							style={{marginTop: 10}}
							onPress={() => setConfirmTripModeDeactivationDialogOpen(true)}
						>Wyłącz tryb wycieczki</Button>
						:
						<Button
							mode="contained"
							icon="play"
							style={{marginTop: 10}}
							onPress={() => {
								updateTripModeData(prevState_ => {
									const prevState = {...prevState_};

									prevState.active = true;

									return prevState;
								});
							}}
						>Włącz tryb wycieczki</Button>
				}
				{
					tripModeData.people.length === 0 &&
						<Text variant="bodyMedium" style={{color: "gray", margin: 10, textAlign: "center"}}>
							{
								tripModeData.active ?
									"Nikogo tu jeszcze nie ma. Kliknij przycisk w dolnym-prawym, aby zacząć dodawać osoby do wycieczki."
									:
									"Włącz tryb wycieczki powyżej, aby zacząć dodawać osoby."
							}
						</Text>
				}
				<View style={{width: "100%", padding: 15}}>
					<View style={{flexDirection: "row", flexWrap: "wrap"}}>
						<>
							{
								tripModeData.people.map(personName =>
									<Chip
										key={personName}
										style={{marginRight: 5, marginBottom: 5}}
										icon="account"
										onPress={() => updateTripModeData(prevState_ => {
											const prevState = {...prevState_};

											prevState.people.splice(prevState.people.indexOf(personName), 1);

											return prevState;
										})}
									>{personName}</Chip>
								)
							}
						</>
					</View>
					{
						tripModeData.people.length > 0 &&
							<Text variant="bodyMedium">Naciśnij na osobę, aby usunąć ją z wycieczki.</Text>
					}
				</View>
			</View>
			{
				tripModeData.active &&
					<FAB
						icon="account-plus"
						label="Dodaj osobę"
						style={styles.fab}
						onPress={() => setNameInputDialogOpen(true)}
					/>
			}
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
								updateTripModeData(prevState_ => {
									const prevState = {...prevState_};

									if (!prevState.people.includes(nameInputText.trim())) {
										prevState.people.push(nameInputText.trim());
									}

									return prevState;
								});
								setNameInputText("");
							}}
							disabled={nameInputText.trim().length === 0}
						>Dodaj</Button>
					</Dialog.Actions>
				</Dialog>
				<Dialog visible={confirmTripModeDeactivationDialogOpen} onDismiss={() => setConfirmTripModeDeactivationDialogOpen(false)}>
					<Dialog.Title>Wyłączyć tryb wycieczki?</Dialog.Title>
					<Dialog.Content><Text>Wyłączenie trybu wycieczki usunie aktualną listę osób.</Text></Dialog.Content>
					<Dialog.Actions>
						<Button onPress={() => setConfirmTripModeDeactivationDialogOpen(false)}>Pozostaw włączony</Button>
						<Button onPress={() => {
							updateTripModeData(prevState_ => {
								const prevState = {...prevState_};

								prevState.active = false;
								prevState.people = [];

								return prevState;
							});
							setConfirmTripModeDeactivationDialogOpen(false);
						}}>Wyłanczoj i to już</Button>
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

export default TrybWycieczki;
