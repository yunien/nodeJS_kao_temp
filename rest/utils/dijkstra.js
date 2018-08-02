const Grahp = require('node-dijkstra');
const Decimal = require('decimal');
const forEach = require('async-foreach').forEach;
const areasDao = require('../models/areasDao');

const route = new Grahp();

/**
 * short distance introduction
 * a b c
 * d e f
 * g h i
 */
// route.addNode('a', {'b':1, 'd':1});
// route.addNode('b', {'a':1, 'c':1, 'e':1});
// route.addNode('c', {'b':1, 'f':1});
// route.addNode('d', {'a':1, 'e':1, 'g':1});
// route.addNode('e', {'b':1, 'd':1, 'f':1, 'h':1});
// route.addNode('f', {'c':1, 'e':1, 'i':1});
// route.addNode('g', {'d':1, 'h':1});
// route.addNode('h', {'e':1, 'g':1, 'i':1});
// route.addNode('i', {'f':1, 'h':1});

// // route.removeNode('b');
// // route.removeNode('e');

// exports.shortPath = async () => {
//   console.log('shortPath:', route.path('a', 'h') );
// };

// // trimmed
// route.path('A', 'D', { trim: true }) // => [B', 'C']
// // reversed
// route.path('A', 'D', { reverse: true }) // => ['D', 'C', 'B', 'A']
// // include the cost
// route.path('A', 'D', { cost: true })
// // => {
// //       path: [ 'A', 'B', 'C', 'D' ],
// //       cost: 4
// //    }


