import { Bridge, Relay, assistive } from '../src/index';
import { NetworkType } from '../src/interface/interface';

// // mainnet relay
// const RELA_URL = 'https://5b4522f4.nathanielight.myterminus.com';
// const NETWORK = NetworkType.MAINNET;
// testnet relay
const RELA_URL = 'https://5b4522f4.vaughnmedellins394.myterminus.com';
const NETWORK = NetworkType.TESTNET;
const RPCS = {};

const GetBridge = async () => {
    try {
        const bridges: Bridge[] = await new Relay(RELA_URL).getBridge();
        console.log('bridges', bridges);

        const translateBridges = await assistive.TranslateBridge(bridges, NETWORK, RPCS);
        console.log('translateBridges', translateBridges);
    } catch (error) {
        console.error(error);
    }
};

GetBridge();
