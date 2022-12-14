import Head from "next/head";
import Sidebar from "../components/Sidebar";
import { Flex, Box, useColorModeValue } from '@chakra-ui/react'

export default function Home() {
  const bg = useColorModeValue("#B3B3B3", "#212121")
  return (
    <div>
      <Head>
        <title>Kyrachat</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex>
        <Sidebar />
      </Flex>
    </div>
  )
}