exports.initGrahp = async () => {
  console.log('initGrahp');

  //  地圖長寬(cm算)，換算定位點
  const {width, height} = {width: 25.465, height: 19.656};
  //  長寬/space = 定位點間距(可接受定位精準度)
  const space = 40;
  //  靜置區域
  const prohibited = [];

  const mapWidth_cm = Decimal(width).mul(100).toNumber().toFixed(3);
  const mapHeight_cm = Decimal(height).mul(100).toNumber().toFixed(3);
  let x_length = parseInt(mapWidth_cm/space);
  let y_length = parseInt(mapHeight_cm/space);
  if(mapWidth_cm % space > 0){
    x_length = x_length + 1;
  }
  if(mapHeight_cm % space > 0){
    y_length = y_length + 1;
  }

  let zones = [];
  for (let x = 0 ; x <= x_length ; x+= 1) {
    for (let y = 0 ; y <= y_length ; y+= 1){
      const name = x+'_'+y;
      const obj = {};
      if (y - 1 >= 0){
        const x_y = x +'_'+ (y - 1);
        Object.assign(obj, {[`${x_y}`]:space});
      }
      if (x + 1 < x_length){
        const x_y = (x + 1)+'_'+y;
        Object.assign(obj, {[`${x_y}`]:space});
      }
      if (x + 1 === x_length){
        const x_y = (x + 1)+'_'+y;
        const dis = mapWidth_cm - (Decimal(x).mul(space).toNumber().toFixed(3));
        Object.assign(obj, {[`${x_y}`]: dis});
      }
      if (x - 1 >= 0){
        const x_y = (x - 1)+'_'+y;
        Object.assign(obj, {[`${x_y}`]:space});
      }
      if (y + 1 < y_length){
        const x_y = x +'_'+ (y + 1);
        Object.assign(obj, {[`${x_y}`]:space});
      }
      if (y + 1 === y_length){
        const x_y = x +'_'+ (y + 1);
        const dis = mapHeight_cm - (Decimal(y).mul(space).toNumber().toFixed(3));
        Object.assign(obj, {[`${x_y}`]: dis});
      }
      // route.addNode(name, obj);
      let x_real_position = Decimal(x).mul(space).div(100).toNumber().toFixed(3);
      let y_real_position = Decimal(y).mul(space).div(100).toNumber().toFixed(3);
      if (x === x_length) {
        x_real_position = Decimal(mapWidth_cm).div(100).toNumber().toFixed(3);
      }
      if (y === y_length) {
        y_real_position = Decimal(mapHeight_cm).div(100).toNumber().toFixed(3);
      }
      zones.push({position_name: name, obj, x: parseFloat(x_real_position), y: parseFloat(y_real_position) });
      // console.log('name:', name, ' obj:', obj, ' x:', x_real_position, ' y:', y_real_position );
    }
  }
  
  console.log('prohibitedArea');
  let prohibitedArea = "[{\"x1\": 17.9125,\"x2\": 23.5925,\"y1\": 3.36,\"y2\": 16.22},"+
    "{\"x1\": 8.6325,\"x2\": 9.8525,\"y1\": 3.08,\"y2\": 16.22},"+
    "{\"x1\": 11.0525,\"x2\": 12.2325,\"y1\": 3.08,\"y2\": 16.22},"+
    "{\"x1\": 13.4325,\"x2\": 14.6325,\"y1\": 3.08,\"y2\": 16.22},"+
    "{\"x1\": 15.8125,\"x2\": 17.0125,\"y1\": 3.08,\"y2\": 16.22},"+
    "{\"x1\": 2.0725,\"x2\": 7.7325,\"y1\": 3.36,\"y2\": 16.22},"+
    "{\"x1\": 1.6325,\"x2\": 2.6925,\"y1\": 9.04,\"y2\": 10.08},"+
    "{\"x1\": 1.6325,\"x2\": 2.6725,\"y1\": 0,\"y2\": 0.52},"+
    "{\"x1\": 11.1925,\"x2\": 12.2325,\"y1\": 0,\"y2\": 0.52},"+
    "{\"x1\": 20.7725,\"x2\": 21.8125,\"y1\": 0,\"y2\": 0.52},"+
    "{\"x1\": 21.5325,\"x2\": 23.5925,\"y1\": 0,\"y2\": 1.34},"+
    "{\"x1\": 4.4125,\"x2\": 6.8925,\"y1\": 0.68,\"y2\": 1.58},"+
    "{\"x1\": 9.1925,\"x2\": 11.6725,\"y1\": 0.68,\"y2\": 1.58},"+
    "{\"x1\": 13.9725,\"x2\": 16.4725,\"y1\": 0.68,\"y2\": 1.58},"+
    "{\"x1\": 18.7725,\"x2\": 21.2525,\"y1\": 0.68,\"y2\": 1.58},"+
    "{\"x1\": 0,\"x2\": 2.0125,\"y1\": 0,\"y2\": 2.32},"+
    "{\"x1\": 0,\"x2\": 1.0125,\"y1\": 3.66,\"y2\": 4.82},"+
    "{\"x1\": 0,\"x2\": 1.0125,\"y1\": 6.06,\"y2\": 7.2},"+
    "{\"x1\": 0,\"x2\": 1.0125,\"y1\": 8.44,\"y2\": 9.58},"+
    "{\"x1\": 0,\"x2\": 1.0125,\"y1\": 10.84,\"y2\": 11.98},"+
    "{\"x1\": 0,\"x2\": 1.0125,\"y1\": 13.28,\"y2\": 14.42},"+
    "{\"x1\": 0,\"x2\": 1.8925,\"y1\": 17.82,\"y2\": 19.656},"+
    "{\"x1\": 1.6325,\"x2\": 2.6925,\"y1\": 18.62,\"y2\": 19.656},"+
    "{\"x1\": 11.2025,\"x2\": 12.2325,\"y1\": 18.62,\"y2\": 19.656},"+
    "{\"x1\": 20.7525,\"x2\": 21.8125,\"y1\": 18.62,\"y2\": 19.656},"+
    "{\"x1\": 23.4025,\"x2\": 25.465,\"y1\": 17.84,\"y2\": 19.656},"+
    "{\"x1\": 3.5925,\"x2\": 6.0725,\"y1\": 17.72,\"y2\": 18.62},"+
    "{\"x1\": 6.8725,\"x2\": 9.3725,\"y1\": 17.72,\"y2\": 18.62},"+
    "{\"x1\": 10.1725,\"x2\": 12.6525,\"y1\": 17.72,\"y2\": 18.62},"+
    "{\"x1\": 13.4525,\"x2\": 15.9525,\"y1\": 17.72,\"y2\": 18.62},"+
    "{\"x1\": 16.7325,\"x2\": 19.2325,\"y1\": 17.72,\"y2\": 18.62},"+
    "{\"x1\": 20.1325,\"x2\": 22.6125,\"y1\": 17.72,\"y2\": 18.62},"+
    "{\"x1\": 24.3725,\"x2\": 25.465,\"y1\": 3.66,\"y2\": 4.82},"+
    "{\"x1\": 24.3725,\"x2\": 25.465,\"y1\": 6.06,\"y2\": 7.2},"+
    "{\"x1\": 24.3725,\"x2\": 25.465,\"y1\": 8.44,\"y2\": 9.58},"+
    "{\"x1\": 24.3725,\"x2\": 25.465,\"y1\": 10.84,\"y2\": 11.98},"+
    "{\"x1\": 24.3725,\"x2\": 25.465,\"y1\": 13.28,\"y2\": 14.42}]";

  console.log('removeNode');
  prohibitedArea = JSON.parse(prohibitedArea);
  await prohibitedArea.forEach(async (element) => {
    const {x1,x2,y1,y2} = element;
    const aa = await zones.filter( async(item, index, array) => {
      console.log('x1:', x1, '<= item.x:', item.x, '<= x2:', x2, 'y1:', y1, '<= item.y:', item.y, 'y2:', y2);
      if ( ((x1 <= item.x) && (item.x <= x2)) && ((y1 <= item.y) && (item.y <= y2)) ){
        // await route.removeNode(item.position_name);
        await delete zones[index];
        return;
      }
    } );
  });

  let newZones = [];
  await zones.forEach(async (element) => {
    if(element !== null){
      newZones.push(element);
    }
  });

  await areasDao.updateWorkingZones(JSON.stringify(newZones));
  return zones;
};

