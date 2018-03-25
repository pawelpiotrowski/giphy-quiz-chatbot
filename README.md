# giphy-quiz-chatbot


### Installing Node and stuff

Install node via [Node Version Manager](https://github.com/creationix/nvm) and check your installation by running:

        node -v

It should output node.js version ex. ` v8.1.3 `

The node installation comes with the [node package manager](https://npmjs.org), which we will use to install our development dependencies.

Minimum node version required is ` v7.6 `


### App Installation

To install dependencies:

        npm install

For development please see below for additional instruction before installation.

### App configuration file

App configuration is located in ` config.json ` file:

` "http_port" ` port on which app API will be available using http protocol

### Running App

To start a server run:

        npm start

### Setting up chatbot profile

Setup get started postback payload:

        curl -X POST -H "Content-Type: application/json" -d '{"get_started": {"payload": "get_started_hook"}}' "https://graph.facebook.com/v2.12/me/messenger_profile?access_token=<PAGE_TOKEN>"

Setup welcome screen:

        curl -X POST -H "Content-Type: application/json" -d '{"greeting":[{"locale":"default","text":"<GREETINGS COPY>"}]}' "https://graph.facebook.com/v2.12/me/messenger_profile?access_token=<PAGE_TOKEN>"

Check setting greeting:

        curl -X GET "https://graph.facebook.com/v2.12/me/messenger_profile?fields=greeting&access_token=<PAGE_TOKEN>"

Upload asset to reuse it in conversation:

        curl -X POST -H "Content-Type: application/json" -d '{"message":{"attachment":{"type":"image", "payload":{"is_reusable": true,"url":"https://url.to/asset.type"}}}}' "https://graph.facebook.com/v2.6/me/message_attachments?access_token=<PAGE_TOKEN>"

Note, te response that's your asset id to reuse

        {"attachment_id":"123456789"}