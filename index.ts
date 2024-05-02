import axios from 'axios'
import { createWalletClient,createPublicClient, http,parseEther,formatEther,PrivateKeyAccount } from 'viem'
import { zkSync } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { eip712WalletActions } from 'viem/zksync'
import { ABI } from './utils/abi'
import { zkSyncRPC,bridgeAmount,readStone } from './config'
import { getRandomNumber, sleep } from './utils/sleep'
import fs from 'fs'
import chalk from 'chalk';

const log = console.log;

// @ts-ignore
zkSync.rpcUrls.default.http[0] = zkSyncRPC

const bridge = async (account: PrivateKeyAccount,amount:number) => {
    log(chalk.blue(account.address + ": ") + chalk.yellow(`Trying bridge ${amount} ETH`));

    const client = createWalletClient({
        account,
        chain: zkSync,
        transport: http(),
      }).extend(eip712WalletActions()) 
    const data = await axios.post("https://api.relay.link/execute/bridge", {
        "user": account.address,
        "recipient": account.address,
        "originChainId": 324,
        "destinationChainId": 690,
        "currency": "eth",
        "amount":  Number(parseEther(String(amount))),
        "source": "relay.link",
        "usePermit": false,
        "useExternalLiquidity": false
    })

    const hash = await client.sendTransaction({
        account: account,
        to: data.data.steps[0].items[0].data.to,
        value: parseEther(String(amount)),
        data: data.data.steps[0].items[0].data.data,
    })
    log(chalk.blue(account.address + ": ") + chalk.yellow("Bridge hash: " + hash));
}

const mint = async (account:PrivateKeyAccount) => {
    const client = createWalletClient({
        account,
        chain: readStone,
        transport: http(),
      })

      const hash = await client.writeContract({
        'address':"0xE680743004614a15db9873aa1aaf0ca3B101619F",
        "abi": ABI,
        functionName: 'mint',
        value: parseEther(String('0.00069'))
      })
      log(chalk.blue(account.address + ": ") + chalk.yellow("Mint hash: " + hash));
    }

const startQuestOne = async (privateKey:`0x${string}`) => {
    const account = privateKeyToAccount(privateKey) 
    log(chalk.blue(account.address + ": ") + "Started");
    const publicClient = createPublicClient({
        chain: readStone,
        transport: http(),
    })
    const data = await publicClient.getBalance({
        address: account.address
    })
    const balance = Number(formatEther(data))
    const isMinted = Number(await publicClient.readContract({
        'abi': ABI,
        'address': "0xE680743004614a15db9873aa1aaf0ca3B101619F",
        'args': [account.address],
        functionName: 'balanceOf'
    }))
    
    if(balance < 0.0069 && !isMinted) {
        await bridge(account,getRandomNumber(...bridgeAmount))
        while(true) {
            log(chalk.blue(account.address + ": ") + "Waiting brige...");
            const data = await publicClient.getBalance({
                address: account.address
            })
            const balance = Number(formatEther(data))
            if (balance > 0.00069) break
            await sleep(5,5)
        }
        await mint(account)
    } else {
        log(chalk.blue(account.address + ": ") + chalk.yellow("Already minted"));
    }
}

(async() => {
    const fileContents = fs.readFileSync('./keys/keys.txt', 'utf-8')
    const keys = [...new Set(fileContents.split('\n'))].map((i) => i.trim()).filter((i) => i.length > 0) as `0x${string}`[]
    
    for (const key of keys ) {
        try{
            await startQuestOne(key)
            await sleep(30,60)
        }
        catch(e) {
            console.log(e.message)
        }
    }
})()