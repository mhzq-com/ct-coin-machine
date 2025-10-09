"use strict";

class MySqlContext{
    constructor(connection){
        this.con = connection;
        this.transactionDepth = 0;
    }

    /**
     *
     * Elindít egy tranzakciót.
     *
     */

     StartTransaction() {


        return new Promise(async (resolve, reject) => {

            try {
                var instance = this;
                var con = this.con;
                if (instance.transactionDepth == 0) {
                    con.beginTransaction(function (err) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        instance.transactionDepth++;
                        resolve(instance);
                    });
                } else {
                    
                    con.query(`SAVEPOINT depth${(instance.transactionDepth + 1)};`, [], (err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        instance.transactionDepth++;
                        resolve(instance);
                    });

                }
            } catch (error) {
                reject(error);
            }


        });
    }

    Commit() {
        return new Promise((resolve, reject) => {
            if (this.transactionDepth < 2) {
                this.con.commit((err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    this.transactionDepth--;
                    resolve(true);
                    this.con.release();
                });
            } else {
                this.con.query(`RELEASE SAVEPOINT depth${this.transactionDepth};`, [], (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    this.transactionDepth--;
                    resolve(result);
                });

            }
        });
    }

    /**
     *
     * Rollback hívás a függő tranzakciókat visszavonja.
     *
     */

    Rollback() {

        return new Promise((resolve, reject) => {
            if (this.transactionDepth < 2) {
                this.con.rollback(function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    this.transactionDepth--;
                    resolve(true);
                });
            } else {
                this.con.query(`ROLLBACK TO depth${this.transactionDepth};`, [], (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    this.transactionDepth--;
                    resolve(result);
                });

            }
        });

    }

    /**
     *
     * Rollback hívás a függő összes tranzakciókat visszavonja.
     *
     */

     RollbackAll() {

        return new Promise((resolve, reject) => {
            this.con.rollback(function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                this.transactionDepth = 0;
                resolve(true);
            });
        });

    }


    SelectDatabase(database, transaction = undefined) {
        return new Promise(async (resolve, reject) => {
            var con = this.con;
            try {


                connection.changeUser({ database: database }, function (err) {
                    connection.release();
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(true);
                });
            } catch (error) {
                reject(error);
            }


        });

    }

    Query(sql, params) {
        return new Promise(async (resolve, reject) => {
            var con = this.con;
            con.query(sql, params, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    }


    GetRows(sql, params) {


        return new Promise(async (resolve, reject) => {
            var con = this.con;

            con.query(sql, params, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    }

    Add(obj){
        var mysql = this;
        // var $this = new objectType();

        var classname = obj.constructor.name.toLowerCase();
        
        var table_name = this.con.escape(classname).toLowerCase().replace(new RegExp("[\']*", "g"), "");

        var sql = `INSERT INTO ${table_name}(`;

        var columns = Object.keys(obj).join("`, `");

        columns = '`' + columns + '`';

        sql += columns + `) VALUES(`;

        var values = "".padEnd(Object.keys(obj).length * 2, "?,");

        values = values.substring(0, values.length - 1)

        sql += values;

        sql += ");";

        //console.log(sql);


        return new Promise((resolve, reject)=> {
            mysql.Query(sql, Object.values(obj)).then((result) => {
                
                resolve(result.insertId);
            }).catch((error) => {
                reject(error);
            });
        });

    }

    Update(obj){
        var mysql = this;

        var classname = obj.constructor.entityName.toLowerCase();
        
        var table_name = this.con.escape(classname).toLowerCase().replace(new RegExp("[\']*", "g"), "");

        var sql = `UPDATE ${table_name} SET `;

        var columns = Object.keys(obj);
        var idIndex = columns.indexOf("id");
        columns.splice(idIndex, 1);
        
        columns = columns.join("`= ?, `");
        
        columns = '`' + columns;

        sql += columns + `\`= ? WHERE id = ?`;

        var parameters = Object.values(obj);
        parameters.splice(idIndex, 1);


        parameters.push(parseInt(obj.id));


        return new Promise((resolve, reject)=> {
            
            mysql.Query(sql, parameters).then((result) => {
                if(result.affectedRows == 0){
                    reject(new Error(`Sikertelen módosítás ${table_name} id: ${obj.id}`));
                    return;
                }

                resolve(result.affectedRows);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    Delete(obj){
        var mysql = this;

        var classname = obj.constructor.entityName.toLowerCase();
        
        var table_name = this.con.escape(classname).toLowerCase().replace(new RegExp("[\']*", "g"), "");

        var sql = `DELETE FROM ${table_name} WHERE id = ? `;
        
        var parameters = [obj.id];

        return new Promise((resolve, reject)=> {
            mysql.Query(sql, parameters).then((result) => {
                
                if(result.affectedRows == 0){
                    reject(new Error(`Sikertelen módosítás ${table_name} id: ${obj.id}`));
                    return;
                }

                resolve(result.affectedRows);
            }).catch((error) => {
                reject(error);
            });
        });
    }


    Get(objectType, searchParams){
        
        var mysql = this;
        var $this = new objectType();

        var classname = objectType.entityName.toLowerCase();
        
        var table_name = this.con.escape(classname).toLowerCase().replace(new RegExp("[\']*", "g"), "");
        var s = "SELECT * FROM " + table_name + " WHERE 1=1 AND ";
        //console.log(table_name);
        var where = Object.keys(searchParams).map((o) => {
            if(searchParams[o] == null){
                return "`" + o +"`" + " IS ?";
            }
            return "`" + o +"`" + " = ?";
        }).join(" AND ");

        where = where;

        //where += "` = ? ";
        s += where;
        // console.log(s);
        
        return new Promise((resolve, reject)=> {
            mysql.Query(s, Object.values(searchParams)).then((result) => {
                
                if(result.length > 1){
                    reject(new Error(`${classname} returns more than one item (searchParams: ${JSON.stringify(searchParams)})`));
                    return;
                }

                if(result.length == 0){
                    reject(new Error(`${classname} item not found (searchParams: ${JSON.stringify(searchParams)})`));
                    return;
                }
                
                var obj = result[0];

                for (var property in obj) {

                    if (obj.hasOwnProperty(property)) {
                        $this[property] = obj[property];
                    }
                }


                resolve($this);
            }).catch(error => {
                reject(error);
            });
        });
    }

    GetList(objectType, searchParams, orderBy = null, limit = null){
        var mysql = this;
        var $this = new objectType();

        var classname = objectType.entityName.toLowerCase();
        
        var table_name = this.con.escape(classname).toLowerCase().replace(new RegExp("[\']*", "g"), "");
        var s = `SELECT T1.* FROM ${table_name} AS T1`;
        
        // var join = "";
        // var indx = 2;
        // if(joinTable && joinTable.length > 0){
        //     (joinTable).forEach(element => {
        //         join += ` INNER JOIN ${element.table_name} AS T${indx} ON `
        //         var jw = element.join_conditions.join(` T${indx}`)
        //         indx++;
        //     });
        // }

        // s += join;

        var where = " WHERE 1=1"
        if(Object.keys(searchParams).length > 0){

            where += " AND ";
            var w = "";
            Object.keys(searchParams).forEach(element => {
                var operator = "=";
                if(element.indexOf("|") > -1){
                    operator = element.split("|");
                    element = operator[0];
                    operator = operator[1];
                }
                w +=` \`${element}\` ${operator} ? AND`;
            });
            w = w.substring(0, w.length - 3);

            where += w;
        }

        var orderByS = "";
        if(orderBy){
            orderByS += " ORDER BY";
            for(var key in orderBy){
                
                orderByS += ` \`${key}\` ${orderBy[key]},`
            }
            
            orderByS = orderByS.substring(0,(orderByS.length-1));
            
        }

        var limitS = "";
        if(limit && Object.keys(limit).indexOf("rowCount") > -1){
            limitS = " LIMIT ";

            if(Object.keys(limit).indexOf("offset") > -1){
                limitS += limit.offset.toString() + ",";
            } else if(Object.keys(limit).indexOf("page") > -1){
                var offset = ((limit.page - 1 ) * limit.rowCount);
                limitS += offset + ",";
            }

            limitS += limit.rowCount.toString();

        }


        s += where + orderByS + limitS;
        
        return new Promise((resolve, reject)=> {
            mysql.Query(s, Object.values(searchParams)).then((result) => {
                var objList = [];
                
             
                for(var row in result){
                    var obja = new objectType();

                    if (result.hasOwnProperty(row)) {
                       
                        for (var property in result[row]) {

                            if (result[row].hasOwnProperty(property)) {
                                obja[property] = result[row][property];
                            }
                        }
                        objList.push(obja);
                    }
                }

                resolve(objList);

            }).catch(error => {
                reject(error);
            });
        });
    }
}

class MySql {
    constructor(host, user, password, database) {
        this.isConnected = false;
        this.mysql = require('mysql');

        this.host = host;
        this.user = user;
        this.database = database;

        // this.con = this.mysql.createConnection({
        //     host: host,
        //     user: user,
        //     password: password,
        //     database: database, 
        //     insecureAuth: true
        // });

        // this.con.on("error", function(error){
        //     console.log("Mysql error", error.message);
        // });

        this.pool = this.mysql.createPool({
            connectionLimit: 10,
            host: host,
            user: user,
            password: password,
            database: database,
        });

    }



    GetConnection() {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, con) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(con);
            })
        });
    }



    CreateContext(){
        return new Promise(async (resolve, reject) => {
            try {
                
                var con = await this.GetConnection()
                console.log("MySql connectionCreated");
            } catch (error) {
                reject(error);
                return;
            }
            
            resolve(new MySqlContext(con));
        });     
    }

    async Insert(sql, params) {
        var ctx = await this.CreateContext();
        return ctx.Query(sql, params);
    }

    async Update(sql, params) {
        var ctx = await this.CreateContext();
        return ctx.Query(sql, params);
    }

    async Delete(sql, params) {
        var ctx = await this.CreateContext();
        return ctx.Query(sql, params);

    }


    async GetRows(sql, params) {
        var ctx = await this.CreateContext();
        return ctx.GetRows(sql, params);
    }


    async Get(objectType, searchParams){
        var ctx = await this.CreateContext();
        return ctx.Get(objectType, searchParams);
    }

    async GetList(objectType, searchParams, orderBy = null, limit = null){
        
        var ctx = await this.CreateContext();
        return ctx.GetList(objectType, searchParams, orderBy, limit);
    }


    
}

MySql.instance = null;


module.exports = {
    MySql: MySql
};