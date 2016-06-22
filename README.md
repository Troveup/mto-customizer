
# MTO Customizer

Made To Order (MTO) jewelry pieces are composed of 1 or more charms that are connected at
pre-defined joints and attached to a necklace chain.

# Running

Use an npm script to trigger the webpack-dev-server process which automatically watches for
file changes and rebuilds the js bundle. You can see the output on your development server
on port 8080.

    npm run start

The dev server doesn't write the generated bundle to disk but serves it from memory directly,
if you need distributable for use in another project you can generate it with the command:

    webpack

which will place it at `build/MTO.js`.

Convenience one-liner:

    webpack && cp build/MTO.js ../troveweb/src/main/webapp/WEB-INF/resources/js/MTO.js
