import * as React from "react";
import {StatusBar} from "react-native";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import HomeScreen from "./src/screens/homeScreen/HomeScreen";
import ProductsScreen from "./src/screens/invoice/ProductsScreen";
import ProductScannerScreen from "./src/screens/productScannerScreen/ProductScannerScreen";

import "react-native-reanimated";
import "react-native-gesture-handler";
import FastScannerScreen from "./src/screens/fastScannerScreen/FastScannerScreen";
import CustomButton from "./src/utils/CustomButton";

const Stack = createNativeStackNavigator();

const App = () => {
    return (
        <NavigationContainer>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="white"
            />
            <Stack.Navigator>
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        title: "Накладные",
                        headerRight: () =>
                            <CustomButton title={"ОБНОВИТЬ"}/>
                    }}/>
                <Stack.Screen
                    name="ProductsScreen"
                    component={ProductsScreen}
                    options={({navigation}) => ({
                        title: "Товары",
                        headerRight: () => <CustomButton title={"СКАНЕР"}/>
                    })}
                />
                <Stack.Screen
                    name="FastScannerScreen"
                    component={FastScannerScreen}
                    options={{
                        title: "Быстрое сканирование",
                    }}
                />
                <Stack.Screen
                    name="ProductScannerScreen"
                    component={ProductScannerScreen}
                    options={{
                        title: "Сканер",
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
