# Glyphx dashboard  testing

## Build Dashboard Image
    cd dashboard
    docker build -t <imageName> .

## Run Docker Development Image
    docker run -it --rm -v ${PWD}:/usr/app -v /usr/app/node_modules -p 3000:3000 -e CHOKIDAR_USEPOLLING=true <imageName>

Note: "imagename" string must be consistent across both commands