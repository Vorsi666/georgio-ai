#!/usr/bin/env python3
"""
Simple script to start the Georgio AI Python agent service.
"""
import subprocess
import sys
import os

def main():
    # Change to the python-agent directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Install dependencies if needed
    print("Installing dependencies...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
    
    # Start the service
    print("Starting Georgio AI Python Agent Service...")
    print("Service will be available at http://localhost:8000")
    print("Press Ctrl+C to stop")
    
    subprocess.run([sys.executable, "src/main.py"], check=True)

if __name__ == "__main__":
    main()