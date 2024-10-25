const mysql = require('mysql2/promise');  // MySQL 데이터베이스 연결을 위한 모듈
const bcrypt = require('bcrypt');  // 비밀번호 해싱을 위한 bcrypt 모듈
const FabricCAServices = require('fabric-ca-client');  // Hyperledger Fabric의 CA (Certificate Authority)와 통신을 위한 모듈
const { Wallets } = require('fabric-network');  // Hyperledger Fabric Wallet과의 상호작용을 위한 모듈
const fs = require('fs');  // 파일 시스템 접근을 위한 모듈
const path = require('path');  // 파일 경로를 관리하기 위한 모듈

// 사용자 등록을 위한 비동기 함수. 조직명(organization), 사용자 ID(id), 이름(name), 비밀번호(password), 전화번호(phonenumber)를 인자로 받음
async function registerUser(organization, id, name, password, phonenumber) {
    console.log('Starting user registration...');

    // MySQL 데이터베이스에 연결 설정
    const connection = await mysql.createConnection({host: 'localhost', user: 'root', password: '1234', database: 'userinfo'});

    try {
        console.log('MySQL connection established');  // MySQL 연결이 성공적으로 설정되면 로그 출력

        // 조직에 맞는 Fabric 네트워크 연결 설정 파일 경로 가져오기
        const ccpPath = path.resolve(__dirname, '../../config-files', `connection-${organization}.json`);
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));  // 연결 설정 파일 로드
        console.log('Configuration file loaded');  // 설정 파일 로드 완료 로그 출력

        // CA (Certificate Authority) 정보 추출
        const caInfo = ccp.certificateAuthorities[`ca.${organization}.data-collector.com`];  // CA 정보 가져오기
        const caTLSCACerts = caInfo.tlsCACerts.pem;  // TLS 인증서 로드
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);  // CA 서비스 인스턴스 생성
        console.log('Fabric CA service initialized');  // CA 서비스 초기화 로그 출력

        // 사용자의 조직별 Wallet 경로 설정
        const walletPath = path.resolve(__dirname, 'wallet', `${organization}`);
        const wallet = await Wallets.newFileSystemWallet(walletPath);  // 파일 시스템에 기반한 Wallet 생성
        console.log(`Wallet path (이건 레지스터): ${walletPath}`);  // Wallet 경로 출력

        // Wallet에 이미 사용자가 존재하는지 확인
        const userIdentity = await wallet.get(id);
        if (userIdentity) {
            console.error(`An identity for the user ${id} already exists in the wallet`);  // 사용자가 이미 존재하는 경우 오류 출력
            throw new Error(`An identity for the user ${id} already exists in the wallet`);
        }

        // 관리자(admin)의 인증 정보를 Wallet에서 가져옴
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.error('Admin user does not exist');  // 관리자가 없는 경우 오류 출력
            throw new Error(`Admin user does not exist in the wallet for ${organization}`);
        }

        console.log('Admin identity found');  // 관리자 인증 정보가 성공적으로 로드되었음을 로그로 출력

        // 관리자 사용자의 컨텍스트 가져오기
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');  // 관리자 컨텍스트 생성
        console.log('Admin user context retrieved');  // 관리자 컨텍스트가 성공적으로 생성되었음을 로그로 출력

        // 비밀번호 해싱 (bcrypt를 사용하여 보안성을 강화)
        const hashedPassword = await bcrypt.hash(password, 10);  // 비밀번호를 해시화하여 저장
        console.log('Password hashed');  // 비밀번호 해싱 완료 로그 출력

        // CA 서버에 사용자 등록 (affiliation, enrollmentID, role, attrs)
        const secret = await ca.register({
            affiliation: `${organization}.department1`,  // 소속 정보
            enrollmentID: id,  // 사용자 ID
            role: 'client',  // 사용자 역할 (클라이언트)
            attrs: [
                { name: 'phonenumber', value: phonenumber, ecert: true }  // 사용자 전화번호 속성을 인증서에 포함시킴
            ]
        }, adminUser);
        console.log(`User ${id} registered with CA`);  // CA 서버에 사용자가 성공적으로 등록되었음을 로그로 출력

        // 사용자 등록 후 사용자 인증서 발급
        const enrollment = await ca.enroll({
            enrollmentID: id,  // 사용자 ID
            enrollmentSecret: secret  // 등록 시 발급받은 시크릿
        });
        console.log(`User ${id} enrolled with CA`);  // CA 서버에서 성공적으로 사용자 인증서를 발급받았음을 로그로 출력

        // 사용자 인증서와 키를 포함하는 X.509 인증서 구조체 생성
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,  // 발급받은 인증서
                privateKey: enrollment.key.toBytes(),  // 발급받은 개인 키
            },
            mspId: `${organization.charAt(0).toUpperCase() + organization.slice(1)}MSP`,  // 조직의 MSP ID 설정
            type: 'X.509',  // 인증서 타입 설정
        };

        // 사용자 인증서를 Wallet에 저장
        await wallet.put(id, x509Identity);
        console.log(`User ${id} identity added to wallet`);  // 사용자 인증 정보가 Wallet에 성공적으로 추가되었음을 로그로 출력

        // MySQL 데이터베이스에 사용자 정보를 저장 (사용자 ID, 해싱된 비밀번호, 이름, 전화번호 등)
        await connection.execute(
            'INSERT INTO users (id, password, name, phonenumber, organization, certificate, private_key, msp_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, hashedPassword, name, phonenumber, organization, x509Identity.credentials.certificate, x509Identity.credentials.privateKey, x509Identity.mspId]
        );
        console.log(`User ${id} information stored in database`);  // 사용자 정보가 데이터베이스에 성공적으로 저장되었음을 로그로 출력

        console.log(`Successfully registered and enrolled user ${id} for ${organization} and imported it into the wallet and database`);  // 모든 과정이 완료되었음을 로그로 출력

    } catch (error) {
        // 에러 발생 시 오류 메시지를 출력
        console.error(`Failed to register user for ${organization}:`, error.stack);
        throw new Error(`Failed to register user for ${organization}: ${error}`);
    } finally {
        // MySQL 연결 종료
        await connection.end();
        console.log('MySQL connection closed');  // MySQL 연결이 종료되었음을 로그로 출력
    }
}

module.exports = registerUser;  // 함수 외부 사용을 위해 export