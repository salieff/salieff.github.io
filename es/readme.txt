1. Установить для Nginx модуль, реализущий webdav-метод LOCK. Модуль зовут nginx-dav-ext-module, как именно ставить, зависит от того, какой дистрибутив Linux.

2. Создать LOCK-мьютекс в конфиге Nginx, с таймаутом 2 часа. У меня можно сделать отдельный файлик /etc/nginx/conf.d/es-lock-zone.conf с таким содержанием:
        dav_ext_lock_zone zone=esindex:10m timeout=7200;
   лежит вот тут: https://github.com/salieff/salieff.github.io/blob/master/es/etc/nginx/conf.d/es-lock-zone.conf

3. Создать сторидж аутентификации и добавить туда всех бойцов, задать им пароли:
    touch /usr/share/nginx/html/es/.htpasswd
    htpasswd /usr/share/nginx/html/es/.htpasswd salieff
    htpasswd /usr/share/nginx/html/es/.htpasswd m1hayl0ff
    etc...

4. Создать / поправить существующий локейшн с модами, чтобы он лочился LOCK-мьютексом и аутентифицировался на PUT/LOCK/UNLOCK.
   У меня можно сделать отдельный файлик /etc/nginx/default.d/es-location.conf с таким содержанием:
        location /es/ {
            autoindex on;

            dav_access user:rw group:r all:r;
            dav_methods PUT;
            dav_ext_methods LOCK UNLOCK;
            dav_ext_lock zone=esindex;
            client_max_body_size 0;

            limit_except GET HEAD {
                auth_basic           "Index editor";
                auth_basic_user_file /usr/share/nginx/html/es/.htpasswd;
            }
        }
   лежит вот тут: https://github.com/salieff/salieff.github.io/blob/master/es/etc/nginx/default.d/es-location.conf

5. Сложить файлы редактора индекса в /usr/share/nginx/html/es/index-editor.
   Редактор взять тут: https://github.com/salieff/salieff.github.io/tree/master/es/index-editor

6. Дать nginx-у права на редактирование индекса:
        chown nginx.nginx /usr/share/nginx/html/es
        chmod 755 /usr/share/nginx/html/es
        chown nginx.nginx /usr/share/nginx/html/es/project2.json
        chmod 644 /usr/share/nginx/html/es/project2.json

7. Открыть в браузере http://191.ru/es/index-editor.
   Убедиться, что есть список модов и список файлов.
   Попробовать добавить мод, закоммитить, убедиться, что он появился в project2.json.
   Попробовать удалить добавленный мод, закоммитить, убедиться, что он исчез из project2.json.
   Попробовать открыть http://191.ru/es/index-editor во второй вкладке, убедиться, что сессия лочится.
   Пользуясь редактором, начинать исправлять всё, что покрашено красным :)
