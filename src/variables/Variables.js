import { StyleSheet } from "react-native";

export const BASE_URL = 'http://194.158.208.194:47153/FitPartsTest/hs/MobileApplication/';

export const commonStyles = StyleSheet.create({
  listItemContainer: {
    flex: 1,
    marginHorizontal: 15,
    padding: 10,
    borderRadius: 15,
    backgroundColor: '#00457e',
  },
  titleText: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
  },
  descText: {
    color: 'white',
    fontSize: 16,
  },
  blackDescText: {
    color: "black",
    fontSize: 16,
  },
});
