import { Business, Relay } from '../src/index'

const RELA_URL = 'https://relay-1.mainnet.otmoic.cloud'
const HASH = '0x29d848a6551aebd083087e7f0882429b07041a780178d35c2a7a318ccf36e3d4'

const GetBusiness = async () => {
    const business: Business = await new Relay(RELA_URL).getBusiness(HASH)
    console.log('business', business)
}

GetBusiness()