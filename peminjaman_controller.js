import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllPeminjaman = async (req, res) => {
  try {
    const result = await prisma.peminjaman.findMany();
    const formattedData = result.map((record) => {
      const formattedBorrowDate = new Date(record.borrow_date)
        .toISOString()
        .split("T")[0];
      const formattedReturnDate = new Date(record.return_date)
        .toISOString()
        .split("T")[0];
      return {
        ...record,
        borrow_date: formattedBorrowDate,
        return_date: formattedReturnDate,
      };
    });

    res.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.log(error);
    res.json({
      msg: error,
    });
  }
};
export const getPeminjamanById = async (req, res) => {
  try {
    const result = await prisma.presensi.findMany({
      where: {
        id_user: Number(req.params.id),
      },
    });
    const formattedData = result.map((record) => {
      const formattedBorrowDate = new Date(record.borrow_date)
        .toISOString()
        .split("T")[0];
      const formattedReturnDate = new Date(record.return_date)
        .toISOString()
        .split("T")[0];
      return {
        ...record,
        borrow_date: formattedBorrowDate,
        return_date: formattedReturnDate,
      };
    });
    if (formattedData) {
      res.json({
        success: true,
        data: formattedData,
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
export const addPeminjaman = async (req, res) => {
  const { id_user, item_id, borrow_date, return_date, qty } = req.body;

  const formattedBorrowDate = new Date(borrow_date).toISOString(); //merubah format tanggal
  const formattedReturnDate = new Date(return_date).toISOString();

  const [getUserId, getBarangId] = await Promise.all([
    prisma.user.findUnique({ where: { id_user: Number(id_user) } }),
    prisma.barang.findUnique({ where: { id_barang: Number(item_id) } }),
  ]);

  if (getUserId && getBarangId) {
    try {
      const result = await prisma.peminjaman.create({
        data: {
          user: {
            connect: {
              id_user: Number(id_user),
            },
          },
          barang: {
            connect: {
              id_barang: Number(item_id),
            },
          },
          qty: qty,
          borrow_date: formattedBorrowDate,
          return_date: formattedReturnDate,
        },
      });
      if (result) {
        const item = await prisma.barang.findUnique({
          where: { id_barang: Number(item_id) },
        });

        if (!item) {
          throw new Error(
            `barang dengan id_barang ${id_barang} tidak ditemukan`
          );
        } else {
          const minQty = item.quantity - qty;
          const result = await prisma.barang.update({
            where: {
              id_barang: Number(item_id),
            },
            data: {
              quantity: minQty,
            },
          });
        }
      }
      res.status(201).json({
        success: true,
        message: "Peminjaman Berhasil Dicatat",
        data: {
          id_user: result.id_user,
          id_barang: result.id_barang,
          qty: result.qty,
          borrow_date: result.borrow_date.toISOString().split("T")[0], // Format tanggal (YYYY-MM-DD)
          return_date: result.return_date.toISOString().split("T")[0], // Format tanggal (YYYY-MM-DD)
          status: result.status,
        },
      });
    } catch (error) {
      console.log(error);
      res.json({
        msg: error,
      });
    }
  } else {
    res.json({ msg: "user dan barang belum ada" });
  }
};
export const pengembalianBarang = async (req, res) => {
  const { borrow_id, return_date } = req.body;

  const formattedReturnDate = new Date(return_date).toISOString();

  // Cek apakah data peminjaman ada
  const cekBorrow = await prisma.peminjaman.findUnique({
    where: { id_peminjaman: Number(borrow_id) },
  });

  if (!cekBorrow) {
    // Jika tidak ditemukan, kembalikan respon error
    return res.status(404).json({
      success: false,
      message: `Peminjaman dengan ID ${borrow_id} tidak ditemukan`,
    });
  }

  // Lanjutkan jika peminjaman ditemukan
  if (cekBorrow.status === "dipinjam") {
    try {
      const result = await prisma.peminjaman.update({
        where: {
          id_peminjaman: borrow_id,
        },
        data: {
          return_date: formattedReturnDate,
          status: "kembali",
        },
      });

      if (result) {
        const item = await prisma.barang.findUnique({
          where: { id_barang: Number(cekBorrow.id_barang) },
        });

        if (!item) {
          throw new Error(
            `Barang dengan id_barang ${cekBorrow.id_barang} tidak ditemukan`
          );
        } else {
          const restoreQty = cekBorrow.qty + item.quantity;
          await prisma.barang.update({
            where: {
              id_barang: Number(cekBorrow.id_barang),
            },
            data: {
              quantity: restoreQty,
            },
          });
        }
      }

      res.status(201).json({
        success: true,
        message: "Pengembalian Berhasil Dicatat",
        data: {
          id_peminjaman: result.id_peminjaman,
          id_user: result.id_user,
          id_barang: result.id_barang,
          qty: result.qty,
          return_date: result.return_date.toISOString().split("T")[0], // Format tanggal (YYYY-MM-DD)
          status: result.status,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat mencatat pengembalian barang",
        error: error.message,
      });
    }
  } else {
    res.status(400).json({
      success: false,
      message: "Barang sudah dikembalikan atau status tidak valid",
    });
  }
};

export const UsageReport = async (req, res) => {
  const { start_date, end_date, category, location, group_by } = req.body;

  const formattedStartDate = new Date(start_date).toISOString();
  const formattedEndDate = new Date(end_date).toISOString();

  try {
    const items = await prisma.barang.findMany({
      where: {
        OR: [
          { category: { contains: category || "" } },
          { location: { contains: location || "" } },
        ],
      },
    });

    if (items.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No items found for the given filters.",
      });
    }
    const borrowRecords = await prisma.peminjaman.findMany({
      where: {
        borrow_date: { gte: formattedStartDate },
        return_date: { lte: formattedEndDate },
      },
    });

    const analysis = items.map((item) => {
      const relevantBorrows = borrowRecords.filter(
        (record) => record.id_barang === item.id_barang
      );

      const totalBorrowed = relevantBorrows.reduce(
        (sum, record) => sum + record.qty,
        0
      );

      const totalReturned = relevantBorrows.reduce(
        (sum, record) => (record.status === "kembali" ? sum + record.qty : sum),
        0
      );

      return {
       group: group_by === 'category' ? item.category : item.location,
        total_borrowed: totalBorrowed,
        total_returned: totalReturned,
        items_in_use: totalBorrowed - totalReturned,
      };
    });

    res.status(200).json({
      status: "success",
      data: {
        analysis_period: {
          start_date: start_date,
          end_date: end_date,
        },
        usage_analysis: analysis,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while processing the usage report.",
      error: error.message,
    });
  }
};