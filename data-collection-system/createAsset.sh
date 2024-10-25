#!/bin/bash
CHAINCODE_NAME=$1
shift
ARGS=("$@")

# 인자들을 개별적으로 전달
docker exec -i cli bash -c "peer chaincode invoke \
  -o orderer.data-collector.com:7050 \
  --tls --cafile /etc/hyperledger/orderer/tls/ca.crt \
  --channelID mychannel -n $CHAINCODE_NAME \
  -c '{\"function\":\"CreateAsset\",\"Args\":[$(printf '\"%s\",' "${ARGS[@]}" | sed 's/,$//')]}'"
