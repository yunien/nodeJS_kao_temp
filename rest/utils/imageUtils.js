const fs = require('fs');

/**
 * base64Data: image base encode
 * imgPathAndName: image save path + file name
 */
exports.saveImage = async (base64Data, imgPathAndName) => {
  console.log('utils imageUtils saveImage');
  try {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const imageBuffer = {};
    if (matches.length !== 3) {
      throw new Error('是無效的影像編碼');
    }
    imageBuffer.type = matches[1];
    imageBuffer.data = new Buffer(matches[2], 'base64');

    fs.writeFileSync(imgPathAndName, imageBuffer.data);
    console.log('Image saved successfully, path:', imgPathAndName);
    return imgPathAndName;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.encodeImage = async (newImgName) => {
  console.log('utils imageUtils encodeImage');
  try {
    const bitmap = fs.readFileSync(newImgName);
    const prohibitedAreaBase64 = 'data:image/png;base64,'+ new Buffer(bitmap).toString('base64');
    return prohibitedAreaBase64;
  } catch (error) {
    throw new Error(error.message);
  }
};