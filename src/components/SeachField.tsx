import { Center, Input, InputGroup, InputLeftElement, Spinner } from "@chakra-ui/react";
import React, { Fragment, useEffect, useState } from "react";

import { getInfoPython, Message, searchPython, taskManager } from "./PythonCommands";
import { SearchIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import { NovelModal } from "./ResultBox/NovelModal";
import { Novel, useNovelDataContext } from "./AppData";

type SearchProp = {
  onSearchEnd?: () => void;
  onSearchStart?: () => void;
};

export const SearchField = ({
  onSearchEnd,
  onSearchStart,
}: SearchProp): JSX.Element => {
  const [value, setValue] = useState("");
  const handleChange = (event: any) => setValue(event.target.value);
  const [inFocus, setInFocus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [currNovel, setCurrNovel] = useState({} as Novel);

  const data = useNovelDataContext();

  const geteNovelDetails = function(message: Message) {
    if (message.task.name === "get_novel_info") {
      if (typeof message.data === "undefined") {
        return;
      }
      console.log(currNovel);
      const title: string = message.data.title.toString().toLowerCase();
      setCurrNovel((novel) => ({ ...novel, title: title }));
      
    }
  }.bind(this);

  const handleClick = () => {
    taskManager.clearQueue("search", true);
    setIsLoading(true);

    if (value.startsWith("http") || value.startsWith("https")) {
      if (data[currNovel.title]) {
        setOpenModal(true);
        setIsLoading(false);
        return;
      }

      const task = getInfoPython(value);
      setCurrNovel({ url: value, title: "unknown", info: "none" } as Novel);
      

      task.subscribeToMessage(geteNovelDetails);
      // show loading or modal open
      task.subscribeToEnd(() => {
        console.log("RESLUT SHOUDL BE READY");
        setIsLoading(false);
        setOpenModal(true);
      });

      
      return;
    }

    

    const task = searchPython(value);
    task.subscribeToMessage(() => {
      task.send({}); // need to ping back to get continuous updates
    });

    task.subscribeToEnd(() => setIsLoading(false));

    if (onSearchEnd) {
      task.subscribeToEnd(onSearchEnd);
    }

    if (onSearchStart) {
      onSearchStart();
    }
  };

  const formSubmit = (event: any) => {
    handleClick();
    event.preventDefault();
  };

  return (
    <Fragment>
      <form onSubmit={formSubmit} className={"searchBar"}>
        <Center>
          <motion.div animate={{ width: inFocus ? "100%" : "50%" }}>
            <InputGroup
              spacing="10px"
              paddingTop="20px"
              minWidth="50%"
              w="100%"
            >
              <InputLeftElement
                pointerEvents="none"
                children={isLoading ? <Spinner /> : <SearchIcon color="gray.300" />}
                top="false"
              />
              <Input
                borderRadius="full"
                placeholder="Search for a novel"
                onChange={handleChange}
                onFocus={() => setInFocus(true)}
                onBlur={() => setInFocus(false)}
              />
            </InputGroup>
          </motion.div>
        </Center>
      </form>

      <NovelModal
        novel={currNovel}
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
      />
    </Fragment>
  );
};
