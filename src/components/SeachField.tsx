import { Button, Input, InputGroup } from "@chakra-ui/react";
import React, { useState } from "react";

import { searchPython } from "./PythonCommands"

export const SearchField = () => {
  const [value, setValue] = useState("");
  const handleChange = (event: any) => setValue(event.target.value);

  return (
    <InputGroup>
      <Input placeholder="Basic usage" onChange={handleChange} />
      <Button
        onClick={() => {
          searchPython(value);
        }}
      >
        Search
      </Button>
    </InputGroup>
  );
};
