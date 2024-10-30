#!/bin/bash
# 도커 up
docker-compose -f ./docker-compose.yaml up -d

# 채널 생성
docker exec -it cli peer channel create -o orderer.data-collector.com:7050 -c mychannel -f ./channel-artifacts/channel.tx --outputBlock ./channel-artifacts/channel.block --tls --cafile /etc/hyperledger/orderer/tls/ca.crt
#docker exec -e CORE_PEER_LOCALMSPID=OrdererMSP -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/msp -it cli peer channel create -o orderer.data-collector.com:7050 -c mychannel -f ./channel-artifacts/channel.tx --outputBlock ./channel-artifacts/channel.block --tls --cafile /etc/hyperledger/orderer/tls/ca.crt

# Org1 피어 채널 조인
docker exec -e CORE_PEER_LOCALMSPID=Org1MSP \
            -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/crypto-config/peerOrganizations/org1.data-collector.com/users/Admin@org1.data-collector.com/msp \
            -it cli peer channel join -b ./channel-artifacts/channel.block

# Org2 피어 환경 변수 설정 및 채널 조인
docker exec -e CORE_PEER_ADDRESS=peer0.org2.data-collector.com:9051 \
            -e CORE_PEER_LOCALMSPID=Org2MSP \
            -e CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/crypto-config/peerOrganizations/org2.data-collector.com/peers/peer0.org2.data-collector.com/tls/ca.crt \
            -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/crypto-config/peerOrganizations/org2.data-collector.com/users/Admin@org2.data-collector.com/msp \
            -it cli peer channel join -b ./channel-artifacts/channel.block

docker exec -e CORE_PEER_ADDRESS=peer1.org2.data-collector.com:10051 \
            -e CORE_PEER_LOCALMSPID=Org2MSP \
            -e CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/crypto-config/peerOrganizations/org2.data-collector.com/peers/peer1.org2.data-collector.com/tls/ca.crt \
            -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/crypto-config/peerOrganizations/org2.data-collector.com/users/Admin@org2.data-collector.com/msp \
            -it cli peer channel join -b ./channel-artifacts/channel.block

# Org3 피어 환경 변수 설정 및 채널 조인
docker exec -e CORE_PEER_ADDRESS=peer0.org3.data-collector.com:11051 \
            -e CORE_PEER_LOCALMSPID=Org3MSP \
            -e CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/crypto-config/peerOrganizations/org3.data-collector.com/peers/peer0.org3.data-collector.com/tls/ca.crt \
            -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/crypto-config/peerOrganizations/org3.data-collector.com/users/Admin@org3.data-collector.com/msp \
            -it cli peer channel join -b ./channel-artifacts/channel.block

docker exec -e CORE_PEER_ADDRESS=peer1.org3.data-collector.com:12051 \
            -e CORE_PEER_LOCALMSPID=Org3MSP \
            -e CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/crypto-config/peerOrganizations/org3.data-collector.com/peers/peer1.org3.data-collector.com/tls/ca.crt \
            -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/crypto-config/peerOrganizations/org3.data-collector.com/users/Admin@org3.data-collector.com/msp \
            -it cli peer channel join -b ./channel-artifacts/channel.block

# Org1의 peer1도 채널에 조인
docker exec -e CORE_PEER_ADDRESS=peer1.org1.data-collector.com:8051 \
            -e CORE_PEER_LOCALMSPID=Org1MSP \
            -e CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/crypto-config/peerOrganizations/org1.data-collector.com/peers/peer1.org1.data-collector.com/tls/ca.crt \
            -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/crypto-config/peerOrganizations/org1.data-collector.com/users/Admin@org1.data-collector.com/msp \
            -it cli peer channel join -b ./channel-artifacts/channel.block

# 앵커 피어 업데이트
docker exec -e CORE_PEER_LOCALMSPID=Org1MSP \
            -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/crypto-config/peerOrganizations/org1.data-collector.com/users/Admin@org1.data-collector.com/msp \
            -it cli peer channel update -o orderer.data-collector.com:7050 -c mychannel -f ./channel-artifacts/Org1MSPanchors.tx --tls --cafile /etc/hyperledger/orderer/tls/ca.crt

docker exec -e CORE_PEER_ADDRESS=peer0.org2.data-collector.com:9051 \
            -e CORE_PEER_LOCALMSPID=Org2MSP \
            -e CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/crypto-config/peerOrganizations/org2.data-collector.com/peers/peer0.org2.data-collector.com/tls/ca.crt \
            -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/crypto-config/peerOrganizations/org2.data-collector.com/users/Admin@org2.data-collector.com/msp \
            -it cli peer channel update -o orderer.data-collector.com:7050 -c mychannel -f ./channel-artifacts/Org2MSPanchors.tx --tls --cafile /etc/hyperledger/orderer/tls/ca.crt

docker exec -e CORE_PEER_ADDRESS=peer0.org3.data-collector.com:11051 \
            -e CORE_PEER_LOCALMSPID=Org3MSP \
            -e CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/crypto-config/peerOrganizations/org3.data-collector.com/peers/peer0.org3.data-collector.com/tls/ca.crt \
            -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/crypto-config/peerOrganizations/org3.data-collector.com/users/Admin@org3.data-collector.com/msp \
            -it cli peer channel update -o orderer.data-collector.com:7050 -c mychannel -f ./channel-artifacts/Org3MSPanchors.tx --tls --cafile /etc/hyperledger/orderer/tls/ca.crt
