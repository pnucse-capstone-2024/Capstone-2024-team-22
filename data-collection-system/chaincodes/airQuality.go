package main

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// 구조체 정의
type AirQualityData struct {
	Date   string  `json:"date"`
	Region string  `json:"region"`
	PM10   int     `json:"pm10"`
	Ozone  float64 `json:"ozone"`
	NO2    float64 `json:"no2"`
	CO     float64 `json:"co"`
}

// SmartContract 구조체 정의
type SmartContract struct {
	contractapi.Contract
}

// 대기질 데이터를 저장하는 함수
func (s *SmartContract) CreateAsset(ctx contractapi.TransactionContextInterface, date string, region string, pm10 string, ozone string, no2 string, co string) error {
	pm10Value, err := strconv.Atoi(pm10)
	if err != nil {
		return fmt.Errorf("PM10 변환 오류: %s", err.Error())
	}
	ozoneValue, err := strconv.ParseFloat(ozone, 64)
	if err != nil {
		return fmt.Errorf("오존 변환 오류: %s", err.Error())
	}
	no2Value, err := strconv.ParseFloat(no2, 64)
	if err != nil {
		return fmt.Errorf("NO2 변환 오류: %s", err.Error())
	}
	coValue, err := strconv.ParseFloat(co, 64)
	if err != nil {
		return fmt.Errorf("CO 변환 오류: %s", err.Error())
	}

	airQuality := AirQualityData{
		Date:   date,
		Region: region,
		PM10:   pm10Value,
		Ozone:  ozoneValue,
		NO2:    no2Value,
		CO:     coValue,
	}

	airQualityJSON, err := json.Marshal(airQuality)
	if err != nil {
		return fmt.Errorf("JSON 변환 오류: %s", err.Error())
	}

	key := region + "_" + date
	fmt.Printf("Generated Key: %s\n", key) // 터미널에 key 출력
	fmt.Printf("Assets: %s, %s, %d, %f, %f, %f\n", date, region, pm10Value, ozoneValue, no2Value, coValue) // 터미널에 key 출력

	return ctx.GetStub().PutState(key, airQualityJSON)
}

// 대기질 데이터 조회 함수
func (s *SmartContract) QueryAsset(ctx contractapi.TransactionContextInterface, date string, region string) (*AirQualityData, error) {
	key := region + "_" + date
	airQualityJSON, err := ctx.GetStub().GetState(key)
	if err != nil {
		return nil, fmt.Errorf("대기질 데이터 조회 실패: %s", err.Error())
	}
	if airQualityJSON == nil {
		return nil, fmt.Errorf("해당 대기질 데이터가 없습니다.")
	}

	var airQuality AirQualityData
	err = json.Unmarshal(airQualityJSON, &airQuality)
	if err != nil {
		return nil, fmt.Errorf("JSON 변환 오류: %s", err.Error())
	}

	return &airQuality, nil
}

// 모든 대기질 데이터를 JSON 형식으로 조회하는 함수
func (s *SmartContract) QueryAllAssets(ctx contractapi.TransactionContextInterface) (string, error) {
	// 빈 문자열로 범위를 지정해 모든 키를 조회
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return "", fmt.Errorf("모든 자산 조회 실패: %s", err.Error())
	}
	defer resultsIterator.Close()

	var assets []AirQualityData
	// 조회된 결과를 반복하여 처리
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return "", err
		}

		var asset AirQualityData
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

// AirQualityData 메타데이터 반환
func (s *SmartContract) GetAssetMetadata(ctx contractapi.TransactionContextInterface) (map[string]string, error) {
	metadata := map[string]string{
		"1. Date":   "string",
		"2. Region": "string",
		"3. PM10":   "int",
		"4. Ozone":  "float64",
		"5. NO2":    "float64",
		"6. CO":     "float64",
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
