import os
from lncrawl.core.novel_info import format_novel
from lncrawl.core.app import App
from lncrawl.core.novel_search import get_search_result, process_results
from lncrawl.sources import rejected_sources, crawler_list
from lncrawl.assets import icons
from lncrawl.binders import available_formats

from urllib.parse import urlparse
import sys, json, logging

from concurrent import futures

import shutil

from slugify import slugify

output_path = ""
command = ""

def get_range_from_list(list, input):
    ranges = input.split(",")
    chapters = []
    for range in ranges:
        try:
            if ("-" in range):
                s = range.split("-")
                chapters.append(list[s[0]:(s[1] + 1)])
            else:
                chapters.append(list[range])
        except:
            continue

    return chapters


def process_chapter_range(app: App, selection, input):
    chapters = []
    if selection == '1': # All
        chapters = app.crawler.chapters[:]
    elif selection == '2': # Chapters
        chapters = get_range_from_list(app.crawler.chapters, input)
    elif selection == '3': # Volumes
        chapters = get_range_from_list(app.crawler.volumes, input)
    # end if

    if len(chapters) == 0:
        raise Exception('No chapters to download')
    # end if
    return chapters

def generate_output_path(app: App, override_path="", force_replace_old=True):
    if not app.good_file_name:
        app.good_file_name = slugify(
            app.crawler.novel_title,
            max_length=50,
            separator=' ',
            lowercase=False,
            word_boundary=True,
        )
    # end if

    source_name = slugify(urlparse(app.crawler.home_url).netloc)

    output_path = os.path.join(
        'Lightnovels', source_name, app.good_file_name)

    if len(override_path) > 0:
        output_path = os.path.join(override_path, app.good_file_name)

    output_path = os.path.abspath(output_path)
    if os.path.exists(output_path):
        if force_replace_old:
            shutil.rmtree(output_path, ignore_errors=True)
        # end if
    # end if
    os.makedirs(output_path, exist_ok=True)

    app.output_path = output_path

def send_message(status_code, message, data={}, progress=0):
    standard_msg = {
        "status": status_code,
        "task": {
            "name" : command,
            "progress": progress,
            "details": message,
        },
    }

    if data:
        standard_msg["data"] = data

    print(json.dumps(standard_msg))

def verify_payload(payload, required_key, raise_exception=True):
    if required_key not in payload:
        if raise_exception:
            raise Exception(f"The data of: {required_key} is required to run this command.")
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

    novels = {}
    give_output = True
    # Resolve future tasks
    progress = 0
    combined_results = []
    for future in futures.as_completed(futures_to_check):
        combined_results += future.result()
        progress += 1
        novels["novels"] = process_results(combined_results)
        send_message("OK", f"Search sites: {progress}/{amountToCheck}.", data=novels, progress=(progress / amountToCheck) * 100)
        if give_output:
            i = input()
            if "quit" in json.loads(i):
                print(json.dumps({"status": "CANCELLED"}))
                executor.shutdown(wait=False, cancel_futures=True)
                sys.exit(0)

    executor.shutdown()

    send_message("OK", "Search is finished", novels, progress=100)

def search(app, payload):
    if not verify_payload(payload, "query"):
        return
    send_message("OK", "Initializing search!")
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

def get_novel_info(app: App, payload, send_progress=True, enable_login=False):
    if not verify_payload(payload, "url"):
        return

    if send_progress:
        send_message("OK", "Initializing crawler", progress=10)

    try:
        app.init_crawler(payload["url"])
    except:
        send_message("ERROR", "No crawler was found.", data={"url": payload["url"]})
        return
    app.crawler.initialize()

    # Handle login later!
    if enable_login and app.can_do('login') and app.login_data:
            app.crawler.login(*app.login_data)

    if send_progress:
        send_message("OK", "Gathering info", progress=50)

    app.crawler.read_novel_info()

    novel_info = {
        "url": payload["url"],
        "hostname": urlparse(payload["url"]).hostname,
        "title": app.crawler.novel_title,
        "author": app.crawler.novel_author,
        'cover': app.crawler.novel_cover,
        "volumes": len(app.crawler.volumes),
        "chapters": len(app.crawler.chapters)
    }

    format_novel(app.crawler)

    if send_progress:
        send_message("OK", "Sending info", data=novel_info, progress=100)

    return novel_info

def download_novel(app: App, payload):
    verify_payload(payload, "options")
    options = payload["options"]

    get_novel_info(app, payload, False)
    
    generate_output_path(app, options["outputPath"])

    app.chapters = process_chapter_range(app, options["rangeOption"]["radio"], options["rangeOption"]["input"])

    app.output_formats = {x: (x in options["outputFormats"]) for x in available_formats} 
    app.start_download()
    app.bind_books()
    app.compress_books()

    app.destroy()

    if options["openFolder"]:
        if icons.Icons.isWindows:
            import subprocess
            subprocess.Popen('explorer /select,"' + app.output_path + '"')
        else:
            import pathlib
            import webbrowser
            url = pathlib.Path(app.output_path).as_uri()
            webbrowser.open_new(url)

    # Force replace old option
    
    

COMMANDS = {
    "search": search,
    "get_novel_info": get_novel_info,
    "download_novel": download_novel,
}

if __name__ == "__main__":
    app = App()
    app.initialize()

    arg = json.loads(sys.argv[1])

    if "command" not in arg:
        send_message("ERROR", "No command was specified")
        sys.exit(1)
    
    command = arg["command"]

    if "data" not in arg:
        send_message("ERROR", "No data was given")
        sys.exit(1)

    data = arg["data"]

    if command in COMMANDS.keys():
        try:
            COMMANDS[command](app, data)
        except Exception as e:
            send_message("ERROR", "Failed with: " +str(e))
    else:
        send_message("ERROR", f"{command} is not a valid command")


