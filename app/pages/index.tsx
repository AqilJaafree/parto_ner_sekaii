import {
  VStack,
  HStack,
  Button,
  Text,
  Box,
  Flex,
  Spacer,
  Heading,
  extendTheme,
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { PublicKey, Transaction } from "@solana/web3.js"
import { useWallet } from "@solana/wallet-adapter-react"
import WalletMultiButton from "@/components/WalletMultiButton"
import {
  program,
  connection,
  globalLevel1GameDataAccount,
} from "@/utils/anchor"
//import image  from "@/public/image.jpeg"
import React from "react"
//import mai from '../public/mai1.jpeg'
type GameDataAccount = {
  playerPosition: number
}

export default function Home() {
  const { publicKey, sendTransaction } = useWallet()

  const [loadingInitialize, setLoadingInitialize] = useState(false)
  const [loadingRight, setLoadingRight] = useState(false)
  const [loadingLeft, setLoadingLeft] = useState(false)

  const [playerPosition, setPlayerPosition] = useState("New Story")
  const [message, setMessage] = useState("")
  const [gameDataAccount, setGameDataAccount] =
    useState<GameDataAccount | null>(null)
  const colors = {
    white: "white"
  }

  
  const updatePlayerPosition = (position: number) => {
  //  let maiImage = null
    switch (position) {
      case 0:
        setPlayerPosition("PC !! I Need you to turn off the main reactor before it's too late we have 60 seconds left before the world destroyed forever!! say mai while trying to hold off the forces of destruction")
        setMessage("Final act : Defiance")
       // maiImage=mai;
        break
      case 1:
        setPlayerPosition("nods in understanding. With determination in their eyes, the PC knows what they must do. They sprint towards the main reactor, dodging debris and enemy fire as they go. Time is ticking away, each second feeling like an eternity")
        setMessage("")
       // maiImage=mai;
        break
      case 2:
        setPlayerPosition("Meanwhile, Mai holds off the advancing forces of destruction with all her strength, buying the PC precious moments to reach the reactor.")
        setMessage("")
        break
      case 3:
        setPlayerPosition("She fights with a fierce resolve, knowing that their survival depends on the success of the PC's mission, As the PC reaches the reactor room, they are met with a daunting sight")
        setMessage("the end")
        break
      case 4:
        setPlayerPosition("chapter 4")
        setMessage("the end")
        break
      case 5:
        setPlayerPosition("chapter 5")
        setMessage("the end")
        break
      default:
        console.log("Invalid player position")
        break
    }
  }

  useEffect(() => {
    if (gameDataAccount && gameDataAccount.playerPosition != null) {
      updatePlayerPosition(gameDataAccount.playerPosition)
    } else {
      console.log("gameDataAccount or playerPosition is null")
    }
  }, [gameDataAccount])

  useEffect(() => {
    fetchData(globalLevel1GameDataAccount)
  }, [])

  async function handleClickGetData() {
    fetchData(globalLevel1GameDataAccount)
  }

  async function handleClickInitialize() {
    if (publicKey) {
      const transaction = program.methods
        .initialize()
        .accounts({
          newGameDataAccount: globalLevel1GameDataAccount,
          signer: publicKey,
        })
        .transaction()

      await sendAndConfirmTransaction(() => transaction, setLoadingInitialize)
    } else {
      try {
        const response = await fetch("/api/sendTransaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ instruction: "initialize" }),
        })
        const data = await response.json()
        console.log(data)
      } catch (error) {
        console.error(error)
      }
    }
  }

  async function handleClickRight() {
    
    if (publicKey) {
      const transaction = program.methods
        .moveRight()
        .accounts({
          gameDataAccount: globalLevel1GameDataAccount,
        })
        .transaction()
        
      await sendAndConfirmTransaction(() => transaction, setLoadingRight)
    } else {
      try {
        const response = await fetch("/api/sendTransaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ instruction: "moveRight" }),
        })
        const data = await response.json()
        console.log(data)
      } catch (error) {
        console.error(error)
      }
    }
  }

  async function handleClickLeft() {
    if (publicKey) {
      const transaction = program.methods
        .moveLeft()
        .accounts({
          gameDataAccount: globalLevel1GameDataAccount,
        })
        .transaction()

      await sendAndConfirmTransaction(() => transaction, setLoadingLeft)
    } else {
      try {
        const response = await fetch("/api/sendTransaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ instruction: "moveLeft" }),
        })
        setLoadingLeft(false)
        const data = await response.json()
        console.log(data)
      } catch (error) {
        console.error(error)
      }
    }
  }

  async function sendAndConfirmTransaction(
    transactionBuilder: () => Promise<Transaction>,
    setLoading: (loading: boolean) => void
  ) {
    if (!publicKey || !program || !connection) return

    setLoading(true)

    try {
      const tx = await transactionBuilder()
      const txSig = await sendTransaction(tx, connection)

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash()

      await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature: txSig,
      })

      setLoading(false)
    } catch (error) {
      console.error("Error processing transaction:", error)
      setLoading(false)
    }
  }

  const fetchData = async (pda: PublicKey) => {
    console.log("Fetching GameDataAccount state...")

    try {
      const account = await program.account.gameDataAccount.fetch(pda)
      console.log(JSON.stringify(account, null, 2))
      setGameDataAccount(account)
    } catch (error) {
      console.log(`Error fetching GameDataAccount state: ${error}`)
    }
  }

  useEffect(() => {
    if (!globalLevel1GameDataAccount) return

    const subscriptionId = connection.onAccountChange(
      globalLevel1GameDataAccount,
      (accountInfo) => {
        const decoded = program.coder.accounts.decode(
          "gameDataAccount",
          accountInfo.data
        )
        console.log("New player position via socket", decoded.playerPosition)
        setGameDataAccount(decoded)
      }
    )

    return () => {
      connection.removeAccountChangeListener(subscriptionId)
    }
  }, [connection, globalLevel1GameDataAccount, program])

  return (
    <Box backgroundImage = "url('./image3.jpeg')">
      <Flex px={4} py={4}>
        <Spacer />
        <WalletMultiButton />
      </Flex>
      <VStack justifyContent="center" alignItems="center" height="75vh">
        <VStack>
          <Heading fontSize="s" backgroundColor= "white" >{message}</Heading>
          <Text fontSize="s" backgroundColor= "white">{playerPosition}</Text>
          <HStack>
            <Button
              width="100px"
              isLoading={loadingLeft}
              onClick={handleClickLeft}
            >
              Back
            </Button>
            <Button width="100px" onClick={handleClickGetData}>
              Get Data
            </Button>
            <Button
              width="100px"
              isLoading={loadingRight}
              onClick={handleClickRight}
            >
              Next
            </Button>
          </HStack>
          <Button
            width="100px"
            isLoading={loadingInitialize}
            onClick={handleClickInitialize}
          >
            Start
          </Button>
        </VStack>
      </VStack>
    </Box>
  )
}
