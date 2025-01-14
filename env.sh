#!/bin/sh

# 替换环境变量
envsubst '${REACT_APP_OPENAI_BASE_URL} ${REACT_APP_OPENAI_API_KEY}' < /usr/share/nginx/html/index.html > /usr/share/nginx/html/index.html.tmp
mv /usr/share/nginx/html/index.html.tmp /usr/share/nginx/html/index.html 