package main

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// 구조체 정의
type WeatherData struct {
	Date        string  `json:"date"`
	MaxTemp     float64 `json:"maxTemp"`
	MaxWind     float64 `json:"maxWind"`
	MinTemp     float64 `json:"minTemp"`
	MinHumidity int     `json:"minHumidity"`
	Region      string  `json:"region"`
}

// SmartContract 구조체 정의
type SmartContract struct {
	contractapi.Contract
}

// 기상 데이터를 저장하는 함수
func (s *SmartContract) CreateAsset(ctx contractapi.TransactionContextInterface, date string, region string, maxTemp string, minTemp string, maxWind string, minHumidity string) error {
	// 입력받은 데이터를 변환
	maxTempValue, err := strconv.ParseFloat(maxTemp, 64)
	if err != nil {
		return fmt.Errorf("최고 기온 변환 오류: %s", err.Error())
	}
	minTempValue, err := strconv.ParseFloat(minTemp, 64)
	if err != nil {
		return fmt.Errorf("최저 기온 변환 오류: %s", err.Error())
	}
	maxWindValue, err := strconv.ParseFloat(maxWind, 64)
	if err != nil {
		return fmt.Errorf("최대 풍속 변환 오류: %s", err.Error())
	}
	minHumidityValue, err := strconv.Atoi(minHumidity)
	if err != nil {
		return fmt.Errorf("최소 습도 변환 오류: %s", err.Error())
	}

	// WeatherData 객체 생성
	weather := WeatherData{
		Date:        date,
		Region:      region,
		MaxTemp:     maxTempValue,
		MinTemp:     minTempValue,
		MaxWind:     maxWindValue,
		MinHumidity: minHumidityValue,
	}

	// 객체를 JSON 형식으로 변환
	weatherJSON, err := json.Marshal(weather)
	if err != nil {
		return fmt.Errorf("JSON 변환 오류: %s", err.Error())
	}

	// 블록체인에 저장 (키는 "region_date" 형식)
	key := region + "_" + date
	fmt.Printf("Generated Key: %s\n", key) // 터미널에 key 출력
	return ctx.GetStub().PutState(key, weatherJSON)
}

// 기상 데이터 조회 함수
func (s *SmartContract) QueryAsset(ctx contractapi.TransactionContextInterface, date string, region string) (*WeatherData, error) {
	key := region + "_" + date
	weatherJSON, err := ctx.GetStub().GetState(key)
	if err != nil {
		return nil, fmt.Errorf("기상 데이터 조회 실패: %s", err.Error())
	}
	if weatherJSON == nil {
		return nil, fmt.Errorf("해당 기상 데이터가 없습니다.")
	}

	var weather WeatherData
	err = json.Unmarshal(weatherJSON, &weather)
	if err != nil {
		return nil, fmt.Errorf("JSON 변환 오류: %s", err.Error())
	}

	return &weather, nil
}

// 모든 날씨 데이터를 JSON 형식으로 조회하는 함수
func (s *SmartContract) QueryAllAssets(ctx contractapi.TransactionContextInterface) (string, error) {
	// 빈 문자열로 범위를 지정해 모든 키를 조회
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return "", fmt.Errorf("모든 자산 조회 실패: %s", err.Error())
	}
	defer resultsIterator.Close()

	var assets []WeatherData
	// 조회된 결과를 반복하여 처리
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return "", err
		}

		var asset WeatherData
		err = json.Unmarshal(queryResponse.Value, &asset)
		if err != nil {
			return "", fmt.Errorf("JSON 변환 오류: %s", err.Error())
		}

		assets = append(assets, asset) // 조회된 데이터를 리스트에 추가
	}

	// 리스트를 JSON 형식으로 직렬화
	assetsJSON, err := json.Marshal(assets)
	if err != nil {
		return "", fmt.Errorf("JSON 직렬화 오류: %s", err.Error())
	}

	return string(assetsJSON), nil
}

// WeatherData 메타데이터 반환
func (s *SmartContract) GetAssetMetadata(ctx contractapi.TransactionContextInterface) (map[string]string, error) {
	metadata := map[string]string{
		"1. Date":        "string",
		"2. Region":      "string",
		"3. MaxTemp":     "float64",
		"4. MinTemp":     "float64",
		"5. MaxWind":     "float64",
		"6. MinHumidity": "int",
	}
	return metadata, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(new(SmartContract))
	if err != nil {
		fmt.Printf("체인코드 생성 실패: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("체인코드 실행 실패: %s", err.Error())
	}
}
