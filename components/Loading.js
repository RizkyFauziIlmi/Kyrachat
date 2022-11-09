import { Flex, Spinner } from '@chakra-ui/react'

const Loading = () => {
    return(
        <Flex bgColor={'#121212'} width={'100%'} height={'100vh'} justifyContent={'center'} alignItems={'center'}>
          <Spinner size={'xl'} />
        </Flex>
    )
}

export default Loading