exports.initMapGrahp = async (zones) => {
  await zones.forEach(async (element) => {
    const { position_name, obj } = element;
    route.addNode(position_name, obj);
  });
}

exports.removeMapGrahp = (keyArr) => {
  route.removeNode(keyArr);
}

exports.shortPath = async (start,end) => {
  return await route.path(start,end)
};

// const findClosest = async (array,value) =>{
//     result = array.reduce(function (r, a, i, aa) {
//       return i && Math.abs(aa[r].x - value) < Math.abs(a.x - value) ? r : i;
//     }, -1);
//     return result
// }

const getIndexByDistance = async (position, positionArr) => {
  let i = 1;
  let mi = 0;
  const {x, y} = position;

  while (i < positionArr.length) {
    if (!(Math.sqrt((x - positionArr[i].x) * (x - positionArr[i].x) + (y - positionArr[i].y) * (y - positionArr[i].y)) > Math.sqrt((x - positionArr[mi].x) * (x - positionArr[mi].x) + (y - positionArr[mi].y) * (y - positionArr[mi].y))))
      mi = i;
      i += 1;
  }
  
  return mi;
}

const forArrayPixel = async (prohibitedArrayBypixel, x_pixelToCm, y_pixelToCm, zones) => {
  let prohibitedZoneName = [];
  await prohibitedArrayBypixel.forEach(async (element) => {
    const {x, y} = element;
    const x_byCm = Decimal(x).mul(x_pixelToCm).toNumber().toFixed(3);
    const y_byCm = Decimal(y).mul(y_pixelToCm).toNumber().toFixed(3);
    const close_x = await findClosest(zones, x_byCm);
    const close_value = zones[close_x].x;
    var close_arr = zones.filter(function (value) { return value.x == close_value; })
    const src = await getIndexByDistance({ x: x_byCm, y: y_byCm }, close_arr);
    const position_name = zones[src].position_name;
    
    if (prohibitedZoneName.indexOf(position_name) === -1) {
      prohibitedZoneName.push(position_name);
      route.removeNode(position_name);
    }
  }, this);
  return prohibitedZoneName;
};

