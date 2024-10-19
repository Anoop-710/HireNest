#!/usr/bin/env bash
# Install Chrome dependencies for Puppeteer
sudo apt-get update
sudo apt-get install -y wget gnupg --no-install-recommends
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
sudo apt-get update
sudo apt-get install -y google-chrome-stable --no-install-recommends
