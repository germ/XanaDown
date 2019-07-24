all: client server

client:
	mkdir -p deploy
	cd xanadown-client; yarn build
	mv xanadown-client/build deploy/static

server:
	mkdir -p deploy
	cd xanadown-server; go build
	mv xanadown-server/xanadown-server deploy/
	mkdir -p deploy/docs

clean:
	rm -rf deploy/
