# 허가형 블록체인을 이용한 데이터 수집 시스템
## 팀원 소개

|학번|이름|연락처|역할|
|------|---|---|---|
|201924484|박형주|hju00forwork@gmail.com| - CouchDB를 사용해 스마트 컨트랙트 템플릿을 관리하는 스마트 컨트랙트 템플릿 풀 구현<br> - 사용자의 회원가입 시 기입 정보 및 CA에서 발급받은 인증서를 저장하는 사용자 정보 데이터베이스 구현<br> - HTML을 사용해 구현한 기능들의 동작을 확인하기 위한 데이터 수집 플랫폼 프로토타입 구현|
|201924427|김민종|kmj010105@naver.com| - ELK Stack과 서버를 연동하여 데이터 시각화 대시보드 구성<br> - 서버와 데이터베이스 연동을 통해 UI에서 템플릿을 수정할 수 있는 기능인 스마트 컨트랙트 업데이트 구현<br> - HTML을 사용해 구현한 기능들의 동작을 확인하기 위한 데이터 수집 플랫폼 프로토타입 구현<br> - 데이터 수집, 저장, 조회 등 전반적인 백엔드 로직을 관리하는 서버 구현|
|201924566|전원균|spotydol7@gmail.com| - 네트워크의 조직과 각 조직별 피어 배치 등 네트워크의 전반적인 구조를 설계하여 하이퍼레저 패브릭 네트워크 쿠현<br> - 스마트 컨트랙트의 설치, 승인, 커밋 과정을 자동으로 진행하는 기능인 스마트 컨트랙트 배포 자동화 구현<br> - 데이터 수집 에셋이 반영된 스마트 컨트랙트 템플릿 구현<br> - 사용자 피드백 제출 및 조회 기능 구현|

## 과제 배경 및 목표
과제를 수행하기 앞서 저희가 발견한 기존 데이터 수집 시스템의 문제점은 아래와 같습니다.
- 중앙 집중형 데이터 수집 시스템의 경우, 수집 데이터 공유를 수행하며 **데이터 투명성의 저하** 가능
- 퍼블릭 블록체인을 사용한 데이터 수집 시스템의 경우 무분별한 데이터 생성으로 인해 **데이터의 질이 저하되는 문제** 발생 가능

