import Otmoic, { BusinessFullData, SwapType } from '../src/index';

const RELA_URL = 'https://relay-1.mainnet.otmoic.cloud';
const ADDRESS = '0xC62a61B0C801A92CCfc1f90C49528ae4B0E160e6';

const GetHistory = async () => {
    const history: BusinessFullData[] = await new Otmoic.Relay(RELA_URL).getHistory(ADDRESS, SwapType.ATOMIC);
    console.log('history', history);
};

GetHistory();
