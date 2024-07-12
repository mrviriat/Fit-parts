import * as React from 'react';
import {memo} from 'react';
import {StyleSheet, Text, View} from "react-native";
import {commonStyles} from "../../variables/Variables";

const ScannedItem = memo(({item, index}) => {

    return (
        <View style={[styles.listItemContainer, {marginTop: index === 0 && 15}]}>
            <Text style={commonStyles.titleText}>Товар</Text>
            <View style={{marginLeft: 15}}>
                <Text style={commonStyles.blackDescText}>Наименование: {item.itemName}</Text>
                <Text style={commonStyles.blackDescText}>Штрихкод: {item.itemBarCode}</Text>
            </View>
            <Text style={commonStyles.titleText}>Ячейка</Text>
            <View style={{marginLeft: 15}}>
                <Text style={commonStyles.blackDescText}>Штрихкод: {item.cellBarCode}</Text>
            </View>
            <Text style={commonStyles.titleText}>Статус: {item.status}</Text>
        </View>
    );
});

const styles = StyleSheet.create({
    listItemContainer: {
        flex: 1,
        marginHorizontal: 15,
        marginBottom: 10,
        borderRadius: 15,
        padding: 10,
        backgroundColor: "white",
        elevation: 7,
    },
});

export default ScannedItem;
