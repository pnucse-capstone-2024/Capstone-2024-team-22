const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function enrollAdminForOrg(ccpPath, caKey, enrollmentID, enrollmentSecret, walletLabel, mspId) {
    try {
        // 네트워크 구성 파일 읽기
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // CA와 상호 작용하기 위한 새로운 CA 클라이언트 생성
        const caInfo = ccp.certificateAuthorities[caKey];

        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // wallet 생성
        const walletPath = path.join(process.cwd(), `wallet/${walletLabel}`);
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path for ${walletLabel}: ${walletPath}`);

        // admin 이미 등록되어 있는지 확인
        const identity = await wallet.get('admin');
        if (identity) {
            console.log(`An identity for the admin user "admin" already exists in the wallet for ${walletLabel}`);
            return;
        }

        // admin 등록, wallet에 저장
        const enrollment = await ca.enroll({ enrollmentID, enrollmentSecret });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId,
            type: 'X.509',
        };
        await wallet.put('admin', x509Identity);
        console.log(`Successfully enrolled admin user "admin" for ${walletLabel} and imported it into the wallet`);

    } catch (error) {
        console.error(`Failed to enroll admin user "admin" for ${walletLabel}: ${error}`);
        throw error; // 에러 발생 시 throw로 상위로 전달
    }
}

async function main() {
    try {
        // Org1 admin 등록
        await enrollAdminForOrg(
            path.resolve(__dirname, '../../config-files/connection-org1.json'), // org1의 네트워크 구성 파일 경로
            'ca.org1.data-collector.com',  // org1 CA 정보
            'admin',                       // org1 admin ID
            'adminpw',                     // org1 admin 비밀번호
            'org1',                        // wallet에 저장할 경로 label
            'Org1MSP'                      // org1 MSP ID
        );

        // Org2 admin 등록
        await enrollAdminForOrg(
            path.resolve(__dirname, '../../config-files/connection-org2.json'), // org2의 네트워크 구성 파일 경로
            'ca.org2.data-collector.com', // org2 CA 정보
            'admin',                        // org2 admin ID
            'adminpw',                      // org2 admin 비밀번호
            'org2',                         // wallet에 저장할 경로 label
            'Org2MSP'                       // org2 MSP ID
        );

        console.log('Both Org1 and Org2 admins successfully enrolled and imported into their respective wallets');
    } catch (error) {
        console.error('Error enrolling admins for org1 and org2:', error);
        process.exit(1);
    }
}

main();