const conveterPxToCmAndShortDistance11 = async (prohibitedArrayBypixel,
  mapWidth_cm, w, mapHeight_cm, h, zones) => {
  const x_pixelToCm = Decimal(mapWidth_cm).div(w).toNumber().toFixed(3);
  const y_pixelToCm = Decimal(mapHeight_cm).div(h).toNumber().toFixed(3);

  return await forArrayPixel(prohibitedArrayBypixel, x_pixelToCm, y_pixelToCm, zones);
};

const getClosest = (array, value) => new Promise((rs, rj) => {
  result = array.reduce( (r, a, i, aa) => {
    return i && Math.abs(aa[r].x - value) < Math.abs(a.x - value) ? r : i;
  }, -1);
  rs(result);
});

const getIndexByDis = (array, value) => new Promise((rs, rj) => {
  let i = 1;
  let mi = 0;
  const {x, y} = position;
  while (i < positionArr.length) {
    if (!(Math.sqrt((x - positionArr[i].x) * (x - positionArr[i].x) + (y - positionArr[i].y) * (y - positionArr[i].y)) > Math.sqrt((x - positionArr[mi].x) * (x - positionArr[mi].x) + (y - positionArr[mi].y) * (y - positionArr[mi].y))))
      mi = i;
      i += 1;
  }
  rs(mi);
});

const findClosest = (x, arr) => {
  var indexArr = arr.map(function (k) { return Math.abs(k - x) });
  var min = Math.min.apply(Math, indexArr);
  return arr[indexArr.indexOf(min)];
}

const calculateShortDistance = (obj) => {
  const {x_byM, y_byM, space} = obj;
  
  const x_byCm = (x_byM * 100).toFixed(8);
  let x_dis1 = parseInt(x_byCm/space);
  let x_dis2 = x_dis1;
  if(x_dis1 % space > 0){
    x_dis2 = x_dis2 + 1;
  }
  x_dis1 = (x_dis1 * space).toFixed(8);
  x_dis2 = (x_dis2 * space).toFixed(8);
  // console.log('x_byCm:', x_byCm, 'x_dis1:', x_dis1, 'x_dis2:', x_dis2);
  const x_array = [x_dis1, x_dis2];
  const x = findClosest(x_byCm, x_array);

  const y_byCm = (y_byM * 100).toFixed(8);
  let y_dis1 = parseInt(y_byCm/space);
  let y_dis2 = y_dis1;
  if(y_dis1 % space > 0){
    y_dis2 = y_dis2 + 1;
  }
  y_dis1 = (y_dis1 * space).toFixed(8);
  y_dis2 = (y_dis2 * space).toFixed(8);
  // console.log('y_byCm:', y_byCm, 'y_dis1:', y_dis1, 'y_dis2:', y_dis2);
  const y_array = [y_dis1, y_dis2];
  const y = findClosest(y_byCm, y_array);
  
  let x_key = parseInt((x / space).toFixed(0));
  let y_key = parseInt((y / space).toFixed(0));

  // console.log('x:', x, 'y:', y, 'x_key:', x_key, 'y_key:', y_key);

  return (x_key+'_'+y_key);
};

