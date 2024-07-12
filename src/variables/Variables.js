import {Dimensions, StyleSheet} from "react-native";

const {height, width} = Dimensions.get("screen")

export const BASE_URL = 'http://194.158.208.194:47153/FitPartsTest/hs/MobileApplication/';

export const BUTTON_BLUE = "#2296f3";
export const ITEM_BLUE = "#00457e";
export const DEFAULT_BORDER_RADIUS = width * 0.039; // 15px
export const DEFAULT_MARGIN = width * 0.039; // 15px
export const DEFAULT_PADDING = width * 0.025; // 10px
export const BUTTON_PADDING = width * 0.020; // 8px
export const DEFAULT_FONT_SIZE = width * 0.040; // 16px
export const SPECIFIC_FONT_SIZE = width * 0.046; // 18px
export const TITLE_FONT_SIZE = width * 0.052; // 20px
export const INPUT_FONT_SIZE = width * 0.064; // 25px

export const commonStyles = StyleSheet.create({
    listItemContainer: {
        flex: 1,
        marginHorizontal: DEFAULT_MARGIN,
        padding: DEFAULT_PADDING,
        borderRadius: DEFAULT_BORDER_RADIUS,
        backgroundColor: ITEM_BLUE,
    },
    titleText: {
        color: "black",
        fontWeight: "bold",
        fontSize: TITLE_FONT_SIZE,
    },
    descText: {
        color: 'white',
        fontSize: DEFAULT_FONT_SIZE,
    },
    blackDescText: {
        color: "black",
        fontSize: DEFAULT_FONT_SIZE,
    },
});
