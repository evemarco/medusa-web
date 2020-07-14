# Medusa Web

Web frontend for the medusa project.


Copy .quasar.env.json.example to .quasar.env.json and edit this file with good parameters (API KEY, URL, SOCKET.IO SERVER, ...)

Based on the Quasar framework (vusjs used), you need nodejs (V.10 or better) and yarn

You need Medusa-WS and Medusa-Pass (socket.io server and REST API for authentification)

Install prerequired with 'yarn' command inside the directory project

You build the final files (html, javascript, css) with command 'yarn build', and you will have dist/spa directory, and you deliver it with the webserver you like (Apache, Nginx)

If you want to edit/modify the project with hotreload, the command will be 'yarn dev'

If you want to add some modules / pages / stores, you must have the quasar cli command, see <http://quasar.dev> to install it
