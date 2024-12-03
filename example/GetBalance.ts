import { Bridge, assistive } from '../src';
import { NetworkType } from '../src/interface/interface';

const bridge: Bridge = {
    bridge_id: 6,
    src_chain_id: 501,
    dst_chain_id: 9006,
    src_token: '0xd691ced994b9c641cf8f80b5f4dbdd80f0fd86af1b8604a702151fa7e46b7232',
    dst_token: '0xacda8bf66c2cadac9e99aa1aa75743f536e71094',
    bridge_name: undefined,
};

const NETWORK = NetworkType.TESTNET;

const ADDRESS = 'JA2Wc8SzDtKG9N72X1j6T6wPho7Pa4k4yhiVcZqoHmpf';

const GetBalance = async () => {
    const balance = await assistive.GetBalance(bridge, ADDRESS, NETWORK, undefined);
    console.log('balance', balance);
};

GetBalance();
