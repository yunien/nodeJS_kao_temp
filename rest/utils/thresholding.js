const fs = require('fs');
const Decimal = require('decimal');
const getPixels = require('get-pixels');
const PNGImage = require('pngjs-image');
const dijkstra = require('./dijkstra');
const dashboardService = require('../service/dashboard/dashboardService');

exports.getPhotoPixels = (reqBody) => new Promise((rs, rj) => {
  const { mapMaskPath } = reqBody;
  getPixels(mapMaskPath, (err, pixels) => {
    if(err){
      rj(new Error(err.message));
    } else {
      rs(pixels);
    }
  });
});

exports.thresholding = (pixels) => new Promise((rs, rj) => {
  const w = pixels.shape[0];
  const h = pixels.shape[1];
  
  let zuobiao = [];
  let R = 0, red = 0, green = 0, blue = 0;
  for (let x=0 ; x<w ; x++){
    zuobiao[x] = [];
    for (let y=0 ; y<h ; y++){
      const pixel = pixels.get(x, y, 0);
      //  須改，[0][1]錯了
      const rgb0 = (pixel & 0xff0000) >> 16;
      const rgb1 = (pixel & 0xff00) >> 8;
      const rgb2 = (pixel & 0xff);
      zuobiao[x][y] = ((rgb0 + rgb1 + rgb2)/3).toFixed(3);
    }
  }

  const newImage = PNGImage.createImage(w, h);
  const SW = 20;
  let newImageXY;
  let prohibitedArrayBypixel = [];
  for(let x=0 ; x<w ; x++){
    for(let y=0 ; y<h ; y++){
      if(zuobiao[x][y] > SW){ //prohibited zone
        newImage.setAt(x, y, { red:0, green:0, blue:0, alpha:255 });
        prohibitedArrayBypixel.push({x:x, y:y});
      }else{  //working zone
        newImage.setAt(x, y, { red:255, green:255, blue:255, alpha:255 });
      }
    }
  }
  const thresholdingData = Object.assign({}, {prohibitedArrayBypixel, w, h, newImage})
  rs(thresholdingData);
});

exports.saveProhibitedImage = (resultBody, thresholdingData) => new Promise((rs, rj) => {
  const {mapMaskPath} = resultBody;
  const {newImage} = thresholdingData;
  const newImageName = mapMaskPath.replace(/\.png/ig, '_Thresholding.png');
  console.log('newImage getBlob:', typeof newImage.getBlob());
  newImage.writeImage(newImageName, (err) => {
    if(err){
      rj(new Error(err.message));
    } else {
      console.log('success', newImageName)
      rs(newImageName);
    }
  });
});