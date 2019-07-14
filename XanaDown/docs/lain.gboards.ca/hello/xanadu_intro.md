# Testing!

# What is Xanadu?
A strange way of serving documents and browsing. The brainchild of [Ted Nelson](https://en.wikipedia.org/wiki/Ted_Nelson). Xanadu allows for composing documents by inlining content, adding in place context to existing documents and making revisions accessible. There's a bunch of stuff going on, but XanaDown is only a small part of the network envisioned by Ted. 

# Why Markdown + Git?
Simple. It seperates presentation and content easily and is simple enough for a JS parser to handle in browser. As a added bonus editing documents in a text editor is fairly easy and the markup only takes a few minutes to pick up on.

Git, is widely used and provides a decent way to version files. There are also many many user friendly frontends!

# So what exactly is Xanadown?
There a two parts a server and a client. The client lives in your browser and is what you're using right now. The client recieves raw Markdown and parses it for display/navigation making requests for needed documents to the server as they're neeeded. Xanadown Client is a fork of the [WormWood Xanadoer](http://tetramor.ph/wormwood/). If you can't tell, it's a moving target. 
 
The server is where the fun happens, it proxies all document requests and serves up raw markdown. Instead of existing implementations that compile a document and serve it, we let the client decide to make additional requests. These documents are retrieved using GitFS, and if the repo isn't stored already it is cached. Because of the way gitFS exposes data it is inherently pinned to a revision by date.

If you are worried about data privacy (as the server can in theory keep a log), spinning up a local server is fairly simple and Docker images will be provided.

# How is this different?
Rather then using flat files and EDLs we reduce it down to simple Markdown. A EDL is just a markdown file that inlines stuff, document compilation is handled in browser, and the document hosting is not centralized! It also allows for multiple clients to be easily constructed giving multiple ways to interpret documents, something that the current web cannot do! Want a 3d view of documents? Whack some WebGL at it and giv'r!

# Why?
The internet is increasingly hostile and centralized. Publishing documents is hard and the IndieWeb needs to be looked for. Rather then relying on Medium or the blogging platform de jour, get freaky with it. Also allows for some crazy responses to existing articles and linking/inlining!

For the longest time Xanadu wasn't able to come into being as the software and setup was obtuse. The goal here is to provide a simple way to both host a server or create a client, that and build a connected web of context!

# Your site looks like ass and I want to help
Thanks for noticing! Whack some PRs/Issues/Comments at the repo on [GitHub](https://github.com/germ/XanaDown)
