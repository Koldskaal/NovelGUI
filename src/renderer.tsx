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
import { SearchField, ResultBox } from "./components";
import { BottomIconBar } from "./components/BottomIconBar/BottomIconBar";
import { Fonts } from "./fonts"
import {NovelDataContextProvider, NovelResult} from "./components/AppData"
import { ViewManager } from "./components/modules/ViewManager"

const Root = () => {


  return (
    <VStack paddingLeft="20px" paddingRight="20px" justifyContent="center" minH="50%">
      <NovelDataContextProvider>
      <SearchField onSearchStart={() => ViewManager.broadcast("search", {})}/>
      </NovelDataContextProvider>
      <NovelDataContextProvider>
        <ResultBox />
      </NovelDataContextProvider>
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
  justbg: {
    bg: "gray.800",
  },
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
  },
  border: {
    border: "1px solid",
    borderColor: "gray.500"
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
