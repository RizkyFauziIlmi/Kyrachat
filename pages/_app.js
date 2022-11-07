import Login from "../components/Login"
import { ChakraProvider, Spinner, Flex, extendTheme } from '@chakra-ui/react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from "../firebase/firebaseConfig"
import { mode } from '@chakra-ui/theme-tools'

const styles = {
  global: props => ({
    body: {
      color: mode('#000000', '#FAFAFA')(props),
      bg: mode('#FAFAFA', '#121212')(props),
      lineHeight: 'base',
      fontWeight: 'semibold'
    },
  }),
};
const components = {
  Button: {
    variants: {
      solid: props => ({
        bg: mode('yellow', 'yellow')(props),
        color: 'black'
      }),
    },
    defaultProps: {
      size: ['xs', 'xs', 'sm', 'sm'],
      variant: 'solid',
    },
  },
  Drawer: {
    baseStyle: props => ({
      dialog: {
        bg: mode('#FAFAFA', '#121212')(props),
        color: mode('#121212', '#FAFAFA')(props)
      },
    }),
  },
  Modal : {
    baseStyle: props => ({
      dialog: {
        bg: mode('#FAFAFA', '#121212')(props),
        color: mode('#121212', '#FAFAFA')(props)
      },
    }),
  }
};

const theme = extendTheme({
  components,
  styles,
});

function MyApp({ Component, pageProps }) {

  const [user, loading] = useAuthState(auth)

  if (loading) {
    return (
      <ChakraProvider theme={theme}>
        <Flex bgColor={'#121212'} width={'100%'} height={'100vh'} justifyContent={'center'} alignItems={'center'}>
          <Spinner size={'xl'} />
        </Flex>
      </ChakraProvider>
    )
  }

  if (!user) {
    return (
      <ChakraProvider theme={theme}>
        <Login />
      </ChakraProvider>
    )
  }

  return (<ChakraProvider theme={theme}>
    <Component {...pageProps} />
  </ChakraProvider>)
}

export default MyApp
