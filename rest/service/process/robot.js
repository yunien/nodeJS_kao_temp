const schedule = require('node-schedule')
const schedules = require('../utils/schedule')
const robot_patrol = require('../utils/robot.json')
const robot_goto = require('../utils/robotGoto.json')
const dijkstra = require('../../utils/dijkstra')
const dashboardService = require('../dashboard/dashboardService');
const util = require('util')

const path_position = {
  "x": "24.0",
  "y": "1.5",
  "uuid": "robot-1",
  "location": "Mega Plus",
  "floorRoom": "13F/1304",
  "robotNo": "robot-1",
  "status": "charging",
  "duration": "1s",
  "direction": "down",
  "goto": false,
  "patrol": false
}

//機器人長寬,先寫死
const { robot_width, robot_height, space } = { robot_width: 60, robot_height: 60, space: 10 };

process.on('message', (msg) => {
  load(msg)
});

const timer = (ms) => {
  return new Promise(r => setTimeout(r, ms));
}

const findPositionIndex = async (obj, x, y) => {
  for (let i = 0; i < obj.length; i++) {
    if (parseFloat(obj[i].x) === parseFloat(x) && parseFloat(obj[i].y) === parseFloat(y)) {
      return i;
    }
  }
  return null;
}

const getIndexByDistance = async (position, positionArr) => {
  var i = 1;
  var mi = 0;
  while (i < positionArr.length) {
    if (!(Math.sqrt((position.x - positionArr[i].x) * (position.x - positionArr[i].x) + (position.y - positionArr[i].y) * (position.y - positionArr[i].y)) > Math.sqrt((position.x - positionArr[mi].x) * (position.x - positionArr[mi].x) + (position.y - positionArr[mi].y) * (position.y - positionArr[mi].y))))
      mi = i;
    i += 1;
  }
  return mi;
}

const updateDirection = async (robot_1, robot_2) => {
  let direction = ''
  if (parseFloat(robot_1.x) < parseFloat(robot_2.x)) {
    direction = 'right'
  } else if (parseFloat(robot_1.x) > parseFloat(robot_2.x)) {
    direction = 'left'
  } else if (parseFloat(robot_1.y) < parseFloat(robot_2.y)) {
    direction = 'down'
  } else if (parseFloat(robot_1.y) > parseFloat(robot_2.y)) {
    direction = 'up'
  }
  return direction
}

const isEmptyObject = (obj) => {
  return !Object.keys(obj).length;
}

const calculateShortDistance = (obj) => {
  const { x_space, y_space, robot_width, robot_height } = obj;

  const x_space_next = x_space + (robot_width / 2)
  const x_space_pre = x_space - (robot_width / 2) < 0 ? 0 : x_space - (robot_width / 2)
  if (x_space_next % space != 0) {
    x_space_next = x_space_next + space - (x_space_next % space)
  }
  if (x_space_pre % space != 0) {
    x_space_pre = (x_space_pre - space) + space - (x_space_pre % space)
   // x_space_pre = x_space_pre - space < 0 ? 0 : x_space_pre - space
  }
  const y_space_next = y_space + (robot_height / 2)
  const y_space_pre = y_space - (robot_height / 2) < 0 ? 0 : y_space - (robot_height / 2)
  if (y_space_next % space != 0) {
    y_space_next = y_space_next + space - (y_space_next % space)
  }
  if (y_space_pre % space != 0) {
    y_space_pre = (y_space_pre - space) + space - (y_space_pre % space)
    //y_space_pre = y_space_pre - space < 0 ? 0 : y_space_pre - space
  }

  let key_arr = []
  for (let i = x_space_pre; i <= x_space_next; i += space) {
    for (let j = y_space_pre; j <= y_space_next; j += space) {
      let x_key = parseInt((i / space).toFixed(0));
      let y_key = parseInt((j / space).toFixed(0));
      key_arr.push(x_key + '_' + y_key)
    }
  }
  return key_arr
};


