import Otmoic, { NetworkType, Bridge } from '../src/index';

// // mainnet relay
// const RELA_URL = 'https://5b4522f4.nathanielight.myterminus.com';
// const NETWORK = NetworkType.MAINNET;
// testnet relay
const RELA_URL = 'https://5b4522f4.vaughnmedellins394.myterminus.com';
const NETWORK = NetworkType.TESTNET;

const RPCS = {};

const GetBridge = async () => {
    try {
        const relay = new Otmoic.Relay(RELA_URL);
        const bridges: Bridge[] = await relay.getBridge({ detailed: false });
        console.log('bridges', bridges);

        const translateBridges = await relay.getBridge({
            detailed: true,
            network: NETWORK,
            rpcs: RPCS,
        });

        console.log('translateBridges', translateBridges);
    } catch (error) {
        console.error(error);
    }
};

GetBridge();
