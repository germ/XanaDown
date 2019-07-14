Wormwood: A Xandadu EDL viewer/server

This is a fork of [wormwood](gitlab.com/krampus/wormwood) with the intention of cleaning up some stuff.

# Installation

- cd to the installation dir
- build the resources  ( $ bower install )
- install perl modules ( $ perl cpanm --installdeps . )
- Start a cgi compatible web server ( $ python -m http.server --cgi 8000 )

Open up localhost and you should be good to go! Take a look at static/doc and the example linked to get started writing your own EDL.

# Namespacing
Documents can be hosted either as part of this package or externally over the internet. In the case of local storage you should adopt a format of a 
folder for every xanadoc and a per site container folder. This way, docs can be pulled in without merge conflicts.

i.e.) static/lain.gboards.ca/helloworld/helloworld.xan.org

A good place to host documents is on Github or the internet archive. If you write some xanadocs, please let me know so I can add them to the gallery!

# Todo
- Add instructions for Apache
- Add in client themeability
- Option to span webpages
- Add configuration for default to render and provide a editor page
- Do 'proper' two way links using permanent immutable storage in a decentralized way
- Find a way to add in caching for network requests, so we don't have to wait long on document retrieval
- Move from cgi to a proper Go server if possible
- Report 404s more gracefully!
