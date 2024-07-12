import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import {ActivityIndicator, FlatList, ImageBackground, StyleSheet, Text, View} from "react-native";
import {MotiView} from "moti";
import {BASE_URL, TITLE_FONT_SIZE} from "../../variables/Variables";
import {basicAuth} from "../../utils/Headers";
import {generateRandomString} from "../../utils/Helpers";
import InvoiceItem from "./InvoiceItem";
import SplashScreen from "react-native-splash-screen";
import CustomButton from "../../utils/CustomButton";

const HomeScreen = ({navigation, route}) => {

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

    const [invoicesList, setInvoicesList] = useState([]);
    const [isList, setIsList] = useState(true);

    const setInvoiceComplite = (Date, Number) => {
        setInvoicesList((prevList) => {
            return prevList.map((invoice) => {
                if (Date === invoice["Дата"] && Number === invoice["Номер"]) {
                    return {...invoice, "Принята": true};
                }
                return invoice;
            });
        });
    };

    const updateInvoices = () => {
        setInvoicesList([]);
        setIsList(true);
    };

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <CustomButton title={"ОБНОВИТЬ"} onPress={updateInvoices}/>
            ),
        });
    }, [navigation]);

    const renderInvoiceItem = useCallback(({item, index}) => {
        return (
            <InvoiceItem item={item} index={index}/>
        );
    }, []);

    useEffect(() => {
        if (invoicesList.length) {
            return;
        }

        sendTypicalGetRequest("TTN").then(response => {
            if (response.length) {
                setInvoicesList(response.map(item => {
                    return {
                        ...item,
                        id: generateRandomString(16),
                    };
                }));
            } else {
                setIsList(false);
            }
        });
    }, [sendTypicalGetRequest, invoicesList]);

    useEffect(() => {
        SplashScreen.hide();
    }, []);

    useEffect(() => {
        if (route.params?.Date && route.params?.Number) {
            const {Date, Number} = route.params;
            setInvoiceComplite(Date, Number);
        }
    }, [route.params?.Date, route.params?.Number]);

    if (!invoicesList.length && isList) {
        return (
            <View style={styles.waitingContainer}>
                <ActivityIndicator size={"large"} color="black"/>
            </View>
        );
    }

    const startState = {
        opacity: 0,
        scale: 1.5,
    };

    const finalState = {
        opacity: 1,
        scale: 1,
    };

    const transitionConfig = {
        type: "timing",
        delay: 0,
    };

    return (
        <ImageBackground
            source={require('../../assets/homeBack.jpg')}
            resizeMode="cover"
            style={styles.backgroundImage}>
            <MotiView
                from={startState}
                animate={finalState}
                transition={transitionConfig}
                style={styles.container}>
                {invoicesList.length ?
                    <FlatList
                        data={invoicesList}
                        renderItem={renderInvoiceItem}
                        keyExtractor={item => item.id}
                    /> :
                    <Text style={styles.alertText}>У вас нет текущего{"\n"}списка накладных ;(</Text>
                }
            </MotiView>
        </ImageBackground>

    );
};

const styles = StyleSheet.create({
    waitingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    backgroundImage: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    alertText: {
        color: "black",
        fontSize: TITLE_FONT_SIZE,
        fontWeight: "600",
        alignSelf: 'center',
        marginTop: "5%",
    }
});

export default HomeScreen;
