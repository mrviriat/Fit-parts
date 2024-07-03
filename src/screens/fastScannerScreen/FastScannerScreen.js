import * as React from "react";
import {useCallback, useEffect, useRef, useState} from "react";
import {Alert, FlatList, StyleSheet, TextInput, View} from "react-native";
import ScannedItem from "./ScannedItem";
import {generateRandomString} from "../../utils/Helpers";
import {BASE_URL} from "../../variables/Variables";
import {basicAuth} from "../../utils/Headers";

const FastScannerScreen = ({navigation, route}) => {

    const sendTypicalGetRequest = useCallback(async (addedString) => {
        try {
            const response = await fetch(BASE_URL + addedString, {
                method: "GET",
                headers: {
                    Authorization: basicAuth,
                },
            });
            if (response.ok) {
                return response.text();
            }
        } catch (e) {
            console.log(e);
        }
    }, []);

    const {productsList, processScannedList} = route.params;

    const textInputRef = useRef(null);

    const [inputText, onChangeInputText] = useState("");
    const [scannedList, setScannedList] = useState([])

    const renderScannedItem = useCallback(({item, index}) => {
        return (
            <ScannedItem item={item} index={index}/>
        );
    }, []);

    const findObjectByBarcodeSubstring = (targetSubstring) => {
        for (const item of productsList) {
            if (targetSubstring.includes(item["Штрихкод"]) && targetSubstring.includes(item["Партия"])) {
                return item;
            }
        }
        return false;
    };

    const onSubmitEditingInputText = () => {

        const length = scannedList.length

        if (inputText.length > 10) {

            const item = findObjectByBarcodeSubstring(inputText)

            if (!item) { // обработать сканирование несуществующего товара
                Alert.alert(
                    "Внимание",
                    "Отсканированный товар отсутствует в выбранной накладной.",
                    [{
                        text: "Понятно",
                        onPress: () => {
                            textInputRef.current.clear();
                            setTimeout(() => {
                                textInputRef.current.focus();
                            }, 0);
                        },
                    }]
                )
                return;
            }

            const barCode = item["Штрихкод"]
            const partNumber = item["Партия"]
            const name = item["НаименованиеТовара"]

            if (length && scannedList[length - 1].cellBarCode) {
                setScannedList(prev => [
                    ...prev,
                    {
                        id: generateRandomString(16),
                        itemBarCode: barCode,
                        itemPartNumber: partNumber,
                        itemName: name,
                        cellBarCode: "",
                        status: ""
                    }
                ])
            } else if (length) {
                setScannedList(prev => {
                    const newArray = [...prev];
                    newArray[length - 1] = {
                        ...newArray[length - 1],
                        ['itemBarCode']: barCode,
                        ['itemPartNumber']: partNumber,
                        ['itemName']: name,
                    };
                    return newArray;
                });
            } else {
                setScannedList([{
                    id: generateRandomString(16),
                    itemBarCode: barCode,
                    itemPartNumber: partNumber,
                    itemName: name,
                    cellBarCode: "",
                    status: ""
                }])
            }
        } else {
            if (length && scannedList[length - 1].cellBarCode || !length) {
                Alert.alert(
                    "Внимание",
                    "Сначала отсканируйте штрихкод товара.",
                    [{
                        text: "Понятно",
                        onPress: () => {
                            textInputRef.current.clear();
                            setTimeout(() => {
                                textInputRef.current.focus();
                            }, 0);
                        },
                    }])
                return;
            } else {
                const cellBarCode = inputText
                const partNumber = scannedList[length - 1]['itemPartNumber']

                setScannedList(prev => {
                    const newArray = [...prev];
                    newArray[length - 1] = {
                        ...newArray[length - 1],
                        ['cellBarCode']: cellBarCode,
                    };
                    return newArray;
                });

                //дальше отправляем всё на сервер
                sendTypicalGetRequest(`ControlCell?barcode=${cellBarCode}`).then(controlCellRes => {
                        if (controlCellRes === "Да") {
                            sendTypicalGetRequest(`PutProductByCell?NumberParty=${partNumber}&Barcode=${cellBarCode}`)
                                .then(putProductByCellRes => {
                                        setScannedList(prev => {
                                            const newArray = [...prev];
                                            newArray[length - 1] = {
                                                ...newArray[length - 1],
                                                ['status']: putProductByCellRes === "Да" ? "Успех" : "Неудача",
                                            };
                                            return newArray;
                                        });
                                    },
                                );
                        } else {
                            setScannedList(prev => {
                                const newArray = [...prev];
                                newArray[length - 1] = {
                                    ...newArray[length - 1],
                                    ['status']: "Неудача",
                                };
                                return newArray;
                            });
                        }
                    },
                );
            }
        }

        textInputRef.current.clear();
        setTimeout(() => {
            textInputRef.current.focus();
        }, 0);
    }

    useEffect(
        () =>
            navigation.addListener('beforeRemove', (e) => {
                processScannedList(scannedList)
            }),
        [navigation, scannedList]
    );

    useEffect(
        () => {
            textInputRef.current.focus();
        }, []
    );

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.inputField}
                ref={textInputRef}
                onChangeText={onChangeInputText}
                onSubmitEditing={onSubmitEditingInputText}
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
        margin: 15,
        alignSelf: 'stretch',
        color: "black",
        fontSize: 25,
        borderBottomWidth: 1,
        borderBottomColor: "black",
        padding: 0,
    },
});

export default FastScannerScreen;
