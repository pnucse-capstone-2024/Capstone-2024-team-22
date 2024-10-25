#!/bin/bash

CHAINCODE_NAME=$1
CHAINCODE_PATH=$2
CHAINCODE_LABEL=$3

if [ -z "$CHAINCODE_NAME" ] || [ -z "$CHAINCODE_PATH" ] || [ -z "$CHAINCODE_LABEL" ]; then
  echo "입력 형식: ./deployChaincode.sh 체인코드이름 체인코드경로 체인코드라벨"
  exit 1
fi

set -e

CONTAINER_CC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/chaincode/${CHAINCODE_NAME}"

PACKAGE_NAME=${CHAINCODE_NAME}.tar.gz
#rm -f $PACKAGE_NAME

# 컨테이너 내부 경로 생성
docker exec cli rm -rf ${CONTAINER_CC_PATH}
docker exec cli mkdir -p ${CONTAINER_CC_PATH}
docker cp $CHAINCODE_PATH cli:/opt/gopath/src/github.com/hyperledger/fabric/chaincode/$CHAINCODE_NAME

docker exec -i cli bash -c "export GO111MODULE=on && cd /opt/gopath/src/github.com/hyperledger/fabric/chaincode/$CHAINCODE_NAME && go mod init $CHAINCODE_NAME && go mod tidy"

# 패키징
docker exec -i cli bash -c "peer lifecycle chaincode package $PACKAGE_NAME --path /opt/gopath/src/github.com/hyperledger/fabric/chaincode/$CHAINCODE_NAME --lang golang --label $CHAINCODE_LABEL"

# 각 피어의 포트를 변수로 선언
peer0_org1_port=7051
peer1_org1_port=8051
peer0_org2_port=9051
peer1_org2_port=10051
peer0_org3_port=11051
peer1_org3_port=12051

# 포트를 설정하는 함수
get_peer_port() {
  local peer=$1
  local org=$2

  if [ "$peer" == "peer0" ] && [ "$org" == "org1" ]; then
    echo $peer0_org1_port
  elif [ "$peer" == "peer1" ] && [ "$org" == "org1" ]; then
    echo $peer1_org1_port
  elif [ "$peer" == "peer0" ] && [ "$org" == "org2" ]; then
    echo $peer0_org2_port
  elif [ "$peer" == "peer1" ] && [ "$org" == "org2" ]; then
    echo $peer1_org2_port
  elif [ "$peer" == "peer0" ] && [ "$org" == "org3" ]; then
    echo $peer0_org3_port
  elif [ "$peer" == "peer1" ] && [ "$org" == "org3" ]; then
    echo $peer1_org3_port
  else
    exit 1
  fi
}

# 현재 시퀀스 번호를 가져오는 함수
get_current_sequence() {
  local channel=$1
  local chaincode=$2

  current_sequence=$(docker exec -i cli bash -c "peer lifecycle chaincode querycommitted --channelID ${channel} --name ${chaincode}" | grep 'Sequence:' | awk '{print $2}' | tr -d ',')

  if [ -z "$current_sequence" ]; then
    echo 1  # 만약 시퀀스 번호가 없다면 1로 설정 (첫 배포인 경우)
  else
    echo $((current_sequence + 1))  # 기존 시퀀스 번호에 1을 더함
  fi
}

# 채널과 체인코드 이름을 정의
CHANNEL_NAME="mychannel"

# 현재 시퀀스 번호 가져오기
SEQUENCE=$(get_current_sequence "$CHANNEL_NAME" "$CHAINCODE_NAME")
echo "Current sequence number: $SEQUENCE"

# 모든 피어에 설치
for org in 1 2 3; do
  for peer in 0 1; do
    PEER="peer${peer}"
    ORG="org${org}"
    PEER_PORT=$(get_peer_port "$PEER" "$ORG")

    PEER_ADDRESS="${PEER}.${ORG}.data-collector.com:${PEER_PORT}"
    echo "${PEER}.${ORG}에 체인코드 설치 중"
    docker exec -i cli bash -c "CORE_PEER_ADDRESS=${PEER_ADDRESS} \
      CORE_PEER_LOCALMSPID=Org${org}MSP \
      CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/crypto-config/peerOrganizations/${ORG}.data-collector.com/peers/${PEER}.${ORG}.data-collector.com/tls/ca.crt \
      CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/${ORG}/users/Admin@${ORG}.data-collector.com/msp \
      peer lifecycle chaincode install $PACKAGE_NAME"
  done
done

# 패키징된 ID 확인
echo "체인코드 설치 확인 중..."
QUERY_RESULT=$(docker exec -i cli bash -c "peer lifecycle chaincode queryinstalled")
echo "Query Result: $QUERY_RESULT"

PACKAGE_ID=$(echo "$QUERY_RESULT" | awk -v label="$CHAINCODE_LABEL" '$0 ~ label {getline; gsub("Package ID: ", "", $0); gsub(", Label:.*", "", $0); print}')
echo "Package ID: $PACKAGE_ID"

# 모든 Org에서 승인
for org in 1 2 3; do
  echo "Org${org} 체인코드 승인 중"
  PEER_PORT=$(get_peer_port "peer0" "org${org}")

  docker exec -i cli bash -c "CORE_PEER_ADDRESS=peer0.org${org}.data-collector.com:${PEER_PORT} \
    CORE_PEER_LOCALMSPID=Org${org}MSP \
    CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/crypto-config/peerOrganizations/org${org}.data-collector.com/peers/peer0.org${org}.data-collector.com/tls/ca.crt \
    CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/crypto-config/peerOrganizations/org${org}.data-collector.com/users/Admin@org${org}.data-collector.com/msp \
    peer lifecycle chaincode approveformyorg -o orderer.data-collector.com:7050 --ordererTLSHostnameOverride orderer.data-collector.com --tls --cafile /etc/hyperledger/orderer/tls/ca.crt --channelID $CHANNEL_NAME --name $CHAINCODE_NAME --version 1.0 --package-id $PACKAGE_ID --sequence $SEQUENCE"
done

# 커밋
echo "커밋 중"
docker exec -i cli bash -c "peer lifecycle chaincode commit -o orderer.data-collector.com:7050 --ordererTLSHostnameOverride orderer.data-collector.com --tls --cafile /etc/hyperledger/orderer/tls/ca.crt --channelID $CHANNEL_NAME --name $CHAINCODE_NAME --version 1.0 --sequence $SEQUENCE --peerAddresses peer0.org1.data-collector.com:7051 --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org1.data-collector.com/peers/peer0.org1.data-collector.com/tls/ca.crt --peerAddresses peer0.org2.data-collector.com:9051 --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org2.data-collector.com/peers/peer0.org2.data-collector.com/tls/ca.crt --peerAddresses peer0.org3.data-collector.com:11051 --tlsRootCertFiles /etc/hyperledger/fabric/crypto-config/peerOrganizations/org3.data-collector.com/peers/peer0.org3.data-collector.com/tls/ca.crt"

# 커밋 제대로 됐는지 쿼리 <— 나중에 빼기
echo "커밋 결과:"
docker exec -i cli bash -c "peer lifecycle chaincode querycommitted --channelID mychannel --name $CHAINCODE_NAME"