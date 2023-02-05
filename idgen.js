import {str_md5} from "react-native-md5";

export default function generateId() {
	return str_md5((Date.now() + Math.random() * 10).toString());
}
