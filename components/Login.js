import Head from "next/head"
import { ChatIcon } from '@chakra-ui/icons'
import { Flex, Heading, Button, useToast } from '@chakra-ui/react'
import { useSignInWithGoogle } from 'react-firebase-hooks/auth'
import { auth } from "../firebase/firebaseConfig"

const Login = () => {
    const [signInWithGoogle] = useSignInWithGoogle(auth)
    const toast = useToast()

    return (
        <Flex width={'100%'} height={'100vh'} justifyContent={'center'} alignItems={'center'}>
            <Head>
                <title>KyraChat | Login</title>
            </Head>
            <Flex
                flexDir={'column'}
                alignItems={'center'}
                gap={'0.5rem'}
                p={'1rem'}
                boxShadow={'dark-lg'}
                width={'max-content'}
                height={'max-content'}
                borderRadius={'0.5rem'}
                border={'1px solid yellow'}
            >
                <Heading>KyraChat</Heading>
                <ChatIcon fontSize={'100px'} color={'yellow'} />
                <Button mt={'1rem'} onClick={() => signInWithGoogle("", { prompt: "select_account" }).then(() => {
                    toast({ title: `Login as ${auth.currentUser.email}`, status: "success" })
                }).catch((error) => {
                    toast({title: "Login Failed", status: "error", description: `Error : ${error.message}`})
                })}>Login with Google</Button>
            </Flex>
        </Flex>
    )
}

export default Login