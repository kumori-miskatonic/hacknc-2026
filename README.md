# Project Name
Project name is a web chat app that gives users the ability to keep their information anonymous while talking to other users.

## Table of Contents
* [About the Project](#about-the-project)
* [Key Features](#key-features)
* [Prerequisites](prerequisites)
* [Installation](installation)

## About the Project
The inspiration for Project Name was the need for a chat app that allows you to talk to others without the need to give them your daily contact information. Using encryption, it blocks unwanted chats from unknown users.
## Key Features
- Create an account store securely through Firebase Authentication
- Chat with another user without exchanging contact info
- Send encrypted messages through the web
- View past chats and message history 

## Prerequisites
- Install NPM
- Connect to internet
## Installation
To clone this repo, 
1. Navigate to your desired file
2. `git clone <URL>`
3. `npm install` to install all required node packages
4. Create a .env.local file with your Firebase config info. Put it in the following form:

```VITE_FIREBASE_API_KEY=<key>
VITE_FIREBASE_AUTH_DOMAIN=<domain>
VITE_FIREBASE_PROJECT_ID=<id>
VITE_FIREBASE_STORAGE_BUCKET=<bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<id>
VITE_FIREBASE_APP_ID=<id>
