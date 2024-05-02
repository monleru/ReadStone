import { defineChain } from 'viem'

export const bridgeAmount:[number,number] = [0.001,0.002]
export const zkSyncRPC = "https://rpc.ankr.com/zksync_era/560917e04d96d432bf07e7ce02a41fe4e8b61345aa288e9c7ce36126daa649a7"

export const readStone = defineChain({
    id: 690,
    name: 'Redstone',
    nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: {
        http: ['https://rpc.redstonechain.com'],
        webSocket: ['wss://rpc.redstonechain.com'],
      },
    },
    blockExplorers: {
      default: { name: 'Explorer', url: 'https://explorer.redstone.xyz' },
    }
  })
