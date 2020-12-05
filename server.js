const express = require("express")
const compression = require('compression')
const bodyParser = require("body-parser")
const _where = require("lodash.where")
const sql = require('mssql')
const app = express()
app.use(bodyParser.json())
app.use(compression())
const server = app.listen(3000, a =>{
    console.log('listening at http://localhost:3000')
})

app.use('/', express.static('./public'));

app.use(express.urlencoded())

app.get('/',function(req,res){
    res.send('Hello World')
})

const DB_CONFIG ={
    user: "bootcamp",
    password: "bootcamp*123",
    server: "206.189.80.195",
    database:"APIS"
}

var WithDB = function WithDB(req,res,next){
    res.setHeader('Content-Type','application/json')
    new sql.ConnectionPool(DB_CONFIG).connect().then(pool => {
        return pool.query(`SELECT id, nama_mhs, matkul, nilai, CASE
                            when nilai >= 80 then 'A'
                            when nilai >= 60 then 'B'
                            when nilai >= 40 then 'C'
                            when nilai >= 20 then 'D'
                            ELSE 'E'
                            end as 'index',
                            case
                            when nilai >= 60 then 'Lulus'
                            else 'Tidak lulus'
                            end as status
                        from alfi_sardi
        `)
    }).then(result =>{
        return res.send(result.recordset)
    }).catch(err =>{ 
        return res.send(err)
    })
}
app.get('/db',WithDB)

app.post('/simpan-mhs', function(req, res){
    console.log(req.body)

    const { nama_mhs, matkul, nilai } = req.body; 

    new sql.ConnectionPool(DB_CONFIG).connect().then(pool => {
        const sql = `
            INSERT into alfi_sardi 
            (nama_mhs, matkul, nilai) 
            values ('${nama_mhs}', '${matkul}', '${nilai}');`
        console.log(sql)
        return pool.query(sql)
    }).then(result => {
        return res.send(result)
    }).catch(err => {
        return res.send(err)
    })
    // res.redirect('/')

})

app.delete('/hapus-data/:id',  (req, res) => {
    const { id } = req.params
    new sql.ConnectionPool(DB_CONFIG).connect().then(pool => {
        const sql = `
            Delete from alfi_sardi where id = '${id}'`
        return pool.query(sql)
    }).then(result => {
        res.send(result)
        res.redirect('/')
    }).catch(err => {
        return res.send(err)
    })
});