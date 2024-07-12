import * as React from "react";
import {memo} from "react";
import {StyleSheet, Text} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {MotiView} from "moti";
import {commonStyles, DEFAULT_MARGIN, DEFAULT_PADDING} from "../../variables/Variables";

const ProductItem = memo(({item, index}) => {

    const startState = {
        opacity: 0,
        transform: [{translateY: 10}],
    };

    const finalState = {
        opacity: 1,
        transform: [{translateY: 0}],
    };

    const transitionConfig = {
        type: "timing",
        delay: index * 100,
        duration: 300,
    };

    return (
        <MotiView
            from={startState}
            animate={finalState}
            transition={transitionConfig}
            style={[styles.listItemContainer, {marginTop: index === 0 && 15}]}
        >
            <LinearGradient
                colors={["white", item["Ячейка"] ? "#47ce22" : "white"]}
                locations={[0.3, 1]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.innerContainer}
            >
                <Text style={commonStyles.titleText}>{item["НаименованиеТовара"]}</Text>
                <Text style={commonStyles.blackDescText}>Артикул: {item["Артикул"]}</Text>
                <Text style={commonStyles.blackDescText}>Количество: {item["Количество"]}</Text>
                <Text style={commonStyles.blackDescText}>Партия: {item["Партия"]}</Text>
                <Text style={commonStyles.blackDescText}>Штрихкод: {item["Штрихкод"]}</Text>
                {item["Ячейка"] &&
                    <Text style={commonStyles.blackDescText}>Номер ячейки: {item["Ячейка"]}</Text>
                }
            </LinearGradient>
        </MotiView>
    );
});

const styles = StyleSheet.create({
    listItemContainer: {
        flex: 1,
        marginHorizontal: DEFAULT_MARGIN,
        marginBottom: DEFAULT_PADDING,
        borderRadius: DEFAULT_MARGIN,
        backgroundColor: "white",
        elevation: 7,
    },
    innerContainer: {
        flex: 1,
        padding: 10,
        borderRadius: 15,
    },
});

export default ProductItem;
