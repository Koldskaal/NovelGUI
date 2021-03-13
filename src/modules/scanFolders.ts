import * as fs from 'fs';
import { glob } from "glob";

type Volume = {
    id: number,
    chapter_count: number,
    final_chapter: number,
    start_chapter: number,
    title: string
}

type Chapter = {
    title: string
    id: number,
    volume: number,
    url: string,
    volume_title: string,
}

export type MetaFile = {
    url: string,
    title: string,
    author: string,
    cover: string,
    localCover?: string,
    volumes: Volume[],
    chapters: Chapter[]
}

export async function getMetaPaths(
  src: string,
): Promise<string[]> {
  return new Promise((res, rej)=>{
    glob(src + "/**/meta.json", function(err, files){
        if(err) rej(err);
        res(files);
   });
})
}

export const readMetaFiles = function(files: string[]):MetaFile[] {
    const parsedMeta = [] as MetaFile[];
    files.forEach(path => {
        const rawData = fs.readFileSync(path, 'utf-8');
        const meta = JSON.parse(rawData) as MetaFile;
        const coverPath = path.replace("meta.json", "cover.png");
        meta.localCover = fs.existsSync(coverPath) ? coverPath : "";
        parsedMeta.push(meta);
    })

    return parsedMeta;
}

const getAndReadMetaFiles = function(src: string) {
    getMetaPaths(src).then((files) => {
      readMetaFiles(files);
    })
}

export const getCover = function(path: string): string {
  let output = "";
  const callback = (err: Error, matches: string[]) => {
    if (err) {
      console.log(err);
    }else {
      output = matches[0];
    }
  }
  glob(path + "/**/cover.png", callback);

  return output;
} 
