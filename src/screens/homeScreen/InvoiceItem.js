import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { memo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { commonStyles } from "../../variables/Variables";
import {formatDate} from "../../utils/Helpers";

const InvoiceItem = memo(({item, index}) => {

  const navigation = useNavigation();
  const goToInvoiceItemDetails = () => {
    if (item['Принята']) {
      return;
    }

    navigation.navigate('ProductsScreen', {
      Date: item['Дата'],
      Number: item['Номер'],
    });
  };

  return (
    <TouchableOpacity
      style={[commonStyles.listItemContainer, {marginTop: index === 0 ? 15 : 10}]}
      onPress={goToInvoiceItemDetails}
    >
      {item['Принята'] &&
        <>
          <Text style={styles.titleText}>Накладная принята</Text>
          <View style={styles.separator}/>
        </>
      }
      <Text style={commonStyles.descText}>Дата: {formatDate(new Date(item['Дата']))}</Text>
      <Text style={commonStyles.descText}>Контрагент: {item['Контрагент']}</Text>
      <Text style={commonStyles.descText}>Сумма документа: {item['СуммаДокумента']}</Text>
      <Text style={commonStyles.descText}>Номер вх. документа: {item['НомерВходящегоДокумента']}</Text>
      <Text style={commonStyles.descText}>Номер: {item['Номер']}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  titleText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    flex: 1,
    backgroundColor: 'white',
    marginBottom: 5,
    height: 2,
  }
});

export default InvoiceItem;