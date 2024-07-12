import React, {useCallback, useEffect, useRef, useState} from "react";
import {Alert, FlatList, StyleSheet, TextInput, View} from "react-native";
import ScannedItem from "./ScannedItem";
import {findProductByBarcode, generateRandomString, sendGetRequestWithTextResponse} from "../../utils/Helpers";
import {BASE_URL, DEFAULT_MARGIN, INPUT_FONT_SIZE} from "../../variables/Variables";

const FastScannerScreen = ({navigation, route}) => {
    const {productsList, processScannedList} = route.params;

    const textInputRef = useRef(null);
    const [inputText, setInputText] = useState("");
    const [scannedList, setScannedList] = useState([]);

    const handleItemScan = (item) => {
        const newItem = {
            id: generateRandomString(16),
            itemBarCode: item["Штрихкод"],
            itemPartNumber: item["Партия"],
            itemName: item["НаименованиеТовара"],
            cellBarCode: "",
            status: ""
        };
        const listLength = scannedList.length;
        if (!listLength || scannedList[listLength - 1]?.cellBarCode) {
            setScannedList(prev => [...prev, newItem]);
        } else {
            setScannedList(prev => {
                prev[listLength - 1] = newItem; //меняем последний сохранённый штрихкод товара
                return [...prev];
            });
        }
        handleTextInputState()
    };

    const updateScannedItemCellBarcode = (barcode) => {
        setScannedList(prev => {
            const updatedList = [...prev];
            updatedList[updatedList.length - 1] = {
                ...updatedList[updatedList.length - 1],
                cellBarCode: barcode
            };
            return updatedList;
        });
    };

    const updateScannedItemStatus = (partNumber, barcode, status) => {
        setScannedList(prev => prev.map(item =>
            item.itemPartNumber === partNumber && item.cellBarCode === barcode ?
                {...item, status: status}
                : item
        ))
    };

    const handleBarcodeScan = async (barcode) => {
        updateScannedItemCellBarcode(barcode)
        handleTextInputState()
        let serverRes = await sendGetRequestWithTextResponse(`${BASE_URL}ControlCell?barcode=${barcode}`);
        const partNumber = scannedList[scannedList.length - 1].itemPartNumber;
        if (serverRes === "Да") {
            serverRes = await sendGetRequestWithTextResponse(`${BASE_URL}PutProductByCell?NumberParty=${partNumber}&Barcode=${barcode}`);
        }
        updateScannedItemStatus(partNumber, barcode, serverRes === "Да" ? "Успех" : "Неудача");
    };

    const handleTextInputState = () => {
        textInputRef.current.clear();
        setTimeout(() => textInputRef.current.focus(), 0)
    };

    const handleWarning = (msg, callBack) => {
        Alert.alert("Внимание", msg, [{
            text: "Понятно",
            onPress: callBack
        }]);
    }

    const handleInputSubmit = () => {
        if (inputText.length > 10) {
            const product = findProductByBarcode(productsList, inputText);
            if (product) {
                handleItemScan(product);
            } else {
                return handleWarning("Отсканированный товар отсутствует в выбранной накладной.", handleTextInputState);
            }
        } else {
            if (!scannedList.length || scannedList[scannedList.length - 1]?.cellBarCode) {
                return handleWarning("Сначала отсканируйте штрихкод товара.", handleTextInputState);
            } else {
                return handleBarcodeScan(inputText);
            }
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            processScannedList(scannedList);
        });
        return unsubscribe;
    }, [navigation, scannedList]);

    useEffect(() => {
        textInputRef.current.focus();
    }, []);

    const renderScannedItem = useCallback(({item, index}) => {
        return (
            <ScannedItem item={item} index={index}/>
        );
    }, []);

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.inputField}
                ref={textInputRef}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleInputSubmit}
                placeholder="Штрихкод"
                showSoftInputOnFocus={false}
            />
            <FlatList
                contentContainerStyle={{flexGrow: 1}}
                data={scannedList}
                renderItem={renderScannedItem}
                keyExtractor={item => item.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inputField: {
        margin: DEFAULT_MARGIN,
        alignSelf: 'stretch',
        color: "black",
        fontSize: INPUT_FONT_SIZE,
        borderBottomWidth: 1,
        borderBottomColor: "black",
        padding: 0,
    },
});

export default FastScannerScreen;
