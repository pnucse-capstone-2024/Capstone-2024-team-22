// 필요한 패키지들을 불러옵니다.
const { Gateway, Wallets } = require('fabric-network');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// 환경 변수 설정
const CHAINCODE_NAME = 'test';
const CHAINCODE_PATH = path.resolve(__dirname, '../chaincode/test');
const CHAINCODE_LABEL = 'test_1.0';
const CHANNEL_NAME = 'mychannel';
const ORDERER_CA = '/etc/hyperledger/orderer/tls/ca.crt';
const ORDERER_ADDRESS = 'orderer.data-collector.com:7050';

const ORGS = [
  { org: 'Org1MSP', peer0: 'peer0.org1.data-collector.com:7051', peer1: 'peer1.org1.data-collector.com:8051', msp: '/home/icandol007/fabric-samples/infra/crypto-config/peerOrganizations/org1.data-collector.com/users/Admin@org1.data-collector.com/msp' },
  { org: 'Org2MSP', peer0: 'peer0.org2.data-collector.com:9051', peer1: 'peer1.org2.data-collector.com:10051', msp: '/home/icandol007/fabric-samples/infra/crypto-config/peerOrganizations/org2.data-collector.com/users/Admin@org2.data-collector.com/msp' },
];

async function executeCommand(command, envVars = {}) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, ...envVars };
    exec(command, { env }, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function deployChaincode() {
  try {
    // 체인코드 패키징
    await executeCommand(`go mod init ${CHAINCODE_NAME}`);
    await executeCommand(`go mod tidy`);
    await executeCommand(`peer lifecycle chaincode package ${CHAINCODE_NAME}.tar.gz --path ${CHAINCODE_PATH} --lang golang --label ${CHAINCODE_LABEL}`);
    console.log('체인코드 패키징 완료');

    // 모든 Org의 피어에 체인코드 설치
    for (const { org, peer0, peer1, msp } of ORGS) {
      console.log(`${org}의 체인코드를 설치 중...`);
      await executeCommand(`peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz`, { CORE_PEER_LOCALMSPID: org, CORE_PEER_ADDRESS: peer0, CORE_PEER_MSPCONFIGPATH: msp });
      await executeCommand(`peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz`, { CORE_PEER_LOCALMSPID: org, CORE_PEER_ADDRESS: peer1, CORE_PEER_MSPCONFIGPATH: msp });
      console.log(`${org}에 체인코드를 설치했습니다.`);
    }

    // 승인 및 커밋
    const packageId = 'PACKAGE_ID_PLACEHOLDER'; // 패키지 ID를 가져오는 로직 추가 필요
    for (const { org, peer0, msp } of ORGS) {
      console.log(`${org}에 대해 체인코드를 승인 중...`);
      await executeCommand(`peer lifecycle chaincode approveformyorg -o ${ORDERER_ADDRESS} --ordererTLSHostnameOverride orderer.data-collector.com --channelID ${CHANNEL_NAME} --name ${CHAINCODE_NAME} --version 1.0 --package-id ${packageId} --sequence 1 --tls --cafile ${ORDERER_CA}`, { CORE_PEER_LOCALMSPID: org, CORE_PEER_ADDRESS: peer0, CORE_PEER_MSPCONFIGPATH: msp });
    }
    
    console.log('체인코드 승인 완료');
    
    console.log('체인코드 커밋 중...');
    await executeCommand(`peer lifecycle chaincode commit -o ${ORDERER_ADDRESS} --channelID ${CHANNEL_NAME} --name ${CHAINCODE_NAME} --version 1.0 --sequence 1 --tls --cafile ${ORDERER_CA} --peerAddresses ${ORGS.map(org => org.peer0).join(' --peerAddresses ')} --tlsRootCertFiles ${ORGS.map(org => `${org.msp}/../peers/peer0.${org.org}.com/tls/ca.crt`).join(' --tlsRootCertFiles ')}`);
    
    console.log('체인코드 커밋 완료');

  } catch (error) {
    console.error('체인코드 배포에 실패했습니다:', error);
  }
}

deployChaincode();

