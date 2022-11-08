import Sidebar from "../../components/Sidebar"
import { Flex, Avatar, Text, Heading, useColorModeValue, Center, Drawer, DrawerOverlay, Box, DrawerContent, DrawerBody, DrawerCloseButton, DrawerHeader, DrawerFooter, useDisclosure, Input, IconButton, InputGroup, InputRightElement, Button, AvatarBadge, VStack } from '@chakra-ui/react'
import { HamburgerIcon, ArrowForwardIcon } from '@chakra-ui/icons'
import { useRouter } from "next/router"
import { useCollectionData, useDocumentData, useCollection } from 'react-firebase-hooks/firestore'
import { collection, doc, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from "../../firebase/firebaseConfig"
import { useAuthState } from 'react-firebase-hooks/auth'
import getOtherEmail from "../../utils/getOtherEmail"
import { useEffect, useRef, useState } from "react"
import Head from "next/head"

const Chat = () => {
    const router = useRouter()
    const { id } = router.query
    const q = query(collection(db, `chats/${id}/messages`), orderBy("timestamp"))
    const [value] = useCollection(collection(db, 'users'))
    const usersProfile = value?.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    const [messages] = useCollectionData(q)
    const [user] = useAuthState(auth)
    const [chat] = useDocumentData(doc(db, 'chats', id))
    const bottomOfChat = useRef(null)
    const bg = useColorModeValue("#FFFFFF", "#212121")
    const drawer = useDisclosure()
    const btnRef = useRef(null)
    const profile = usersProfile?.filter((userProfile) => userProfile.id === getOtherEmail(chat?.users, user))

    useEffect(() => {
        setTimeout(() => {
            bottomOfChat.current.scrollIntoView({
                behavior: "smooth",
                block: "start"
            })
        }, 100)
    }, [messages])

    const BottomBar = () => {
        const [message, setMessage] = useState("")

        const sendMessage = async (event) => {
            event.preventDefault()
            await addDoc(collection(db, `chats/${id}/messages`), {
                text: message,
                sender: user.email,
                timestamp: serverTimestamp()
            })
                .then(() => {
                    setMessage("")
                })
        }

        return (
            <Flex p={'1rem'}>
                <InputGroup>
                    <Input onChange={event => setMessage(event.target.value)} autoComplete="off" placeholder="Type a message..." variant={'filled'} />
                    <InputRightElement width='4.5rem'>
                        <Button isDisabled={message === null || message.match(/^ *$/) !== null ? true : false} onClick={sendMessage} h='1.75rem' size='sm' mr={'0.5rem'} rightIcon={<ArrowForwardIcon />} colorScheme={'yellow'}>
                            Send
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </Flex>
        )
    }


    const GetMessages = () => {
        return (
            messages?.map((message, index) => {
                return (
                    <Flex key={index} justifyContent={'flex-end'} boxShadow={'base'} p={'0.5rem'} flexDir={'column'} alignItems={message.sender === user.email ? 'flex-end' : 'flex-start'} color={message.sender === user.email ? 'black' : 'white'} bgColor={message.sender === user.email ? 'yellow' : 'blue.500'} maxW={['70vw', '70vw', '65vw', '65vw']} wordBreak={'break-word'} minW={'50px'} width={'fit-content'} borderRadius={'0.5rem'} alignSelf={message.sender === user.email ? 'flex-end' : 'unset'}>
                        <Text>{message.text}</Text>
                        <Text opacity={0.5} fontSize={'xs'}>{new Date(message.timestamp?.seconds * 1000).toLocaleTimeString()}</Text>
                    </Flex>
                )
            })
        )
    }

    return (
        <>
            <Head>
                <title>Chat with | {getOtherEmail(chat?.users, user)}</title>
            </Head>
            <Flex overflow={'hidden'}>
                <Box display={['none', 'none', 'flex', 'flex']}>
                    <Sidebar currentId={id} callback={() => { }} />
                </Box>
                <Flex flex={1} flexDir={'column'} bgColor={bg} width={'100%'} height={'100vh'}>
                    {profile?.map((userProfile, index) => {
                        return (
                            <Flex key={index} boxShadow={'lg'} p={'0.5rem'} alignItems={'center'} justifyContent={'space-between'}>
                                <Flex alignItems={'center'} gap={'0.2rem'}>
                                    <Avatar name={userProfile.name} src={userProfile.imageUrl} >
                                        {userProfile.online ? <AvatarBadge boxSize='1.25em' bg='green.500' /> : ""}
                                    </Avatar>
                                    <Flex flexDir={'column'} pl={'0.5rem'}>
                                        <Heading size={'sm'}>{userProfile.name}</Heading>
                                        <Text fontSize={'sm'} opacity={0.5}>{userProfile.online ? 'online' : 'offline'}</Text>
                                    </Flex>
                                </Flex>
                                <IconButton icon={<HamburgerIcon />} onClick={drawer.onOpen} display={['unset', 'unset', 'none', 'none']} />
                            </Flex>
                        )
                    })}
                    <Flex flex={1} overflow={'auto'} sx={{ scrollbarWidth: "none" }} flexDir={'column'} gap={'1rem'} p={'1rem'}>
                        <GetMessages />
                        <div ref={bottomOfChat}></div>
                    </Flex>
                    <BottomBar />
                </Flex>
            </Flex>
            <Drawer
                isOpen={drawer.isOpen}
                placement='top'
                onClose={drawer.onClose}
                finalFocusRef={btnRef}
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerBody>
                        <Center>
                            <Sidebar currentId={id} callback={drawer.onClose} />
                        </Center>
                    </DrawerBody>
                    <DrawerFooter>
                        <Button onClick={drawer.onClose}>Close</Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    )
}

export default Chat