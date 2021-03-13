import "./index.css";
import React from "react";
import ReactDOM from "react-dom";
import {
  Box,
  extendTheme,
  ChakraProvider,
  ThemeConfig,
} from "@chakra-ui/react";
import { BottomIconBar } from "./components/BottomIconBar";
import { Fonts } from "./fonts";
import { NovelDataContextProvider } from "./components/AppData";
import { FrontPage } from "./components/FrontPageTab";
import theme from "./theme";

// const options = {
//   pythonOptions: ['-u'], // get print results in real-time
//   args: ["lightnovel-crawler"]
// };
// const pyshell = new PythonShell("./installer.py", options);

// pyshell.on("message", (m) => {console.log(m)});

const Root = () => {
  
  return (
    <Box>
      <NovelDataContextProvider />
      <FrontPage />
      <BottomIconBar />
    </Box>
  );
};



ReactDOM.render(
  <ChakraProvider  theme={theme}>
    <Root />
  </ChakraProvider>,
  document.getElementById("root")
);

console.log(
  '👋 This message is being logged by "renderer.js", included via webpack'
);
