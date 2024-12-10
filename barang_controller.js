import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()


export const getAllBarang = async (req, res) => {
  try {
    const result = await prisma.barang.findMany();
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      msg: error,
    });
  }
};
export const getBarangById = async (req, res) => {
  try {
    const result = await prisma.barang.findUnique({
      where: {
        id_barang: Number(req.params.id),
      },
    });
    if (result) {
      res.status(200).json({
        success: true,
        data: result,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "data not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: error,
    });
  }
};
export const addBarang = async (req, res) => {

    try {
        const { nama, category, location, quantity } = req.body
        const result = await prisma.barang.create({
            data: {
                nama_barang: nama,
                category: category,
                location: location,
                quantity: quantity
            }
        })
        res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        console.log(error);
        res.json({
            msg: error.message
        })

    }
}
export const updateBarang = async (req, res) => {

    try {
        const { nama, category, location, quantity } = req.body
        const result = await prisma.barang.update({
            where: {
                id_barang: Number(req.params.id)
            },
            data: {
                nama_barang: nama,
                category: category,
                location: location,
                quantity: quantity
            }
        })
        res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        console.log(error);
        res.json({
            msg: message.error
        })

    }
}
export const deleteBarang = async (req, res) => {
    const { id } = req.params

    try {
        const result = await prisma.barang.delete({
            where: {
                id_barang: Number(id)
            },
        })
        if (!result) {
            res.status(201).json({
                success: false,
                data: null
            })
        }
        res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        console.log(error);
        res.json({
            msg: error
        })

    }
}