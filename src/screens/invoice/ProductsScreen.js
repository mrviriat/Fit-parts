import * as React from "react";
import {View, StyleSheet, FlatList, Button, TouchableOpacity, Text, Alert} from "react-native";
import {useCallback, useEffect, useState} from "react";
// import {useIsFocused, useNavigation} from '@react-navigation/native';
import {generateRandomString} from "../../utils/Helpers";
import {BASE_URL} from "../../variables/Variables";
import {basicAuth} from "../../utils/Headers";
import ProductItem from "./ProductItem";
import {useFocusEffect} from '@react-navigation/native';

const ProductsScreen = ({navigation, route}) => {

    const sendTypicalGetRequest = useCallback(async (addedString) => {
        try {
            const response = await fetch(BASE_URL + addedString, {
                method: "GET",
                headers: {
                    Authorization: basicAuth,
                },
            });
            if (response.ok) {
                return response.json();
            }
        } catch (e) {
            console.log(e);
        }
    }, []);

    const sendTypicalGetRequestWithText = useCallback(async (addedString) => {
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

    const [productsList, setProductsList] = useState([]);

    const addShelvingNumberToProduct = (productBarCode, shelvingNumber) => {
        // console.log(productBarCode);
        // console.log(shelvingNumber);
        setProductsList((prevList) => {
            return prevList.map((product) => {
                if (productBarCode === product["Штрихкод"]) {
                    // console.log(product["Штрихкод"]);
                    return {...product, "Ячейка": shelvingNumber};
                }
                return product;
            });
        });
    };

    const endEditing = () => {
        const {Date, Number} = route.params;
        sendTypicalGetRequestWithText(`TTNFinish?Date=${Date}&Number=${Number}`).then(res => {
            console.log(res);
            if (res === "Да") {
                navigation.navigate({
                    name: 'Home',
                    params: {Date: Date, Number: Number},
                    merge: true,
                });
            } else {
                navigation.goBack();
            }
        });
    };

    const renderProductItem = useCallback(({item, index}) => {
        return (
            <ProductItem item={item} index={index}/>
        );
    }, []);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                <Button
                    onPress={() =>
                        Alert.alert(
                            "Внимание",
                            "Выберите желаемый способ сканирования.",
                            [
                                {
                                    text: "Камера устройства",
                                    onPress: () => navigation.navigate("ProductScannerScreen", {productsList}),
                                },
                                {
                                    text: "Внешний сканер",
                                    onPress: () => navigation.navigate("FastScannerScreen", {productsList, processScannedList}),
                                },
                            ]
                        )

                    }
                    title="Сканер"/>
        });
    }, [navigation, productsList]);

    useEffect(() => {

        const {Date, Number} = route.params;

        sendTypicalGetRequest(`TTNInfo?Date=${Date}&Number=${Number}`).then(response => {
            setProductsList(response.map(item => {
                return {
                    ...item,
                    id: generateRandomString(16),
                };
            }));
        });
    }, [sendTypicalGetRequest]);

    const processScannedList = (scannedList) => {
        //console.log("я тут")
        setProductsList([])
        // console.log(scannedList)
        // setProductsList((prevProductsList) => {
        //     return prevProductsList.map((product) => {
        //         scannedList.forEach((scannedItem) => {
        //             console.log(scannedItem.itemBarCode)
        //             console.log(scannedItem.itemPartNumber)
        //             console.log(product["Штрихкод"])
        //             console.log(product["Партия"])
        //             if (
        //                 scannedItem.itemBarCode === product["Штрихкод"] &&
        //                 scannedItem.itemPartNumber === product["Партия"] &&
        //                 scannedItem.status === "Успех"
        //             ) {
        //                 console.log("нашёл")
        //                 product["Ячейка"] = scannedItem.cellBarCode;
        //                 console.log(product["Ячейка"])
        //             }
        //         });
        //         console.log(product)
        //         return product;
        //     });
        // });
        const {Date, Number} = route.params;

        sendTypicalGetRequest(`TTNInfo?Date=${Date}&Number=${Number}`).then(response => {
            setProductsList(response.map(item => {
                return {
                    ...item,
                    id: generateRandomString(16),
                };
            }));
        });
    };

    // useEffect(
    //     () => {
    //         if (route.params?.scannedList) {
    //             console.log("я вернулся")
    //         }
    //     },
    //     [route.params?.scannedList]
    // );
    // useEffect(
    //     () =>
    //         navigation.addListener('focus', (e) => {
    //
    //             console.log(e)
    //         }),
    //     [navigation, ]
    // );

    // useEffect(() => {
    //     const unsubscribe = navigation.addListener('focus', (e) => {
    //        console.log(e.data.action)
    //     });
    //
    //     return unsubscribe;
    // }, [navigation]);

    useEffect(() => {
        if (route.params?.producteCode && route.params?.shelvingCode) {
            const {producteCode, shelvingCode} = route.params;
            addShelvingNumberToProduct(producteCode, shelvingCode);
        }
    }, [route.params?.producteCode, route.params?.shelvingCode]);

    return (
        <View style={styles.container}>
            <FlatList
                contentContainerStyle={{flexGrow: 1}}
                data={productsList}
                renderItem={renderProductItem}
                keyExtractor={item => item.id}
            />
            <TouchableOpacity
                style={styles.submitButton}
                onPress={endEditing}
            >
                <Text style={styles.buttonText}>ЗАКОНЧИТЬ</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    submitButton: {
        position: "absolute",
        padding: 10,
        backgroundColor: "#2296f3",
        bottom: 15,
        right: 10,
        borderRadius: 2,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: '600',
        // fontWeight: "bold",
    },
});

export default ProductsScreen;