따라서 저희는 아래와 같은 목표를 토대로 과제를 진행하고자 하였습니다.
- 허가형 블록체인 플랫폼 하이퍼레저 패브릭을 활용해 **무분별한 데이터 생성을 방지**하는 데이터 수집 시스템 구현
- 체인코드를 통해 **트랜잭션을 자동화**하여 부정행위 방지, 신뢰성 있는 데이터 수집 시스템 구현
- 스마트 컨트랙트를 기반으로 **다양한 데이터 수집 도메인에 적용 가능한** 유연한 데이터 수집 시스템 구현

 
## 시스템 구성도
![화면 캡처 2024-10-25 053102](https://github.com/user-attachments/assets/678934a2-9f61-4fa5-9083-0ca5b4b1ee44)

## 사용 기술 스택
|기술|버전|
|----|----|
|Hyperledger Fabric|2.5.9 (latest)|
|Fabric CA Server|1.5.12 (latest)|
|Docker|4.34.2 (latest)|
|MySQL|9.0.1 (latest)|
|CouchDB|3.3.3 (latest)|
|REACT|18.3.1|
|Node.js|16.13.0|
|ELK Stack|8.15.0|


### 소개 및 시연 영상

[![2024년 전기 졸업과제 22 운죽정](http://img.youtube.com/vi/Y4zyB9muWAY/0.jpg)](https://youtu.be/Y4zyB9muWAY)

### 설치 및 사용법
1. 소스코드 복제
```bash
git clone https://github.com/spotydol7/hyperledger-fabric-data-collector/tree/main
cd your-repository
```
2. 필수 패키지 설치
```bash
cd data-collection-system
npm install
```
3. 하이퍼레저 패브릭 네트워크 구성
```bash
infra 폴더로 이동
cd ../infra

인증서 생성
../bin/cryptogen generate --config=./crypto-config.yaml

제네시스 블록 생성
../bin/configtxgen -profile OrdererGenesis -channelID system-channel -outputBlock ./channel-artifacts/genesis.block

채널 생성 트랜잭션 생성
../bin/configtxgen -profile Channel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID mychannel

앵커피어 설정
../bin/configtxgen -profile Channel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID mychannel -asOrg Org1MSP
../bin/configtxgen -profile Channel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID mychannel -asOrg Org2MSP
../bin/configtxgen -profile Channel -outputAnchorPeersUpdate ./channel-artifacts/Org3MSPanchors.tx -channelID mychannel -asOrg Org3MSP

../bin/configtxgen -profile Channel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID mychannel -asOrg Org1MSP
../bin/configtxgen -profile Channel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID mychannel -asOrg Org2MSP
../bin/configtxgen -profile Channel -outputAnchorPeersUpdate ./channel-artifacts/Org3MSPanchors.tx -channelID mychannel -asOrg Org3MSP

도커 컨테이너 생성
docker-compose -f docker-compose.yaml up -d

채널 생성
docker exec -it cli peer channel create -o orderer.data-collector.com:7050 -c mychannel -f ./channel-artifacts/channel.tx --outputBlock ./channel-artifacts/channel.block --tls --cafile /etc/hyperledger/orderer/tls/ca.crt

하이퍼레저 패브릭 네트워크 자동화 스크립트 실행
sh ./start_network.sh

피어 조인
docker exec -it cli.peer0.org1.data-collector.com peer channel join -b ./channel-artifacts/channel.block
docker exec -it cli.peer1.org1.data-collector.com peer channel join -b ./channel-artifacts/channel.block
docker exec -it cli.peer0.org2.data-collector.com peer channel join -b ./channel-artifacts/channel.block
docker exec -it cli.peer1.org2.data-collector.com peer channel join -b ./channel-artifacts/channel.block
docker exec -it cli.peer0.org3.data-collector.com peer channel join -b ./channel-artifacts/channel.block
docker exec -it cli.peer1.org3.data-collector.com peer channel join -b ./channel-artifacts/channel.block

앵커피어 업데이트
docker exec -it cli.peer0.org1.data-collector.com peer channel update -o orderer.data-collector.com:7050 -c mychannel -f ./channel-artifacts/Org1MSPanchors.tx --tls --cafile /etc/hyperledger/orderer/tls/ca.crt
docker exec -it cli.peer0.org2.data-collector.com peer channel update -o orderer.data-collector.com:7050 -c mychannel -f ./channel-artifacts/Org2MSPanchors.tx --tls --cafile /etc/hyperledger/orderer/tls/ca.crt
docker exec -it cli.peer0.org3.data-collector.com peer channel update -o orderer.data-collector.com:7050 -c mychannel -f ./channel-artifacts/Org3MSPanchors.tx --tls --cafile /etc/hyperledger/orderer/tls/ca.crt
```

4. ELK Stack 설치
```bash
cd ../docker-elk
docker-compose up -d
```
만약 Elasticsearch Security 설정이 활성화되어 있어 대시보드  출력이 안되는 경우에는 localhost:9200 접속 후 id: elasticsearch, pw: changeme 입력 후 로그인하면 정상 실행 가능

5. 시스템 시작
```bash
cd ../data-collection-system
npm start
```
이후 localhost:3000으로 접속

6. 회원가입
<img width="541" alt="KakaoTalk_20241013_223555677" src="https://github.com/user-attachments/assets/4b2078d0-a7a3-411f-86e1-9f644c046caa">


데이터를 제공하고자 하는 참여자는 Org1을 선택, 데이터를 수집하고자 하는 수집자는 Org2를 선택

7. 수집자로 로그인 시

![스크린샷 2024-10-25 220630](https://github.com/user-attachments/assets/f5b9c802-8f0f-48fe-b786-d2942d8b753e)

**데이터 수집하기** 기능을 통해 자신이 수집하고자 하는 데이터의 주제 설정<br>
수집 기간이 끝나면 **나의 데이터 수집** 기능을 통해 데이터 수집 결과를 확인 가능  
**피드백** 기능을 통해 수집 및 결과 확인 과정에서 발생한 불편함 및 개선 방안을 제공 가능

8. 참여자로 로그인 시

![스크린샷 2024-10-25 221353](https://github.com/user-attachments/assets/a5adf65c-7562-4ebe-a096-4c60f1a11b45)

**데이터 수집에 참여하기** 기능을 통해 참여하고자 하는 주제에 데이터를 제출 가능<br>
**피드백** 기능을 통해 데이터 제공 과정에서의 불편함 및 개선 방안을 제공 가능
