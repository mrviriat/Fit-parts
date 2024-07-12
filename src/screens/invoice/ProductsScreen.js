import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import {Alert, FlatList, StyleSheet, View} from "react-native";
import {generateRandomString, sendGetRequestWithTextResponse} from "../../utils/Helpers";
import {BASE_URL} from "../../variables/Variables";
import {basicAuth} from "../../utils/Headers";
import ProductItem from "./ProductItem";
import CustomButton from "../../utils/CustomButton";

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

    const [productsList, setProductsList] = useState([]);

    const addShelvingNumberToProduct = (productBarCode, shelvingNumber) => {
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
        sendGetRequestWithTextResponse(`${BASE_URL}TTNFinish?Date=${Date}&Number=${Number}`).then(res => {
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
                <CustomButton
                    title={"СКАНЕР"}
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
                                    onPress: () => navigation.navigate("FastScannerScreen", {
                                        productsList,
                                        processScannedList
                                    }),
                                },
                            ]
                        )}/>
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

        setProductsList([])
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
            <CustomButton title={"ЗАКОНЧИТЬ"} onPress={endEditing} absolute={true}/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default ProductsScreen;
