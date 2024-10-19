#!/usr/bin/env bash

# Install necessary dependencies for Puppeteer (Chrome)
apt-get update
apt-get install -y wget curl gnupg ca-certificates

# Add the official Google Chrome repository key and source
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
sh -c 'echo "deb [arch=amd64] https://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'

# Install Chrome
apt-get update
apt-get install -y google-chrome-stable
