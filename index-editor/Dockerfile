# docker build -t es-index-editor-image .
# docker run --name es-index-editor -p 8888:80 -v /home/salieff/Work/es-nginx/es:/var/www/html/es --rm es-index-editor-image

FROM debian:bookworm

RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get install -y libnginx-mod-http-dav-ext git
RUN apt-get autoremove -y && apt-get clean
RUN echo 'dav_ext_lock_zone zone=esindex:10m timeout=60;' > /etc/nginx/conf.d/es-lock-zone.conf
RUN rm -f /etc/nginx/sites-enabled/*
RUN printf '\
server {\n\
	listen 80 default_server;\n\
	listen [::]:80 default_server;\n\
	root /var/www/html;\n\
	index index.html index.htm index.nginx-debian.html;\n\
	server_name _;\n\
\n\
	location /es/ {\n\
		autoindex on;\n\
\n\
		dav_access user:rw group:r all:r;\n\
		dav_methods PUT;\n\
		dav_ext_methods LOCK UNLOCK;\n\
		dav_ext_lock zone=esindex;\n\
		client_max_body_size 0;\n\
\n\
		limit_except GET HEAD {\n\
		auth_basic           "Index editor";\n\
		auth_basic_user_file /var/www/html/es/.htpasswd;\n\
		}\n\
	}\n\
}\n' > /etc/nginx/sites-available/es-mods-site
RUN ln -s /etc/nginx/sites-available/es-mods-site /etc/nginx/sites-enabled
RUN rm -f /var/www/html/*
RUN cd /var/www/html && git clone https://github.com/salieff/salieff.github.io.git .
RUN find /var/www/html -mindepth 1 ! -regex '^/var/www/html/index-editor\(/.*\)?' -delete
RUN cd /var/www/html/index-editor && rm -f Dockerfile && rm -f readme*.txt && rm -rf etc
RUN sed -i -e 's/user www-data;/user root;/' /etc/nginx/nginx.conf 

EXPOSE 80
STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]
