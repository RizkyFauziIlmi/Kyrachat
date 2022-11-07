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
} from '@chakra-ui/react'
import { ArrowLeftIcon, SettingsIcon, EmailIcon, EditIcon } from '@chakra-ui/icons'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/firebaseConfig'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollection } from 'react-firebase-hooks/firestore'
import { collection } from 'firebase/firestore'
import { db } from '../firebase/firebaseConfig'
import getOtherEmail from '../utils/getOtherEmail'
import { useRouter } from 'next/router'
import { addDoc } from 'firebase/firestore'
import { useState } from 'react'

const Sidebar = ({ currentId }) => {
    const [user] = useAuthState(auth)
    const [snapshot] = useCollection(collection(db, 'chats'))
    const chats = snapshot?.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    const router = useRouter()
    const toast = useToast()
    const newChatModal = useDisclosure()
    const settingModal = useDisclosure()
    const { setColorMode, colorMode } = useColorMode()
    const [email, setEmail] = useState("")
    const [RadioColor, setRadioColor] = useState(colorMode)
    const hover = useColorModeValue("yellow", "#212121")

    const Chat = () => {
        return (
            chats?.filter(chat => chat.users.includes(user.email)).map((chat, index) => {
                return (
                    <Flex backgroundColor={chat.id === currentId ? hover : 'unset'} key={index} cursor={'pointer'} alignItems={'center'} gap={'0.5rem'} ml={'1rem'} mr={'1rem'} _hover={{ backgroundColor: hover }} p={'0.5rem'} borderRadius={'0.8rem'} onClick={() => router.push(`/chat/${chat.id}`)}>
                        <Avatar name={`${chat.users}`} />
                        <Text wordBreak={'break-word'}>{getOtherEmail(chat.users, user)}</Text>
                    </Flex>
                )
            })
        )
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
            await addDoc(collection(db, 'chats'), { users: [user.email, input] })
            toast({
                title: "Success",
                status: "success",
                description: `${input} added successful`
            })
        }
    }

    return (
        <Flex flexDir={'column'} boxShadow={['none', 'none', 'dark-lg', 'dark-lg']} width={['80vw', '80vw', '300px', '300px']} height={'100vh'}>
            <Flex alignItems={'center'} justifyContent={'space-between'} p={'0.5rem'}>
                <Flex alignItems={'center'} gap={"0.5rem"}>
                    <Avatar name='rizky' src={user.photoURL} />
                    <Text>{user.displayName}</Text>
                </Flex>
                <IconButton icon={<SettingsIcon />} onClick={settingModal.onOpen} />
            </Flex>
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
                <Chat />
            </Flex>
            <Modal isCentered isOpen={settingModal.isOpen} onClose={settingModal.onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader textAlign={'center'}>Setting ⚙️</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Tabs isFitted rounded variant='line'>
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
                                    <Button onClick={() => signOut(auth).then(() => { toast({ title: "Logout Successful", status: "success", isClosable: true }) })}>Logout</Button>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </ModalBody>

                    <ModalFooter>
                        <Button rightIcon={<EditIcon />} colorScheme='blue' mr={3} onClick={() => {
                            settingModal.onClose()
                            setColorMode(RadioColor)
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