git config --global user.name 'gongkuihua'
git config --global user.email 'gkh60@foxmail.com'

# if [ ! -d "/imageRespository/" ]; then
#     git clone https://github.com/gongkuihua/imageRespository
# fi

git pull
git add .
git commit -m "图片上传"
git remote add origin https://github.com/gongkuihua/imageRespository
git push -u origin master