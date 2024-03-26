import React, {useLayoutEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

const {width: screenWidth} = Dimensions.get('window');
const buttonWidth = (screenWidth - 40) / 2; // 버튼의 가로 길이

const disasterList = [
  {id: '1', title: '민방공 경보'},
  {id: '2', title: '테러'},
];

function EmergencyEvacuation({navigation}) {
  useLayoutEffect(() => {
    navigation.setOptions({
      title: '비상 대피',
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
      },
      headerTitleAlign: 'center',
    });
  }, [navigation]);

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={[styles.item, {marginRight: 10}]} // 오른쪽 마진 추가
      onPress={() =>
        navigation.navigate('SafetyGuidelineDetail', {title: item.title})
      }>
      <Text style={styles.title}>{item.title}</Text>
      <Image
        source={require('../../../../../assets/icons/Next.png')}
        style={styles.icon}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={disasterList}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.flatList}
        numColumns={2}
        contentContainerStyle={styles.flatListContent} // 가운데 정렬
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  flatList: {
    padding: 10,
  },
  flatListContent: {
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderColor: 'rgb(178, 201, 219)',
    borderWidth: 2,
    borderRadius: 8,
    width: buttonWidth,
  },
  title: {
    fontSize: 18,
    color: '#333333',
    fontWeight: 'bold',
  },
  icon: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
  },
});

export default EmergencyEvacuation;
