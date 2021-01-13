import { Box, Button, Progress, Slide } from "@chakra-ui/react"
import React from "react"

const TaskManager = () => {
    const isOpen = true;

    return ( <Slide direction="bottom" in={isOpen}>
          <Box p="40px" bg="teal.500" color="white"
          mt="1"
          rounded="md"
          shadow="md">
        <Button  >close</Button>
        <div><Progress value={50} size="xs" /></div>
        </Box>
        </Slide>
        )
}