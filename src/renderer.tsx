import "./index.css";
import React from "react";
import ReactDOM from "react-dom";
import { Divider, Input, Center, Box, Button, extendTheme, ChakraProvider } from "@chakra-ui/react";
import {NovelCard, SearchField} from "./components"
import {quitCommand} from "./components/PythonCommands"



const Root = () => (
  <div>
    <SearchField />
    <Box height="20px">
    </Box>
      <NovelCard 
        title = {"Test"}
        source = {"URL example.com aaaaaaaaaaaaand it is realy looooooooooooooooooooooooooooong"}
        chapters = {12}
      />
      <NovelCard 
        title = {"Test"}
        source = {"URL example.com aaaaaaaaaaaaand it is realy looooooooooooooooooooooooooooong"}
        chapters = {12}
      />
      <Button onClick={quitCommand}>
        Cancel
      </Button>

      
  </div>
);


const config = {
    useSystemColorMode: false,
    initialColorMode: "dark",
  }
  // 3. extend the theme
  const customTheme = extendTheme({ config })

ReactDOM.render(
  <ChakraProvider theme={customTheme}>
    <Root />
  </ChakraProvider>,
  document.getElementById("root")
);

console.log(
  '👋 This message is being logged by "renderer.js", included via webpack'
);

