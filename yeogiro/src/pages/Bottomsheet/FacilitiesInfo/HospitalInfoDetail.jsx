import React, {useEffect, useLayoutEffect, useCallback, useState} from 'react';
import {
  View,
  Text,
  PermissionsAndroid,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import Geolocation from 'react-native-geolocation-service';
import Config from 'react-native-config';
import axios from 'axios';
import {Linking} from 'react-native';
import {useRecoilState, useSetRecoilState} from 'recoil';
import {
  hospitalState,
  bottomSheetState,
  pathDataState,
} from '../../../state/atoms';
import {selectedHospitalIdState} from '../../../state/selectedAtom';
import {useFocusEffect} from '@react-navigation/native';

const KAKAO_API_KEY = Config.KAKAO_MAP_API_KEY;
const headers = {
  Authorization: `KakaoAK ${KAKAO_API_KEY}`,
};

async function requestPermissions() {
  await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  console.log('내 위치');
}

async function fetchHospitals(latitude, longitude) {
  console.log('fetch함수실행');
  try {
    const response = await axios.get(
      `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=HP8&x=${longitude}&y=${latitude}`,
      {headers},
    );
    console.log('API 요청보냄');
    return response.data.documents;
  } catch (error) {
    console.error(error);
    return [];
  }
}

const HospitalInfoDetail = ({navigation}) => {
  const [selectedHospitalId, setSelectedHospitalId] = useRecoilState(
    selectedHospitalIdState,
  );
  const setBottomSheet = useSetRecoilState(bottomSheetState);
  const [currentLocation, setCurrentLocation] = useState(null);
  const setPathData = useSetRecoilState(pathDataState);
  const onHospitalPress = hospitalId => {
    setSelectedHospitalId(hospitalId);
    setBottomSheet({isOpen: true, index: 0});
  };

  async function findHospital(startLng, startLat, endLng, endLat) {
    console.log('길찾기 함수 실행');
    try {
      const response = await axios.post('http://tiso.run:8000/paths/find', {
        url: `https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?start=${startLng + ',' + startLat}&goal=${endLng + ',' + endLat}`,
      });
      console.log('길찾기 API 요청보냄');
      console.log(startLng, startLat, endLng, endLat);
      console.log(response.data.data.path);
      setPathData(response.data.data.path);
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '병원 정보',
      headerTitleStyle: {
        fontSize: 20,
        // fontWeight: 'bold',
        fontFamily: 'Pretendard-Bold',
        marginBottom: 5,
      },
      headerTitleAlign: 'center',
    });
  }, [navigation]);

  const [hospitals, setHospitals] = useRecoilState(hospitalState);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setPathData(null);
        setHospitals([]);
      };
    }, [setHospitals, setPathData]),
  );

  useEffect(() => {
    requestPermissions().then(() => {
      Geolocation.getCurrentPosition(
        async position => {
          console.log('위도 경도 저장');
          const {latitude, longitude} = position.coords;
          console.log(latitude, longitude);
          setCurrentLocation({latitude, longitude});
          const hospitalsData = await fetchHospitals(latitude, longitude);
          setHospitals(hospitalsData);
        },
        error => {
          console.log(error.code, error.message);
        },
        {enableHighAccuracy: true, timeout: 15000},
      );
    });
  }, []);

  const renderHospital = ({item}) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => {
        onHospitalPress(item.id),
          findHospital(
            currentLocation.longitude,
            currentLocation.latitude,
            item.x,
            item.y,
          );
      }}>
      <View>
        <Text style={styles.title}>{item.place_name}</Text>
        <Text style={styles.address}>
          {item.road_address_name || item.address_name}
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phone}`)}>
          <Text style={styles.phone}>{item.phone}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.navigatorContainer}>
        <TouchableOpacity>
          <Image
            source={require('../../../../assets/icons/Navigator.png')}
            style={styles.navigatorImage}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={hospitals}
        renderItem={renderHospital}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  listItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    backgroundColor: '#fff',
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    // fontWeight: 'bold',
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    marginBottom: 5,
  },
  address: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: '#666',
    marginBottom: 5,
  },
  phone: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: '#007bff',
  },
  navigatorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigatorImage: {
    width: 40,
    height: 40,
  },
});

export default HospitalInfoDetail;
