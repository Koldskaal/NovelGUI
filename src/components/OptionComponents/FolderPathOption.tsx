import { FaFolderOpen } from "react-icons/fa";
import {
  Input,
  Stack,
  FormControl,
  FormLabel,
  Switch,
  InputGroup,
  IconButton,
  InputRightElement,
  Text,
  Icon,
} from "@chakra-ui/react";
import { OpenDialogReturnValue } from "electron";
import React, { useEffect, useState } from "react";
const electron = window.require("electron");
const { remote } = electron;
const dialog = remote.dialog;

const options: Electron.OpenDialogOptions = {
  properties: ["openDirectory"],
};

type PathOption = {
  path?: string;
  useCustomPath?: boolean;
};
const FolderPathOption = (props: {
  defaultValue?: PathOption;
  onChange?: (option: PathOption) => void;
  title?: string;
}) => {
  const [filePath, setFilePath] = useState("");
  const [useCustomPath, setUseCustomPath] = useState(false);

  const [isDirty, setIsDirty] = useState(false);

  const UpdatePath = (path: string) => {
    setFilePath(path);
    setIsDirty(true);
  };

  const UpdateSwitchState = (isToggled: boolean) => {
    setUseCustomPath(isToggled);
    setIsDirty(true);
  };

  useEffect(() => {
    if (props.defaultValue) {
      if (props.defaultValue.path)
        setFilePath(props.defaultValue.path);
      if (props.defaultValue.useCustomPath)
        setUseCustomPath(props.defaultValue.useCustomPath);
    }
  }, [props.defaultValue]);

  useEffect(() => {
    if (isDirty && props.onChange) {
      props.onChange({ path: filePath, useCustomPath: useCustomPath });
      setIsDirty(false);
    }
  }, [filePath, isDirty, props, useCustomPath]);

  return (
    <Stack>
      <Text>{props.title ? props.title : "Select output folder"}</Text>
      <FormControl display="flex" alignItems="center">
        <FormLabel htmlFor="select-folder" mb="0" w="100%">
          Use custom path?
        </FormLabel>
        <Switch
          id="select-folder"
          isChecked={useCustomPath}
          onChange={() => UpdateSwitchState(!useCustomPath)}
        />
      </FormControl>
      <FolderPathInputPrompt
          defaultValue={filePath}
          isDisabled={!useCustomPath}
          onChange={UpdatePath}
        />
    </Stack>
  );
};

const FolderPathInputPrompt = (props: {
  defaultValue?: string;
  isDisabled?: boolean;
  onChange?: (path: string) => void;
}) => {
  const [filePath, setFilePath] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (props.defaultValue) {
      setFilePath(props.defaultValue);
    }
  }, [props.defaultValue]);

  useEffect(() => {
    setIsDirty(true);
  }, [filePath]);

  useEffect(() => {
    if (isDirty && props.onChange) {
      props.onChange(filePath);
      setIsDirty(false);
    }
  }, [filePath, isDirty, props]);

  const open = () => {
    dialog.showOpenDialog(options).then((result: OpenDialogReturnValue) => {
      setFilePath(result.filePaths[0]);
    });
  };

  return (
    <InputGroup>
      <Input
        isDisabled={props.isDisabled ? props.isDisabled : false}
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
            isDisabled={props.isDisabled ? props.isDisabled : false}
            onClick={open}
            aria-label="Select folder"
            icon={<Icon as={FaFolderOpen} bg="none" />}
          />
        }
      />
    </InputGroup>
  );
};

export { PathOption, FolderPathOption, FolderPathInputPrompt };
