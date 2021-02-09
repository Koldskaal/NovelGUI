import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Stack,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
  Button,
  Text
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

const OutputFormatOption = (props: {
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
}) => {
  const [format, setFormat] = useState(["epub"]);
  const [buttonText, setButtonText] = useState("");

  const [isDirty, setIsDirty] = useState(false);
  const [isDefDirty, setIsDefDirty] = useState(true);

  useEffect(() => {
    if (isDefDirty && props.defaultValue) {
      setFormat(props.defaultValue);
      setIsDefDirty(false);
    }
  }, [isDefDirty, props.defaultValue]);

  useEffect(() => {
    if (isDirty && props.onChange) {
      props.onChange(format);
      setIsDirty(false);
    }
  }, [format, isDirty, props]);

  useEffect(() => {
    setIsDirty(true);
  }, [format]);

  useEffect(() => {
    let text = "None";
    format.map((f, index) => {
      if (index === 0) {
        text = f;
      } else {
        text += ", " + f;
      }
    });

    setButtonText(text);
  }, [format]);

  return (
    <Stack marginTop="5px" marginRight="5px">
      <Text>Select output format</Text>
      <Menu closeOnSelect={false}>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
          <Text isTruncated maxW="130px" textAlign="start">
            {buttonText}
          </Text>
        </MenuButton>
        <MenuList minWidth="240px" maxH="150px" overflowY="scroll">
          <MenuOptionGroup
            defaultValue={format}
            type="checkbox"
            onChange={(v) => {
              if (Array.isArray(v))
                setFormat(v);
              else
                setFormat([v]);
            }}
          >
            {availableFormats.map((format, index) => {
              return (
                <MenuItemOption key={index} value={format}>
                  {format}
                </MenuItemOption>
              );
            })}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
    </Stack>
  );
};
const availableFormats = [
  "epub",
  "mobi",
  "json",
  "text",
  "pdf",
  "web",
  "docx",
  "rtf",
  "txt",
  "azw3",
  "fb2",
  "lit",
  "lrf",
  "oeb",
  "pdb",
  "rb",
  "snb",
  "tcr",
];

export { OutputFormatOption };