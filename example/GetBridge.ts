import { Bridge, Relay, assistive } from '../src/index';

// // mainnet relay
// const RELA_URL = 'https://5b4522f4.mariansopsoraj.myterminus.com';
// testnet relay
const RELA_URL = 'https://5b4522f4.vaughnmedellins394.myterminus.com';
const NETWORK = 'mainnet';
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
