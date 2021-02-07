import { ChevronDownIcon } from "@chakra-ui/icons";
import { FaFolderOpen } from "react-icons/fa";
import {
  Collapse,
  Grid,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
  Button,
  FormControl,
  FormLabel,
  Switch,
  InputGroup,
  IconButton,
  InputRightElement,
  Text,
  Icon,
  GridItem,
} from "@chakra-ui/react";

import { OpenDialogReturnValue } from "electron";

import React, { useCallback, useEffect, useState } from "react";
const electron = window.require("electron");
const { remote } = electron;
const dialog = remote.dialog;

export interface DownloadOptions {
  rangeOption: RangeOption;
  outputFormats: string[];
  outputPath: FolderPathOption;
  openFolder: boolean;
}

type DownloadProps = {
  defaultOptions?: DownloadOptions;
  onOptionChange?: (options: DownloadOptions) => void;
};

export const DownloadOptionsGrid = ({
  defaultOptions,
  onOptionChange,
}: DownloadProps) => {
  const [downloadOptions, setDownloadOptions] = useState({} as DownloadOptions);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (defaultOptions) {
      setDownloadOptions(defaultOptions);
    }
  },[defaultOptions])

  useEffect(() => {
    setIsDirty(true);
  }, [downloadOptions]);

  useEffect(() => {
    if (isDirty && onOptionChange) {
      onOptionChange(downloadOptions);
      setIsDirty(false);
    }
  }, [downloadOptions, isDirty, onOptionChange]);

  return (
    <Grid
      templateColumns="repeat(2, minmax(100px, 1fr))"
      gap={2}
      marginTop="10px"
      padding="5px"
    >
      <GridItem>
        <ChapterRangeOption
          onChange={(option) => {
            setDownloadOptions((prev) => ({ ...prev, rangeOption: option }));
          }}
          defaultOptions={downloadOptions.rangeOption}
        />
        <OutputFormatOption
          defaultValue={downloadOptions.outputFormats}
          onChange={(formats) => {
            setDownloadOptions((prev) => ({ ...prev, outputFormats: formats }));
          }}
        />
      </GridItem>
      <GridItem>
        <FolderPathOptions
          onChange={(path) => {
            setDownloadOptions((prev) => ({ ...prev, outputPath: path }));
          }}
          defaultValue={downloadOptions.outputPath}
        />
        <FolderOpenOption
          onChange={(open) => {
            setDownloadOptions((prev) => ({ ...prev, openFolder: open }));
          }}
          defaultValue={downloadOptions.openFolder}
        />
      </GridItem>
    </Grid>
  );
};

enum RangeType {
  All = "1",
  Chapters = "2",
  Volumes = "3",
}

