import Head from "next/head"
import { ChatIcon } from '@chakra-ui/icons'
import { Flex, Heading, Button, useToast } from '@chakra-ui/react'
import { useSignInWithGoogle } from 'react-firebase-hooks/auth'
import { auth, db } from "../firebase/firebaseConfig"
import { useRouter } from "next/router"
import { setDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'

const Login = () => {
    const [signInWithGoogle] = useSignInWithGoogle(auth)
    const toast = useToast()
    const router = useRouter()

    const loginWithGoole = () => {
        signInWithGoogle("", { prompt: "select_account" })
            .then(async () => {
                toast({ title: `Login as ${auth.currentUser.email}`, status: "success" })
                if (auth.currentUser.metadata.creationTime === auth.currentUser.metadata.lastSignInTime) {
                    await setDoc(doc(db, 'users', auth.currentUser.email), {
                        name: auth.currentUser.displayName,
                        email: auth.currentUser.email,
                        bio: "",
                        imageUrl: auth.currentUser.photoURL,
                        lastSignInTime: serverTimestamp(),
                        online: true
                    })
                } else {
                    await updateDoc(doc(db, 'users', auth.currentUser.email), {
                        lastSignInTime: serverTimestamp(),
                        online: true
                    }) 
                }
            })
            .catch((error) => {
                toast({ title: "Login Failed", status: "error", description: `Error : ${error.message}` })
            }).finally(() => {
                router.push('/')
            })
    }

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
                <Button mt={'1rem'} onClick={loginWithGoole}>Login with Google</Button>
            </Flex>
        </Flex>
    )
}

export default Login