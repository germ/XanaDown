all: client server

client:
	mkdir deploy
	cd xanadown-client
	yarn build
	mv build ../deploy
	cd ..

server:
	mkdir deploy
	cd xanadown-server
	go build
	mv xanadown-server ../deploy
	cd ..

clean:
	rm -rf deploy/
