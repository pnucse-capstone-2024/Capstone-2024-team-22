package main

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// 구조체 정의
type WaterQualityData struct {
	Date     string  `json:"date"`
	Region   string  `json:"region"`
	Temp     float64 `json:"temp"`
	PH       float64 `json:"ph"`
	DO		 float64 `json:"DO"`
	Salinity float64 `json:"salinity"`
}

// SmartContract 구조체 정의
type SmartContract struct {
	contractapi.Contract
}

// 수질 데이터를 저장하는 함수
func (s *SmartContract) CreateAsset(ctx contractapi.TransactionContextInterface, date string, region string, temp string, ph string, do string, salinity string) error {
	temperature, err := strconv.ParseFloat(temp, 64)
	if err != nil {
		return fmt.Errorf("수온 변환 오류: %s", err.Error())
	}
	phValue, err := strconv.ParseFloat(ph, 64)
	if err != nil {
		return fmt.Errorf("pH 변환 오류: %s", err.Error())
	}
	doValue, err := strconv.ParseFloat(do, 64)
	if err != nil {
		return fmt.Errorf("DO 변환 오류: %s", err.Error())
	}
	salinityValue, err := strconv.ParseFloat(salinity, 64)
	if err != nil {
		return fmt.Errorf("염분 변환 오류: %s", err.Error())
	}

	waterQuality := WaterQualityData{
		Date:     date,
		Region:   region,
		Temp:     temperature,
		PH:       phValue,
		DO:		  doValue,
		Salinity: salinityValue,
	}

	waterQualityJSON, err := json.Marshal(waterQuality)
	if err != nil {
		return fmt.Errorf("JSON 변환 오류: %s", err.Error())
	}

	key := region + "_" + date
	fmt.Printf("Generated Key: %s\n", key) // 터미널에 key 출력
	return ctx.GetStub().PutState(key, waterQualityJSON)
}

// 수질 데이터 조회 함수
func (s *SmartContract) QueryAsset(ctx contractapi.TransactionContextInterface, date string, region string) (*WaterQualityData, error) {
	key := region + "_" + date
	waterQualityJSON, err := ctx.GetStub().GetState(key)
	if err != nil {
		return nil, fmt.Errorf("수질 데이터 조회 실패: %s", err.Error())
	}
	if waterQualityJSON == nil {
		return nil, fmt.Errorf("해당 수질 데이터가 없습니다.")
	}

	var waterQuality WaterQualityData
	err = json.Unmarshal(waterQualityJSON, &waterQuality)
	if err != nil {
		return nil, fmt.Errorf("JSON 변환 오류: %s", err.Error())
	}

	return &waterQuality, nil
}

// 모든 수질 데이터를 JSON 형식으로 조회
func (s *SmartContract) QueryAssets(ctx contractapi.TransactionContextInterface) (string, error) {
	// 빈 문자열로 범위를 지정해 모든 키를 조회
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return "", fmt.Errorf("모든 자산 조회 실패: %s", err.Error())
	}
	defer resultsIterator.Close()

	var assets []WaterQualityData
	// 조회된 결과를 반복하여 처리
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return "", err
		}

		var asset WaterQualityData
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

// WaterQualityData 메타데이터 반환
func (s *SmartContract) GetAssetMetadata(ctx contractapi.TransactionContextInterface) (map[string]string, error) {
	metadata := map[string]string{
		"1. Date":     "string",
		"2. Region":   "string",
		"3. Temp":     "float64",
		"4. PH":       "float64",
		"5. DO": 	   "float64",
		"5. Salinity": "float64",
	}
	return metadata, nil
}
