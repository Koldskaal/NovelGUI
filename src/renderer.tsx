import "./index.css";
import React,{useState} from "react";
import ReactDOM from "react-dom";
import {
  Divider,
  Input,
  Center,
  Box,
  Button,
  extendTheme,
  ChakraProvider,
  VStack,
  Text
} from "@chakra-ui/react";
import { NovelCard, SearchField } from "./components";
import { NovelResult, ResultBox } from "./components/ResultBox"
import { quitCommand } from "./components/PythonCommands";

const Root = () => {
  const [currentData, setData] = useState([] as NovelResult[])
  const updateData = (results: NovelResult[]) => {
    setData(results);
  }

  return (
    <VStack paddingLeft="20px" paddingRight="20px">
      <SearchField onDataChange={updateData} />
      <ResultBox results={currentData}/>
    </VStack>
  );
};
const config = {
  useSystemColorMode: false,
  initialColorMode: "dark",
  
};
// 3. extend the theme
const customTheme = extendTheme({ 
  config,
  layerStyles:{
  base: {
    bg: "gray.800",
    color: "gray.50"
  },
  selected: {
    bg: "gray.900",
    color: "white"
  }
} });

ReactDOM.render(
  <ChakraProvider theme={customTheme}>
    <Root />
  </ChakraProvider>,
  document.getElementById("root")
);

console.log(
  '👋 This message is being logged by "renderer.js", included via webpack'
);