type RangeOption = {
  radio: RangeType;
  input: string;
};
const ChapterRangeOption = (props: {
  defaultOptions?: RangeOption;
  onChange?: (option: RangeOption) => void;
}) => {
  const [value, setValue] = useState("1" as RangeType);
  const [volValue, setVolValue] = useState("");
  const [chaValue, setChaValue] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  const [rangeOption, setRangeOption] = useState({} as RangeOption);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (hasLoaded) return;
    if (props.defaultOptions) {
      setValue(props.defaultOptions.radio);
      if (props.defaultOptions.radio === "2") {
        setChaValue(props.defaultOptions.input);
      } else if (props.defaultOptions.radio === "3") {
        setVolValue(props.defaultOptions.input);
      }
    }

    setHasLoaded(true);
  }, [hasLoaded, props.defaultOptions]);

  useEffect(() => {
    if (isDirty && props.onChange) {
      props.onChange(rangeOption);
      setIsDirty(false);
    }
  }, [isDirty, props, rangeOption]);

  useEffect(() => {
    const ro = {} as RangeOption;
    ro.radio = value;
    ro.input = "";
    if (value === "2") {
      ro.input = chaValue;
    } else if (value === "3") {
      ro.input = volValue;
    }
    setRangeOption(ro);
    setIsDirty(true);
  }, [chaValue, value, volValue]);

  return (
    <Stack>
      <Text>Select download range</Text>
      <RadioGroup
        onChange={(v) => setValue(v.toString() as RangeType)}
        value={value}
      >
        <Stack direction="column">
          <Radio value="1">All</Radio>
          <Radio value="2">Chapters</Radio>
          <Collapse in={value === "2"} animateOpacity>
            <Input
              size="xs"
              placeholder="For example 1,5-12"
              onChange={(v) => setChaValue(v.target.value)}
            />
          </Collapse>
          <Radio value="3">Volumes</Radio>
          <Collapse in={value === "3"} animateOpacity>
            <Input
              size="xs"
              placeholder="For example 1,5-12"
              onChange={(v) => setVolValue(v.target.value)}
            />
          </Collapse>
        </Stack>
      </RadioGroup>
    </Stack>
  );
};

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
            defaultValue={["epub"]}
            type="checkbox"
            onChange={(v) => {
              if (Array.isArray(v)) setFormat(v);
              else setFormat([v]);
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

const options: Electron.OpenDialogOptions = {
  properties: ["openDirectory"],
};

type FolderPathOption = {
  path?: string,
  useCustomPath?: boolean
}

const FolderPathOptions = (props: {defaultValue?: FolderPathOption, onChange?: (option: FolderPathOption) => void }) => {
  const [filePath, setFilePath] = useState("");
  const [useCustomPath, setUseCustomPath] = useState(false);

  const [isDirty, setIsDirty] = useState(false);

  const open = () => {
    dialog.showOpenDialog(options).then((result: OpenDialogReturnValue) => {
      setFilePath(result.filePaths[0]);
    });
  };

  useEffect(() => {
    if (props.defaultValue) {
      if (props.defaultValue.path)
        setFilePath(props.defaultValue.path);
      if (props.defaultValue.useCustomPath)
        setUseCustomPath(props.defaultValue.useCustomPath)
    }
  },[props.defaultValue])

  useEffect(() => {
    setIsDirty(true);
  }, [filePath, useCustomPath]);

  useEffect(() => {
    if (isDirty && props.onChange) {
      props.onChange({path:filePath, useCustomPath:useCustomPath});
      setIsDirty(false);
    }
  }, [filePath, isDirty, props, useCustomPath]);

  return (
    <Stack>
      <Text>Select output folder</Text>
      <FormControl display="flex" alignItems="center">
        <FormLabel htmlFor="select-folder" mb="0" w="100%">
          Use custom path?
        </FormLabel>
        <Switch
          id="select-folder"
          isChecked={useCustomPath}
          onChange={() => setUseCustomPath(!useCustomPath)}
        />
      </FormControl>
      <InputGroup>
        <Input
          isDisabled={!useCustomPath}
          value={filePath}
          onChange={() => console.log(filePath)}
          size="sm"
          paddingRight="2.2rem"
          paddingLeft="0.4rem"
        />
        <InputRightElement
          w="none"
          h="none"
          children={
            <IconButton
              size="sm"
              isDisabled={!useCustomPath}
              onClick={open}
              aria-label="Select folder"
              icon={<Icon as={FaFolderOpen} bg="none" />}
            />
          }
        />
      </InputGroup>
    </Stack>
  );
};

const FolderOpenOption = (props: {defaultValue?: boolean, onChange?: (value: boolean) => void }) => {
  const [value, setValue] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (props.defaultValue) {
      setValue(props.defaultValue);
    }
  },[props.defaultValue])

  useEffect(() => {
    setIsDirty(true);
  }, [value]);

  useEffect(() => {
    if (isDirty && props.onChange) {
      props.onChange(value);
      setIsDirty(false);
    }
  }, [isDirty, props, value]);

  return (
    <FormControl display="flex" alignItems="center">
      <FormLabel htmlFor="open-folder" mb="0" w="100%">
        Open folder on finish?
      </FormLabel>
      <Switch
        id="open-folder"
        isChecked={value}
        onChange={() => setValue(!value)}
      />
    </FormControl>
  );
};