exports.conveterPxToCmAndShortDistance = async (reqBody, thresholdingData) => {
  const {mapWidth, mapHeight, space} = reqBody;
  const {prohibitedArrayBypixel, w, h} = thresholdingData;

  const x_pixelToM = (mapWidth / w).toFixed(10);
  const y_pixelToM = (mapHeight / h).toFixed(10);

  let prohibitedZoneName = [];
  console.time('prohibitedArrayBypixel');
  const promiseArr = prohibitedArrayBypixel.map(element => {
    const {x, y} = element;
    const x_byM = (x * x_pixelToM).toFixed(10);
    const y_byM = (y * y_pixelToM).toFixed(10);
    return calculateShortDistance({x_byM, y_byM, space});
  });
  console.timeEnd('prohibitedArrayBypixel');
  console.time('calculateShortDistance');
  const nameArr = await Promise.all(promiseArr);
  console.timeEnd('calculateShortDistance');

  const reducedObj = nameArr.reduce((acc, val)=>{
    acc[val] = true;
    return acc;
  },{});
  const result =  Object.keys(reducedObj);

  return result;
};

exports.calculateCoordinates = (reqBody) => new Promise((rs, rj) => {
  const {mapWidth, mapHeight, space} = reqBody;

  const mapWidth_cm = (mapWidth * 100).toFixed(3);
  const mapHeight_cm = (mapHeight * 100).toFixed(3);
  let x_length = parseInt(mapWidth_cm/space);
  let y_length = parseInt(mapHeight_cm/space);
  if(mapWidth_cm % space > 0){
    x_length = x_length + 1;
  }
  if(mapHeight_cm % space > 0){
    y_length = y_length + 1;
  }

  let zone = [];
  for (let x = 0 ; x <= x_length ; x+= 1) {
    for (let y = 0 ; y <= y_length ; y+= 1){
      const name = x+'_'+y;
      const obj = {};
      if (y - 1 >= 0){
        const x_y = x +'_'+ (y - 1);
        Object.assign(obj, {[`${x_y}`]:space});
      }
      if (x + 1 < x_length){
        const x_y = (x + 1)+'_'+y;
        Object.assign(obj, {[`${x_y}`]:space});
      }
      if (x + 1 === x_length){
        const x_y = (x + 1)+'_'+y;
        let dis = (mapWidth_cm - (x * space).toFixed(3)).toFixed(3);
        Object.assign(obj, {[`${x_y}`]: dis});
      }
      if (x - 1 >= 0){
        const x_y = (x - 1)+'_'+y;
        Object.assign(obj, {[`${x_y}`]:space});
      }
      if (y + 1 < y_length){
        const x_y = x +'_'+ (y + 1);
        Object.assign(obj, {[`${x_y}`]:space});
      }
      if (y + 1 === y_length){
        const x_y = x +'_'+ (y + 1);
        let dis = (mapHeight_cm - (y * space).toFixed(3)).toFixed(3);
        Object.assign(obj, {[`${x_y}`]: dis});
      }
      // route.addNode(name, obj);
      let x_real_position = (x * space / 100).toFixed(3);
      let y_real_position = (y * space / 100).toFixed(3);
      if (x === x_length) {
        x_real_position = (mapWidth_cm / 100).toFixed(3);
      }
      if (y === y_length) {
        y_real_position = (mapHeight_cm / 100).toFixed(3);
      }
      zone.push({position_name: name, obj, x: x_real_position, y: y_real_position});
    }
  }
  rs(zone);
});

/**
 * prohibitedZoneNames = [String]
 * originZones =[{position_name:String, x:number, y:number}]
 */
exports.calculateZoneAndProhibitedZone = (reqBody, prohibitedZoneNames, originZones) => {
  const zones =[];
  const prohibitedZone =[];
  originZones.forEach(zoneItem =>
    prohibitedZoneNames.find(name => zoneItem.position_name === name) ? prohibitedZone.push(zoneItem) : zones.push(zoneItem)
  );
  Object.assign(reqBody, {zones: JSON.stringify(zones)}, {prohibitedZone: JSON.stringify(prohibitedZone)});
  return reqBody;
};
