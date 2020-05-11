git config --global user.name 'gongkuihua'
git config --global user.email 'gkh60@foxmail.com'

# if [ ! -d "/imageRespository/" ]; then
#     git clone https://github.com/gongkuihua/imageRespository
# fi
workdir=$(cd $(dirname $0); pwd)

if [[ ! ${INFILE:0:2} = "im" ]]
then
  cd ../images
fi

echo '文件上传中'
git pull
git add .
git commit -m "图片上传"
git remote add origin https://github.com/gongkuihua/imageRespository
git push -u origin master

echo '上传完成'

cd ../PicBed4MWeb-master