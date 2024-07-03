import {useSharedValue} from "react-native-reanimated";
import * as React from "react";
import {useCallback, useEffect, useRef, useState} from "react";
import {Alert, StyleSheet, Text, TextInput, TouchableOpacity, View,} from "react-native";
import {Camera, useCameraDevice, useCameraPermission, useCodeScanner,} from "react-native-vision-camera";
import Icon from "react-native-vector-icons/FontAwesome5";
import AdditionalIcons from "react-native-vector-icons/AntDesign";
import {BASE_URL, commonStyles} from "../../variables/Variables";
import {basicAuth} from "../../utils/Headers";
import {MotiView, useAnimationState} from "moti";

const DEFAULT_BORDER_RADIUS = 15;

const ProductScannerScreen = ({navigation, route}) => {

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

    const {productsList} = route.params;

    const textInputRef = useRef(null);

    const [product, setProduct] = useState("");

    const [showTextInput, setShowTextInput] = useState(false);
    const [inputText, onChangeInputText] = useState("");

    const changeShowTextInput = () => {
        setShowTextInput(isShowed => {
            barcodeScanned.value = !isShowed;
            return !isShowed;
        })
    }

    const onSubmitEditingInputText = () => {
        if (product) {
            //console.log(inputText);
            processShelvingBarCode(inputText);
            textInputRef.current.clear();
        } else {
            //console.log(`]C1${inputText}`);
            if (!findObjectByBarcodeSubstring(`]C1${inputText}`)) {
                Alert.alert("Внимание", "Отсканированный товар отсутствует в выбранной накладной.")
                return;
            }

            processProductBarCode(`]C1${inputText}`);
            textInputRef.current.clear();
        }
    }

    const findObjectByBarcodeSubstring = (targetSubstring) => {
        for (const item of productsList) {
            if (targetSubstring.includes(item["Штрихкод"]) && targetSubstring.includes(item["Партия"])) {
                return item;
            }
        }
        return false;
    };

    const validateShelvingString = (input) => {

        const regex = /^[a-zA-Z]-\d{1,2}-\d{1,2}$/;

        return regex.test(input);
    };

    const processProductBarCode = (code) => {
        const targetProduct = findObjectByBarcodeSubstring(code);
        Alert.alert(
            "Товар найден!",
            targetProduct["НаименованиеТовара"],
            [
                {
                    text: "Отмена",
                    onPress: () => {
                        if (!showTextInput) {
                            barcodeScanned.value = false;
                        }
                    },
                },
                {
                    text: "Продолжить",
                    onPress: () => {
                        if (!showTextInput) {
                            barcodeScanned.value = false;
                        }
                        if (targetProduct) {
                            setProduct({...targetProduct, "ОтсканированныйШтрихкод": code});
                        }
                    },
                },
            ]);
    };

    const processShelvingBarCode = (code) => {
        Alert.alert(
            "Это правильная ячейка?",
            `Код отсканированной ячейки: ${code}`,
            [
                {
                    text: "Нет, повторить",
                    onPress: () => barcodeScanned.value = false,
                },
                {
                    text: "Да, продолжить",
                    onPress: () => {
                        const numberParty = product["ОтсканированныйШтрихкод"].substring(20, 29);
                        // console.log(`${BASE_URL}ControlCell?barcode=${code}`);
                        sendTypicalGetRequest(`ControlCell?barcode=${code}`).then(controlCellRes => {
                                // console.log(controlCellRes);
                                if (controlCellRes === "Да") {
                                    // console.log(`${BASE_URL}PutProductByCell?NumberParty=${numberParty}&Barcode=${code}`);
                                    sendTypicalGetRequest(`PutProductByCell?NumberParty=${numberParty}&Barcode=${code}`)
                                        .then(putProductByCellRes => {
                                                //console.log(`Ответ после попытки положить товар в ячейку: ${putProductByCellRes}`);
                                                if (putProductByCellRes === "Да") {
                                                    navigation.navigate({
                                                        name: "ProductsScreen",
                                                        params: {producteCode: product["Штрихкод"], shelvingCode: code},
                                                        merge: true,
                                                    });
                                                } else {
                                                    navigation.goBack();
                                                }
                                            },
                                        );
                                } else {

                                    Alert.alert(
                                        "Внимание",
                                        "Эта ячейка не подходит, выберите другую.",
                                        [{
                                            text: "Ок",
                                            onPress: () => {
                                                if (!showTextInput) {
                                                    barcodeScanned.value = false;
                                                }
                                            },
                                        }]
                                    )
                                }
                            },
                        );
                    },
                },
            ]);
    };

    const device = useCameraDevice("back");
    const {hasPermission, requestPermission} = useCameraPermission();

    const barcodeScanned = useSharedValue(false);

    const codeScanner = useCodeScanner({
        codeTypes: ["code-128", "code-39"],
        onCodeScanned: (codes) => {

            if (barcodeScanned.value) {
                return;
            }

            console.log(codes[0]);
            if (product) {

                if (!validateShelvingString(codes[0].value)) {
                    return;
                }

                barcodeScanned.value = true;
                processShelvingBarCode(codes[0].value);
            } else {

                if (!findObjectByBarcodeSubstring(codes[0].value)) {
                    return;
                }

                barcodeScanned.value = true;
                processProductBarCode(codes[0].value);
            }
        },
    });

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, []);

    const productAnimationState = useAnimationState({
        hide: {
            opacity: 0,
            translateY: -10,
        },
        show: {
            opacity: 1,
            translateY: 10,
        },
    });

    useEffect(() => {
        if (product) {
            productAnimationState.transitionTo("show");
        } else {
            productAnimationState.transitionTo("hide");
        }
    }, [product]);

    if (!hasPermission) {
        return (
            <View style={styles.container}>
                <Text style={commonStyles.descText}>Нет разрешения</Text>
            </View>
        );
    }

    if (device == null) {
        return (
            <View style={styles.container}>
                <Text style={commonStyles.descText}>Что-то с камерой</Text>
            </View>
        );
    }

    return (
        <>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                photoQualityBalance='speed'
                codeScanner={codeScanner}
            />
            <MotiView
                state={productAnimationState}
                style={styles.productLabel}
            >
                <View style={{flex: 1}}>
                    <Text style={styles.productTitleText}>{product["НаименованиеТовара"]}</Text>
                    <Text style={styles.productDescText}>Количество: {product["Количество"]} шт.</Text>
                </View>
                <View style={{justifyContent: "center", paddingLeft: 10}}>
                    <TouchableOpacity
                        style={styles.buttonContainer}
                        onPress={() => setProduct("")}
                    >
                        <Icon name="trash" size={20} color="black"/>
                    </TouchableOpacity>
                </View>
            </MotiView>
            {/*<View style={styles.inputRow}>*/}
            {/*    {showTextInput ? <View style={styles.inputLabel}>*/}
            {/*        <TextInput*/}
            {/*            style={styles.inputField}*/}
            {/*            ref={textInputRef}*/}
            {/*            onChangeText={onChangeInputText}*/}
            {/*            onSubmitEditing={onSubmitEditingInputText}*/}
            {/*            placeholder="Штрихкод"*/}
            {/*            //showSoftInputOnFocus={false}*/}
            {/*            keyboardType={product ? "default" : "numeric"}*/}
            {/*        />*/}
            {/*    </View> : null}*/}

            {/*    <TouchableOpacity*/}
            {/*        style={{padding: 4, backgroundColor: 'rgba(100, 100, 100, 0.7)', borderRadius: 8}}*/}
            {/*        onPress={changeShowTextInput}*/}
            {/*    >*/}
            {/*        <AdditionalIcons name="edit" size={40} color="black"/>*/}
            {/*    </TouchableOpacity>*/}
            {/*</View>*/}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#00457e",
    },
    barcodeText: {
        fontSize: 20,
        color: "white",
        fontWeight: "bold",
    },
    productLabel: {
        position: "absolute",
        flexDirection: "row",
        backgroundColor: "white",
        padding: 10,
        width: "90%",
        top: "5%",
        left: "5%",
        borderRadius: DEFAULT_BORDER_RADIUS,
        elevation: 7,
    },
    productTitleText: {
        color: "black",
        fontSize: 20,
        fontWeight: "bold",
    },
    productDescText: {
        color: "black",
        fontSize: 18,
    },
    inputRow: {
        position: "absolute",
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'flex-end',
        //backgroundColor: 'red',
        height: '10%',
        width: "93%",
        top: "25%",
        left: "5%",
    },
    inputLabel: {
        flex: 1,
        marginRight: "1%",
        //width: "93.75%",
        backgroundColor: 'rgba(255, 255, 255, 1)',
        padding: "3%",
        paddingHorizontal: "6%",
        borderRadius: DEFAULT_BORDER_RADIUS,
        elevation: 7,
    },
    inputField: {
        alignSelf: 'stretch',
        color: "black",
        fontSize: 25,
        borderBottomWidth: 1,
        borderBottomColor: "black",
        padding: 0,
    },
    buttonContainer: {
        padding: 10,
        backgroundColor: 'rgba(100, 100, 100, 0.7)',
        borderRadius: DEFAULT_BORDER_RADIUS,
    },
});

export default ProductScannerScreen;
