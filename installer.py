import subprocess
import sys

def install(package):
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-U", package])

if __name__ == "__main__":
    arg = sys.argv[1]

    install(arg)