1. Клонировать github-репозиторий: git clone https://github.com/salieff/salieff.github.io.git

2. Собрать docker-образ редактора: docker build -t es-index-editor-image salieff.github.io/index-editor

3. Создать сторидж аутентификации и добавить туда всех бойцов, задать им пароли:
    touch    /server/path/html/es/.htpasswd
    htpasswd /server/path/html/es/.htpasswd salieff
    htpasswd /server/path/html/es/.htpasswd m1hayl0ff
    etc...

4. Запустить docker-контейнер, примонтировав в него папку es и опубликовав порт 80:
    docker run --name es-index-editor -p 8888:80 -v /server/path/html/es:/var/www/html/es --rm es-index-editor-image

7. Открыть в браузере http://191.ru:8888/index-editor.
   Убедиться, что есть список модов и список файлов.
   Попробовать добавить мод, закоммитить, убедиться, что он появился в project2.json.
   Попробовать удалить добавленный мод, закоммитить, убедиться, что он исчез из project2.json.
   Попробовать открыть http://191.ru:8888/index-editor во второй вкладке, убедиться, что сессия лочится.
   Пользуясь редактором, начинать исправлять всё, что покрашено красным :)
