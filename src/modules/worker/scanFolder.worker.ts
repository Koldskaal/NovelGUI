import { getMetaPaths } from "../scanFolders";

const ctx: Worker = self as any;

ctx.onmessage = async function(e) {
    const path = e.data.path;
    if (!path) return;
    const files  = await getMetaPaths(path);

    this.postMessage(files);
}

ctx.addEventListener("message", (event) => console.log(event));


export default {} as typeof Worker & (new () => Worker);
