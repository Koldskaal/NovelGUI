import { extendTheme } from "@chakra-ui/react"

const config = {
    initialColorMode: "dark",
    useSystemColorMode: false,
  }
  
  // 3. extend the theme
  const theme = extendTheme({
    config,
    layerStyles: {
      justbg: {
        bg: "gray.800",
      },
      base: {
        bg: "gray.800",
        color: "gray.50",
      },
      selected: {
        bg: "gray.900",
        color: "white",
      },
      fonts: {
        heading: "Open Sans",
        body: "Raleway",
      },
      border: {
        border: "1px solid",
        borderColor: "gray.500",
      },
    },
  });

  export default theme