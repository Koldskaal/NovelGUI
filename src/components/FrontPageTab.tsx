import { Tabs, TabList, Tab, TabPanels, TabPanel, VStack } from "@chakra-ui/react";
import React from "react";
import { ResultBox } from ".";
import { NovelDataContextProvider } from "./AppData";
import { BottomIconBar } from "./BottomIconBar/BottomIconBar";
import { ViewManager } from "./modules/ViewManager";
import { SearchField } from "./SeachField";

export const FrontPage = () => {
  return (
    <Tabs isFitted>
      <TabList>
        <Tab>Get novels</Tab>
        <Tab>Favorites</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
        <VStack paddingLeft="20px" paddingRight="20px" justifyContent="center" minH="50%">
      <NovelDataContextProvider>
      <SearchField onSearchStart={() => ViewManager.broadcast("search", {})}/>
      </NovelDataContextProvider>
      <NovelDataContextProvider>
        <ResultBox />
      </NovelDataContextProvider>
      
      
    </VStack>
        </TabPanel>
        <TabPanel>
          <Favorites />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

const Favorites = () => {
    // 1. get the saved favorites
    // 2. show them
    // 3. click to download

    return (
        <p>two!</p> 
    )
}
