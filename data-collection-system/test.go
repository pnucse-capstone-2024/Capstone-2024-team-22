package main

import (
	"encoding/json"
	"fmt"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type SimpleAssetContract struct {
	contractapi.Contract
}

type Asset struct {
	ID    string `json:"id"`
	Value string `json:"value"`
}

// InitLedger initializes the ledger with some sample data
func (s *SimpleAssetContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	assets := []Asset{
		{ID: "asset1", Value: "100"},
		{ID: "asset2", Value: "200"},
	}

	for _, asset := range assets {
		assetJSON, err := json.Marshal(asset)
		if err != nil {
			return err
		}

		err = ctx.GetStub().PutState(asset.ID, assetJSON)
		if err != nil {
			return err
		}
	}

	return nil
}

// CreateAsset creates a new asset
func (s *SimpleAssetContract) CreateAsset(ctx contractapi.TransactionContextInterface, id string, value string) error {
	asset := Asset{
		ID:    id,
		Value: value,
	}

	assetJSON, err := json.Marshal(asset)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, assetJSON)
}

// ReadAsset reads an asset from the ledger
func (s *SimpleAssetContract) ReadAsset(ctx contractapi.TransactionContextInterface, id string) (*Asset, error) {
	assetJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if assetJSON == nil {
		return nil, fmt.Errorf("the asset %s does not exist", id)
	}

	var asset Asset
	err = json.Unmarshal(assetJSON, &asset)
	if err != nil {
		return nil, err
	}

	return &asset, nil
}

// GetAssetMetadata returns the structure of the asset
func (s *SimpleAssetContract) GetAssetMetadata(ctx contractapi.TransactionContextInterface) (map[string]string, error) {
    metadata := map[string]string{
        "ID":    "string",
        "Value": "string",
    }
    return metadata, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(new(SimpleAssetContract))
	if err != nil {
		fmt.Printf("Error create simple asset chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting simple asset chaincode: %s", err.Error())
	}
}
