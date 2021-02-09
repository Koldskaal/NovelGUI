import { Grid, GridItem } from "@chakra-ui/react";

import React, { useEffect, useState } from "react";
import {
  OutputFormatOption,
  RangeOption,
  ChapterRangeOption,
  FolderOpenOption,
  FolderPathOption,
  PathOption,
} from "../OptionComponents";

export interface DownloadOptions {
  rangeOption: RangeOption;
  outputFormats: string[];
  folderPathOption: PathOption;
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
  }, [defaultOptions]);

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
          onChange={(formats: string[]) => {
            setDownloadOptions((prev) => ({ ...prev, outputFormats: formats }));
          }}
        />
      </GridItem>
      <GridItem>
        <FolderPathOption
          onChange={(path) => {
            setDownloadOptions((prev) => ({ ...prev, folderPathOption: path }));
          }}
          defaultValue={downloadOptions.folderPathOption}
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
