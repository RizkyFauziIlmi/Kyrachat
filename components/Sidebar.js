import {
    Flex,
    Avatar,
    Text,
    IconButton,
    InputGroup,
    InputRightElement,
    useDisclosure,
    Button,
    RadioGroup,
    Radio,
    Divider,
    Input,
    Tabs,
    AvatarBadge,
    TabList,
    HStack,
    Tab,
    TabPanel,
    TabPanels,
    Collapse,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    useColorMode,
    useColorModeValue,
    ModalCloseButton,
    FormControl,
    FormLabel,
} from '@chakra-ui/react'
import { ArrowLeftIcon, SettingsIcon, EmailIcon, EditIcon, BellIcon } from '@chakra-ui/icons'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/firebaseConfig'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollection } from 'react-firebase-hooks/firestore'
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/firebaseConfig'
import getOtherEmail from '../utils/getOtherEmail'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const Sidebar = ({ currentId, callback }) => {
    const [user] = useAuthState(auth)
    const [snapshot] = useCollection(collection(db, 'chats'))
    const [value] = useCollection(collection(db, 'users'))
    const usersProfile = value?.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    const chats = snapshot?.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    const chatList = chats?.filter(chat => chat.users.includes(user.email) && chat.friend === true)
    const profile = usersProfile?.filter((userprofile) => userprofile.email === user.email)
    const router = useRouter()
    const toast = useToast()
    const newChatModal = useDisclosure()
    const settingModal = useDisclosure()
    const pendingModal = useDisclosure()
    const { setColorMode, colorMode } = useColorMode()
    const [email, setEmail] = useState("")
    const [RadioColor, setRadioColor] = useState(colorMode)
    const [imageUrlInput, setImageUrlInput] = useState("")
    const [displayNameInput, setDisplayNameInput] = useState("")
    const [bioInput, setBioInput] = useState("")
    const [change, setChange] = useState(false)
    const [requestCount, setRequestCount] = useState(0)
    const hover = useColorModeValue("yellow", "#212121")

    const logout = async () => {
        await signOut(auth).then(async () => {
            toast({ title: "Logout Successful", status: "success", isClosable: true })
            await updateDoc(doc(db, 'users', user.email), {
                online: false
            })
        }).catch((error) => {
            toast({ title: "Logout Failed", status: "error", description: `Error: ${error.message}`, isClosable: true })
        })
            .finally(() => {
                router.push('/')
            })
    }

    const acceptFriend = async (id, email) => {
        await updateDoc(doc(db, 'chats', id), {
            friend: true
        }).then(() => {
            toast({
                title: `Now ${email} is Your Friend`,
                status: "success",
                isClosable: true
            })
        }).catch((error) => {
            toast({
                title: "Failed",
                status: "error",
                description: `Error: ${error.message}`,
                isClosable: true
            })
        })
    }

    const declineFriend = async (id, email) => {
        await deleteDoc(doc(db, 'chats', id)).then(() => {
            toast({
                title: `You Rejected ${email} Friend Request`,
                status: "success",
                isClosable: true
            })
        }).catch((error) => {
            toast({
                title: "Failed",
                status: "error",
                description: `Error: ${error.message}`,
                isClosable: true
            })
        })
    }

    useEffect(() => {
        setRequestCount(chats?.filter(chat => chat.users.includes(user.email) && chat.friend === false && chat.sender !== user.email).length)
    }, [chats, user.email])

    const PendingChat = () => {
        return (
            chats?.filter(chat => chat.users.includes(user.email) && chat.friend === false && chat.sender !== user.email).map((chat, index) => {
                return (
                    <Flex overflowX={'hidden'} width={'100%'} key={index} p={'0.5rem'} gap={'1rem'} justifyContent={'space-between'} alignItems={'center'}>
                        <HStack>
                            <Avatar name={`${chat.users}`} />
                            <Text wordBreak={'break-word'} fontSize={'sm'}>{getOtherEmail(chat.users, user)}</Text>
                        </HStack>
                        <HStack spacing={'0.5rem'}>
                            <Button onClick={() => acceptFriend(chat.id, getOtherEmail(chat.users, user))}>Accept</Button>
                            <Button onClick={() => declineFriend(chat.id, getOtherEmail(chat.users, user))}>Decline</Button>
                        </HStack>
                    </Flex>
                )
            })
        )
    }

    const updateProfile = async () => {
        if (change) {
            await updateDoc(doc(db, 'users', user.email), {
                bio: bioInput,
                imageUrl: imageUrlInput,
                name: displayNameInput
            })
                .then(() => {
                    toast({
                        title: "Profile Updated",
                        status: "success",
                        isClosable: true
                    })
                    setChange(false)
                })
        }
    }

    const chatExist = (email) => chats?.find((chat) => (chat.users.includes(user.email) && chat.users.includes(email)))

    const newChat = async (input) => {
        if (chatExist(input)) {
            toast({
                title: "Failed",
                status: "error",
                description: "Email already exist!"
            })
        } else if (input === user.email) {
            toast({
                title: "Failed",
                status: "error",
                description: "Email is currently use!"
            })
        } else {
            await addDoc(collection(db, 'chats'), { friend: false, users: [user.email, input], sender: user.email })
            toast({
                title: "Successfully Asked for Friendship",
                status: "success",
                description: `wait for ${input} to accept it`,
                isClosable: true
            })
        }
    }

    return (
        <Flex flexDir={'column'} boxShadow={['none', 'none', 'dark-lg', 'dark-lg']} width={['100vw', '100vw', '35vw', '20vw']} height={'100vh'}>
            <Flex alignItems={'center'} justifyContent={'space-between'} p={'0.5rem'}>
                {profile?.map((value, index) => {
                    return (
                        <Flex alignItems={'center'} gap={"0.5rem"} key={index}>
                            <Avatar name={value.name} src={value.imageUrl} >
                                {value.online ? <AvatarBadge boxSize='1.25em' bg='green.500' /> : ""}
                            </Avatar>
                            <Text>{value.name}</Text>
                        </Flex>
                    )
                })}
                <Flex gap={'0.3rem'}>
                    {requestCount === 0 ? <IconButton icon={<BellIcon />} /> : <Button leftIcon={<BellIcon />} rightIcon={<Text>{requestCount}</Text>} onClick={pendingModal.onToggle} />}
                    <IconButton icon={<SettingsIcon />} onClick={settingModal.onOpen} />
                </Flex>
            </Flex>
            <Collapse in={pendingModal.isOpen} animateOpacity>
                <PendingChat />
            </Collapse>
            <Divider />
            <Button p={'1rem'} ml={'1rem'} mr={'1rem'} mt={'1rem'} mb={'0.5rem'} onClick={newChatModal.onToggle}>New Chat</Button>
            <Flex justifyContent={'center'} mb={'1rem'}>
                <Collapse in={newChatModal.isOpen} animateOpacity>
                    <InputGroup>
                        <Input onChange={event => setEmail(event.target.value.toLowerCase())} placeholder='Enter email...' />
                        <InputRightElement width='4.5rem' mr={'0.5rem'}>
                            <Button isDisabled={email === null || email.match(/^ *$/) !== null ? true : false} h='1.75rem' size='sm' onClick={() => newChat(email)} rightIcon={<EmailIcon />} >
                                Add
                            </Button>
                        </InputRightElement>
                    </InputGroup>
                </Collapse>
            </Flex>
            <Flex flexDir={'column'} sx={{ scrollbarWidth: "0px" }} gap={'0.5rem'} overflowY={'auto'} overflowX={'hidden'}>
                {chatList?.map((chat) => {
                    return (
                        usersProfile.filter((value) => value.email.includes(getOtherEmail(chat.users, user))).map((userProfile, index) => {
                            return (
                                <Flex backgroundColor={chat.id === currentId ? hover : 'unset'} key={index} cursor={'pointer'} alignItems={'center'} gap={'0.5rem'} ml={'1rem'} mr={'1rem'} _hover={{ backgroundColor: hover }} p={'0.5rem'} borderRadius={'0.8rem'} onClick={() => {
                                    router.push(`/chat/${chat.id}`, undefined, { scroll: true })
                                    callback()
                                }} >
                                    <Avatar src={userProfile.imageUrl} name={userProfile.name} >
                                        {userProfile.online ? <AvatarBadge boxSize='1.25em' bg='green.500' /> : ""}
                                    </Avatar>
                                    <Text wordBreak={'break-word'}>{userProfile.name}</Text>
                                </Flex>
                            )
                        })
                    )
                })}
            </Flex>
            <Modal isCentered isOpen={settingModal.isOpen} onClose={settingModal.onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader textAlign={'center'}>Setting ⚙️</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Tabs isFitted rounded variant='line' onChange={() => {
                            profile?.map((value) => {
                                setImageUrlInput(value.imageUrl)
                                setDisplayNameInput(value.name)
                                setBioInput(value.bio)
                            })
                        }}>
                            <TabList mb='1em'>
                                <Tab>General</Tab>
                                <Tab>Account</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel>
                                    <Text>Appearence</Text>
                                    <Divider />
                                    <Text>Theme</Text>
                                    <RadioGroup onChange={setRadioColor} defaultValue={colorMode} >
                                        <HStack spacing={'1rem'}>
                                            <Radio value='dark'>
                                                Dark
                                            </Radio>
                                            <Radio value='light'>
                                                Light
                                            </Radio>
                                        </HStack>
                                    </RadioGroup>
                                </TabPanel>
                                <TabPanel>
                                    {profile?.map((value, index) => {
                                        return (
                                            <Flex key={index} flexDir={'column'} alignItems={'center'}>
                                                <Avatar name={value.name} src={imageUrlInput === "" ? value.imageUrl : imageUrlInput} size={'2xl'} />
                                                <FormControl>
                                                    <FormLabel>Image Url</FormLabel>
                                                    <Input defaultValue={value.imageUrl} onChange={(event) => {
                                                        setImageUrlInput(event.target.value)
                                                        setChange(true)
                                                    }} />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Display Name</FormLabel>
                                                    <Input defaultValue={value.name} onChange={(event) => {
                                                        setDisplayNameInput(event.target.value)
                                                        setChange(true)
                                                    }} />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Bio</FormLabel>
                                                    <Input defaultValue={value.bio} onChange={(event) => {
                                                        setBioInput(event.target.value)
                                                        setChange(true)
                                                    }} />
                                                </FormControl>
                                            </Flex>
                                        )
                                    })}
                                    <Button onClick={logout}>Logout</Button>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </ModalBody>

                    <ModalFooter>
                        <Button rightIcon={<EditIcon />} colorScheme='blue' mr={3} onClick={() => {
                            settingModal.onClose()
                            setColorMode(RadioColor)
                            updateProfile()
                        }}>
                            Save
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    )
}

export default Sidebar