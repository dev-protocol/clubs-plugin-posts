import { v5 as uuidv5 } from 'uuid'
import { randomBytes } from 'ethers'

export const uuidFactory = (url: string) => {
	const namespase = uuidv5(url, uuidv5.URL)
	return () => uuidv5(randomBytes(32), namespase)
}
