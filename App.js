import {StatusBar} from "expo-status-bar";
import {
	MD3DarkTheme as DefaultTheme,
	Provider as PaperProvider,
	Appbar,
	BottomNavigation
} from 'react-native-paper';
import {useEffect, useState} from "react";
import Wydatki from "./pages/wydatki";
import Dlugi from "./pages/dlugi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TrybWycieczki from "./pages/trybwycieczki";
import {Platform} from "react-native";

/**
 * @typedef {Object<string, {title: string, cost: string, owers: {name: string, alreadyPaid: string}[]}>} Data
 */

function Main() {
	const [currentTabIndex, setCurrentTabIndex] = useState(0);
	const [tabNames] = useState(["wydatki", "dlugi", "wycieczka"]);
	const [bottomNavButtons] = useState([
		{key: "wydatki", title: "Wydatki", focusedIcon: "cash"},
		{key: "dlugi", title: "Długi", focusedIcon: "hand-coin"},
		{key: "wycieczka", title: "Tryb wycieczki", focusedIcon: "car"}
	]);

	const [data, setData] = useState(null);
	const [tripModeData, setTripModeData] = useState(null);

	async function saveData() {
		await AsyncStorage.setItem("data", JSON.stringify(data));
	}

	async function saveTripModeData() {
		await AsyncStorage.setItem("tripModeData", JSON.stringify(tripModeData));
	}

	async function loadData() {
		const data = await AsyncStorage.getItem("data");

		if (data === String(null)) {
			setData({});
			await saveData();
		} else {
			setData(JSON.parse(data));
		}

		const tripModeData = await AsyncStorage.getItem("tripModeData");

		if (tripModeData === String(null)) {
			setTripModeData({active: false, people: []});
			await saveTripModeData();
		} else {
			setTripModeData(JSON.parse(tripModeData));
		}
	}

	useEffect(() => {
		if (Platform.OS === "web") {
			document.getElementById("root").setAttribute("style", "flex:revert;max-width:700px;position:relative;left:50%;transform:translateX(-50%);");
			document.body.setAttribute("style", "background-color:#1a1c18;");

			const bottomBar = document.createElement("div");
			bottomBar.setAttribute("style", "width:100vw;height:80px;background-color:#212c1e;position:absolute;bottom:0;z-index:-1;");

			document.body.appendChild(bottomBar);
		}

		loadData();
	}, []);

	useEffect(() => void saveData(), [data]);
	useEffect(() => void saveTripModeData(), [tripModeData]);

	const bottomNavSceneMap = BottomNavigation.SceneMap({
		"wydatki": () => <Wydatki data={data} updateData={setData} tripModeData={tripModeData} />,
		"dlugi": () => <Dlugi data={data} />,
		"wycieczka": () => <TrybWycieczki tripModeData={tripModeData} updateTripModeData={setTripModeData} />
	});

	if (data === null || tripModeData === null) {
		return <></>;
	}

	return <>
		<StatusBar style="light" />
		<Appbar.Header>
			<Appbar.Content title={bottomNavButtons.filter(r => r.key === tabNames[currentTabIndex])[0].title} />
		</Appbar.Header>
		<BottomNavigation navigationState={{index: currentTabIndex, routes: bottomNavButtons}} onIndexChange={setCurrentTabIndex} renderScene={bottomNavSceneMap} />
	</>;
}

const theme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		"primary": "rgb(114, 222, 94)",
		"onPrimary": "rgb(0, 58, 0)",
		"primaryContainer": "rgb(0, 83, 0)",
		"onPrimaryContainer": "rgb(141, 251, 119)",
		"secondary": "rgb(187, 203, 178)",
		"onSecondary": "rgb(38, 52, 34)",
		"secondaryContainer": "rgb(60, 75, 55)",
		"onSecondaryContainer": "rgb(215, 232, 205)",
		"tertiary": "rgb(160, 207, 210)",
		"onTertiary": "rgb(0, 55, 57)",
		"tertiaryContainer": "rgb(30, 77, 80)",
		"onTertiaryContainer": "rgb(188, 235, 238)",
		"error": "rgb(255, 180, 171)",
		"onError": "rgb(105, 0, 5)",
		"errorContainer": "rgb(147, 0, 10)",
		"onErrorContainer": "rgb(255, 180, 171)",
		"background": "rgb(26, 28, 24)",
		"onBackground": "rgb(226, 227, 220)",
		"surface": "rgb(26, 28, 24)",
		"onSurface": "rgb(226, 227, 220)",
		"surfaceVariant": "rgb(67, 72, 63)",
		"onSurfaceVariant": "rgb(195, 200, 188)",
		"outline": "rgb(141, 147, 135)",
		"outlineVariant": "rgb(67, 72, 63)",
		"shadow": "rgb(0, 0, 0)",
		"scrim": "rgb(0, 0, 0)",
		"inverseSurface": "rgb(226, 227, 220)",
		"inverseOnSurface": "rgb(47, 49, 45)",
		"inversePrimary": "rgb(0, 110, 0)",
		"elevation": {
			"level0": "transparent",
			"level1": "rgb(30, 38, 28)",
			"level2": "rgb(33, 44, 30)",
			"level3": "rgb(36, 49, 32)",
			"level4": "rgb(37, 51, 32)",
			"level5": "rgb(38, 55, 34)"
		},
		"surfaceDisabled": "rgba(226, 227, 220, 0.12)",
		"onSurfaceDisabled": "rgba(226, 227, 220, 0.38)",
		"backdrop": "rgba(44, 50, 41, 0.4)"
	}
};

export default function App() {
	return <PaperProvider theme={theme}><Main/></PaperProvider>;
}
