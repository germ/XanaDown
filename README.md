# Xanadown
Manifesting XanaSpace via Markdown

# Installation/Build
Prerequisites: yarn, npm, gitfs

`
git clone https://github.com/germ/XanaDown.git
cd XanaDown
make
`

If everything goes well a folder named deploy will be generated. Run xanadoc-server and you're good to do. Alternatively you 
can just push the frontend and configure the endpoint to existing server. 

# Namespacing/Versioning
XanaDocs require versioning, without it transclusion doesn't work. For this we use gitfs and dynamically pull in repos as needed
to serve content and revision. The fuse mount point by default is docs/. See the gitfs for syncing tuning, as of now pushing is not
handled by the server. 

for example germ/x is mounted at docs/github.com/germ/x

# Todo
- Add a few themes
- Option to span webpages
- Add configuration for default to render and provide a editor page
- Last access time for pruning of unused docs

This is a rework of [wormwood](gitlab.com/krampus/wormwood) with the goal of simplifying many aspects and providing a working implementation. As such, the 'XanaDown' folder is provided for reference until a working prototype is complete

Shout out to Ted, you crazy bastard.
