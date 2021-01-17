from lncrawl.core.app import App
from lncrawl.core.novel_search import get_search_result, process_results
from lncrawl.sources import rejected_sources, crawler_list

from urllib.parse import urlparse
import sys, json, logging

from concurrent import futures

import time

output_path = ""


def start_crawl(novel_url, args):

    app.init_crawler(novel_url)

    if "output_path" not in args:
        return

    app.output_path = args["output_path"] if "output_path" in args else output_path
    app.chapters = self.process_chapter_range()

    app.output_formats = self.get_output_formats()
    app.pack_by_volume = self.should_pack_by_volume()

        # self.app.start_download()
        # self.app.bind_books()
        # self.app.compress_books()

        # self.app.destroy()
        # display.app_complete()

        # if self.open_folder():
        #     if Icons.isWindows:
        #         import subprocess
        #         subprocess.Popen('explorer /select,"' + self.app.output_path + '"')
        #     else:
        #         import pathlib
        #         import webbrowser
        #         url = pathlib.Path(self.app.output_path).as_uri()
        #         webbrowser.open_new(url)
            # end if
        # end def

    # def get_novel_url(self):
    #     if self.args.query == "":
    #         return self.args.query

    #     url = self.args.novel_page
    #     if url:
    #         if re.match(r'^https?://.+\..+$', url):
    #             return url
    #         else:
    #             raise Exception('Invalid URL of novel page')

    

def send_message(status_code, message):
    message = {
        "status": status_code,
        "message": message
    }
    print(json.dumps(message))

def verify_payload(payload, required_key):
    if required_key not in payload:
        send_message("ERROR", f"The data of: {required_key} is required to run this command.")
        return False
    
    return True

def custom_search_novels(app):
    executor = futures.ThreadPoolExecutor(10)

    # Add future tasks
    checked = {}
    futures_to_check = {}
    for link in app.crawler_links:
        crawler = crawler_list[link]
        if crawler in checked:
            continue
        # end if
        checked[crawler] = True
        futures_to_check[
            executor.submit(
                get_search_result,
                app.user_input,
                link
            )
        ] = str(crawler)
    # end for

    amountToCheck = len(futures_to_check.keys())

    payload = {
        "status": "ONGOING",
        "task": "search",
        "task_detail": "",
        "novels": {}
    }
    give_output = True
    # Resolve future tasks
    progress = 0
    combined_results = []
    for future in futures.as_completed(futures_to_check):
        combined_results += future.result()
        progress += 1
        payload["progress"] = (progress / amountToCheck) * 100
        payload["task_detail"] = f"Search sites: {progress}/{amountToCheck}."
        payload["novels"] = process_results(combined_results)
        print(json.dumps(payload))
        if give_output:
            i = input()
            if "quit" in json.loads(i):
                print(json.dumps({"status": "CANCELLED"}))
                executor.shutdown(wait=False, cancel_futures=True)
                sys.exit(0)

    executor.shutdown()

    print(json.dumps(payload))
# end def

def search(app, payload):
    if not verify_payload(payload, "query"):
        return
    send_message("ONGOING", "started serach!")
    app.user_input = payload["query"]

    try:
        app.init_search()
    except Exception:
        if app.user_input.startswith('http'):
            url = urlparse(app.user_input)
            url = '%s://%s/' % (url.scheme, url.hostname)
            if url in rejected_sources:
                send_message("FAILED", f"This site is not suppoted because: {rejected_sources[url]}")
                return
            # end if
        # end if
        send_message("FAILED", f"This website is not recognized.")
        return
    # end if

    # Search novel and initialize crawler
    if not app.crawler:
        custom_search_novels(app)

    


COMMANDS = {
    "search": search,
}

if __name__ == "__main__":
    app = App()
    app.initialize()

    data = json.loads(sys.argv[1])

    if "command" not in data:
        send_message("ERROR", "No command was specified.")
        sys.exit(1)

    if "data" not in data:
        send_message("ERROR", "No data was given.")
        sys.exit(1)

    if data["command"] in COMMANDS.keys():
        COMMANDS[data["command"]](app, data["data"])

    print(json.dumps(data))

    counter = 0