const load = async (msg) => {
  const { x, y, type, gotoDestination } = msg;
  //可行走區域
  console.time('getDB Data');
  let zones = await dashboardService.getPassableArea('4906d2e5-d1d9-4262-9ac3-b88f571bdac0')
  const { zone } = zones;
  const positionArr = zone;
  
  //禁制區域擴展
  let prohibitedArea = await dashboardService.getProhibitedArea('4906d2e5-d1d9-4262-9ac3-b88f571bdac0')
  console.timeEnd('getDB Data');
  console.time('prohibitedArea');
  const prohibitedArr = []
  prohibitedArea.zone.forEach(async (element) => {
    const { x, y } = element;
    const x_space = parseFloat((x * space * space).toFixed(3))
    const y_space = parseFloat((y * space * space).toFixed(3))
    const path_key = calculateShortDistance({ x_space, y_space, robot_width, robot_height });
    prohibitedArr.push(...path_key);
  });
  console.timeEnd('prohibitedArea');

  //模擬障礙物(人),先寫死
  console.time('prohibited People');
  people_des= { position_name: '152_51',
  obj: { '152_50': 10, '153_51': 10, '151_51': 10, '152_52': 10 },
  x: '15.200',
  y: '5.100' }
  const peo_x = people_des.x
  const peo_y = people_des.y
  const x_space = parseFloat((peo_x * space * space).toFixed(3)) 
  const y_space = parseFloat((peo_y * space * space).toFixed(3))
  const people_key = calculateShortDistance({ x_space, y_space, robot_width, robot_height });
  prohibitedArr.push(...people_key)
  console.timeEnd('prohibited People');

  //去除重複
  console.time('reducedObj');
  const reducedObj = prohibitedArr.reduce((acc, val) => {
    acc[val] = true;
    return acc;
  }, {});
  //可行走區域扣除禁制區域
  const result = Object.keys(reducedObj);
  const positionArr_new = [];
  const prohibitedZone_new = [];
  console.timeEnd('reducedObj');

  console.time('positionArr_new');
  positionArr.forEach(zoneItem =>
    result.find(name => zoneItem.position_name === name) ? prohibitedZone_new.push(zoneItem) : positionArr_new.push(zoneItem)
  );
  console.timeEnd('positionArr_new');

  //初始化 dijkstra router 
  console.time('initMapGrahp');
  await dijkstra.initMapGrahp(positionArr_new)
  console.timeEnd('initMapGrahp');
  /*
  const reqBody = Object.assign({}, { area: 'wistron', building: 'O999', floor: '333F', roomNo: '6000', mapWidth: '1', mapHeight: '1', space: '20', mapImg: '1111', prohibitedAreaImg: '222', prohibitedAreaImgPath: '3333' }, {}, { zones: JSON.stringify(prohibitedZone_tmp) }, { prohibitedZone: JSON.stringify(prohibitedZone_tmp) });
  Object.assign(reqBody);
  await dashboardService.createArea(reqBody);
  */
  let start = Date.now();
  if (type === 'patrol') {
    Object.assign(msg, { belongings: 3 })
    for (let i = 0; i < robot_patrol.length; i++) {
      if (i === (robot_patrol.length - 1)) {
        //set patrol flag to false , it's means completed
        robot_patrol[i].patrol = false
        process.send(robot_patrol[i])
        await timer(3000);
        let millis = Date.now() - start;
        Object.assign(msg, { status: 'done', duration: Math.floor(millis / 1000) + 's' });
        process.send(msg)
        return;
      }
      robot_patrol[i].status = 'patrol'
      process.send(robot_patrol[i])
      await timer(3000);
    }
  } else if (type === 'goto') {
    const { gotoDestination } = msg;
    //caculate shortest path
    const src = await getIndexByDistance({ x: x, y: y }, positionArr_new)
    const des = await getIndexByDistance(gotoDestination, positionArr_new)
    console.log('positionArr_new[src]=', positionArr_new[src], '   positionArr_new[des]=', positionArr_new[des])
    const pathArr = await dijkstra.shortPath(positionArr_new[src].position_name, positionArr_new[des].position_name)
    let tmp = {}
    Object.assign(msg, { belongings: 0 })
    for (let i = 0; i < pathArr.length; i++) {
      path_position.x = positionArr_new.find(o => o.position_name === pathArr[i]).x
      path_position.y = positionArr_new.find(o => o.position_name === pathArr[i]).y
      const cur_position = Object.assign({}, { x: path_position.x, y: path_position.y })
      path_position.status = 'goto'
      if (isEmptyObject(tmp)) {
        //first time , compare with next position to get direction
        tmp = cur_position
        const x_next = positionArr_new.find(o => o.position_name === pathArr[i + 1]).x
        const y_next = positionArr_new.find(o => o.position_name === pathArr[i + 1]).y
        path_position.direction = await updateDirection(tmp, Object.assign({}, { x: x_next, y: y_next }))
      } else {
        path_position.direction = await updateDirection(tmp, cur_position)
      }

      if (i != pathArr.length - 1) {
        path_position.goto = true
        process.send(path_position)
        await timer(1000);
        tmp = cur_position
      } else {
        //last item
        let millis = Date.now() - start;
        //set goto flag to false , it's means completed
        path_position.goto = false
        process.send(path_position)
        await timer(2000);
        //send done event to main process 
        Object.assign(msg, { status: 'done', duration: Math.floor(millis / 1000) + 's' });
        process.send(msg)
        return;
      }
    }

  } else {
    // return event
    const src = await getIndexByDistance({ x: x, y: y }, positionArr)
    const des = await getIndexByDistance({ x: '24.0', y: '1.5' }, positionArr)
    const pathArr = await dijkstra.shortPath(positionArr[src].position_name, positionArr[des].position_name)

    let tmp = {}
    for (let i = 0; i < pathArr.length; i++) {
      path_position.x = positionArr.find(o => o.position_name === pathArr[i]).x
      path_position.y = positionArr.find(o => o.position_name === pathArr[i]).y
      path_position.status = 'return'
      const cur_position = Object.assign({}, { x: path_position.x, y: path_position.y })
      if (isEmptyObject(tmp)) {
        //first time , compare with next position to get direction
        tmp = cur_position
        const x_next = positionArr.find(o => o.position_name === pathArr[i + 1]).x
        const y_next = positionArr.find(o => o.position_name === pathArr[i + 1]).y
        path_position.direction = await updateDirection(tmp, Object.assign({}, { x: x_next, y: y_next }))
      } else {
        path_position.direction = await updateDirection(tmp, cur_position)
      }

      if (i != pathArr.length - 1) {
        path_position.goto = true
        process.send(path_position)
        await timer(3000);
        tmp = cur_position
      } else {
        //last item
        let millis = Date.now() - start;
        //set goto flag to false , it's means completed
        path_position.goto = false
        process.send(path_position)
        await timer(3000);
        //send done event to main process 
        Object.assign(msg, { status: 'done', duration: Math.floor(millis / 1000) + 's' });
        process.send(msg)
        return;
      }
    }
  }
}
