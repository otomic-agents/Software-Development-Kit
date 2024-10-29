import { Business, BusinessFullData, Relay } from '../src/index';

const RELA_URL = 'https://5b4522f4.nathanielight.myterminus.com';
const HASH = '0xd83f7d42b7423b98d70014be67abc6277344356ab588c15396f622057ded4bf8';

const GetBusiness = async () => {
    const business: Business = await new Relay(RELA_URL).getBusiness(HASH);
    console.log('business', business);

    const businessFull: BusinessFullData = await new Relay(RELA_URL).getBusinessFull(HASH);
    console.log('full business', businessFull);
};

GetBusiness();
