import "./index.css";
import React,{useEffect, useState} from "react";
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
  Text,
  Spacer
} from "@chakra-ui/react";
import { NovelCard, SearchField } from "./components";
import { NovelResult, ResultBox, ResultBoxState } from "./components/ResultBox"
import {BottomIconBar, TaskManager} from "./components/TaskManager"
import { Fonts } from "./fonts"

const Root = () => {
  const [currentData, setData] = useState([] as NovelResult[])
  const [resultState, setResultState] = useState(ResultBoxState.SelectNovel)

  const updateData = (results: NovelResult[]) => {
    setData(results);
  }


  return (
    <VStack paddingLeft="20px" paddingRight="20px">
      <SearchField onDataChange={updateData} onSearchStart={() => setResultState(ResultBoxState.SelectNovel)} />
      <ResultBox results={currentData} state={resultState}/>
      <BottomIconBar />
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
  },
  fonts: {
    heading: "Open Sans",
    body: "Raleway",
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
