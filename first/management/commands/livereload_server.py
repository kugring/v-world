from livereload import Server

server = Server()

# 감시할 파일 및 폴더 지정
server.watch("templates/*.html")
server.watch("static/**/*.css")
server.watch("static/**/*.js")

# LiveReload 서버 실행
server.serve(port=5500, host="127.0.0.1")


# python livereload_server.py

# source venv/Scripts/activate
