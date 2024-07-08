import {useSharedValue} from "react-native-reanimated";
import * as React from "react";
import {useEffect, useState} from "react";
import {Alert, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {Camera, useCameraDevice, useCameraPermission, useCodeScanner,} from "react-native-vision-camera";
import Icon from "react-native-vector-icons/FontAwesome5";
import {commonStyles} from "../../variables/Variables";
import {MotiView, useAnimationState} from "moti";
import {sendGetRequestWithTextResponse} from "../../utils/Helpers";

const DEFAULT_BORDER_RADIUS = 15;

const ProductScannerScreen = ({navigation, route}) => {

    const {productsList} = route.params;

    const [product, setProduct] = useState("");

    const findObjectByBarcodeSubstring = (targetSubstring) => {
        for (const item of productsList) {
            if (targetSubstring.includes(item["Штрихкод"]) && targetSubstring.includes(item["Партия"])) {
                return item;
            }
        }
        return false;
    };

    const validateShelvingString = (input) => {

        const regex = /^[A-Z]\d-\d-\d$/;

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
                    onPress: () => barcodeScanned.value = false,
                },
                {
                    text: "Продолжить",
                    onPress: () => {
                        barcodeScanned.value = false;
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
                        sendGetRequestWithTextResponse(`ControlCell?barcode=${code}`).then(controlCellRes => {
                                // console.log(controlCellRes);
                                if (controlCellRes === "Да") {
                                    // console.log(`${BASE_URL}PutProductByCell?NumberParty=${numberParty}&Barcode=${code}`);
                                    sendGetRequestWithTextResponse(`PutProductByCell?NumberParty=${numberParty}&Barcode=${code}`)
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
                                            onPress: () => barcodeScanned.value = false,
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
                    <Text style={commonStyles.titleText}>{product["НаименованиеТовара"]}</Text>
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
    productDescText: {
        color: "black",
        fontSize: 18,
    },
    buttonContainer: {
        padding: 10,
        backgroundColor: 'rgba(100, 100, 100, 0.7)',
        borderRadius: DEFAULT_BORDER_RADIUS,
    },
});

export default ProductScannerScreen;
