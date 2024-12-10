import express from 'express'
import{
   
    getAllBarang,
    getBarangById,
    addBarang,
    updateBarang,
    deleteBarang

}from '../controller/barang_controller.js'

import { authorize } from '../controller/auth_controller.js'
import { IsAdmin } from '../middleware/role_validation.js'

const app = express()

app.use(express.json())

app.get('/', authorize ,[IsAdmin],getAllBarang)
app.get('/:id', authorize ,[IsAdmin], getBarangById)
app.post('/', authorize ,[IsAdmin],addBarang)
app.put('/:id', authorize ,[IsAdmin],updateBarang)
app.delete('/:id', authorize ,[IsAdmin],deleteBarang)

export default app

