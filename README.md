# import model from database

##install

```
npm install -g mysql2  # --save
npm install -g sequelize-auto # --save
```

[ref](https://github.com/sequelize/sequelize-auto)

```
sequelize-auto -o "rest/models/RDS" -d nice -h aurora-dev.nice-cam.com -u nicecam20 -p 3306 -x nicecamera20 -e mysql
```