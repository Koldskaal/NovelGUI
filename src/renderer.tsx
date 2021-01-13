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
  Text
} from "@chakra-ui/react";
import { NovelCard, SearchField } from "./components";
import { NovelResult, ResultBox, ResultBoxState } from "./components/ResultBox"

const Root = () => {
  const [currentData, setData] = useState([] as NovelResult[])
  const [ongoing, setOngoing] = useState(false)
  const [resultState, setResultState] = useState(ResultBoxState.SelectNovel)

  const updateData = (results: NovelResult[]) => {
    if (!ongoing) {
      setOngoing(true);
    }
    setData(results);
  }

  useEffect(() => {
    if (ongoing) {
      setResultState(ResultBoxState.SelectNovel);
    }
  },[ongoing])

  return (
    <VStack paddingLeft="20px" paddingRight="20px">
      <SearchField onDataChange={updateData} onSearchEnd={() => setOngoing(false)} />
      <ResultBox results={currentData} state={resultState}/>
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
