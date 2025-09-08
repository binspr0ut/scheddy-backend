import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

const getCaddyFee = async (req, res) => {


    try{
        console.log("P MASUK TRY BANG")

        const groupBesar = []
        const caddyTiapGrupSamaFeeNya = []

        const data = {
               
        }

        res.status(200).json({
            message: "GET CADDY FEE DONE BANG",
            data: "MANTAP"
        })
    } catch (error) {
        console.log("ADA ERROR BANG DI CATCH : " + error)
        res.status(500).json({
            message: "ADA ERROR BANG DI CATCH",
            error: error.message
        })
    }

}

export default getCaddyFee