import {
  Collapse,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

enum RangeType {
  All = "1",
  Chapters = "2",
  Volumes = "3"
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

  const validateInput = (input: string) => {
    console.log(input.replace(/[^0-9,-]/g, ""));
    return input.replace(/[^0-9,-]/g, "");
  }

  useEffect(() => {
    if (hasLoaded)
      return;
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
              value={chaValue}
              size="xs"
              placeholder="For example 1,5-12"
              onChange={(v) => setChaValue(validateInput(v.target.value))} />
          </Collapse>
          <Radio value="3">Volumes</Radio>
          <Collapse in={value === "3"} animateOpacity>
            <Input
              value={volValue}
              size="xs"
              placeholder="For example 1,5-12"
              onChange={(v) => setVolValue(validateInput(v.target.value))} />
          </Collapse>
        </Stack>
      </RadioGroup>
    </Stack>
  );
};

export { ChapterRangeOption, RangeOption, RangeType }