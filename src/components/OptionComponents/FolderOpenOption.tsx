import {
  FormControl,
  FormLabel,
  Switch
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

const FolderOpenOption = (props: { defaultValue?: boolean; onChange?: (value: boolean) => void; }) => {
  const [value, setValue] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (props.defaultValue) {
      setValue(props.defaultValue);
    }
  }, [props.defaultValue]);

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
        onChange={() => setValue(!value)} />
    </FormControl>
  );
};

export { FolderOpenOption };