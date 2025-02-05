import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import logger from "morgan"
import { checkAndUpdate, checkBlockExplorer} from "./helpers/FluxPayment"
const app = express();
const server = createServer(app);
import { createTx, getTx, alterStatus} from "./database/db";

const io = new Server(server, {
    cors: {
      origin: process.env.URL || "http://localhost:3000 " , // Cambia esto según la URL de tu frontend
      methods: ["GET", "POST"],
    },
  });

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on("message", async (data) => {
        try {
            console.log(data.transactionId);
            

            const responseCheck  = await checkBlockExplorer(data.transactionId, data.amount)
           
            if(typeof responseCheck === "string"){
                socket.emit("transactionResponse", responseCheck);
            }else{
                socket.emit("transactionResponse", responseCheck);
                const {txMessage, txValue, txId} = responseCheck
                
                await createTx(txMessage, txValue, txId, data.zelid)

                const transactionData = await getTx(data.zelid)
                socket.emit("transactionData", transactionData);
            }
            const responseUpdate = await checkAndUpdate(data.transactionId, data.amount);
            if(typeof responseUpdate === "string"){
                console.log("couldn't update transaction");
            }else{
                const id = responseUpdate.txMessage 
                await alterStatus(id)
            }
        } catch (error) {
            console.error("Error en checkTransaction:", error);
            socket.emit("transactionError", { error: "Error en la transacción" });
        }
    });
    socket.on("requestTransactionHistory", async (zelid) => {
        try {
            const transactionData = await getTx(zelid);
            socket.emit("transactionData", Array.isArray(transactionData) && transactionData.length > 0 ? transactionData : []);
        } catch (error) {
            console.error("Error fetching transaction history:", error);
            socket.emit("transactionError", { error: "Error al obtener el historial de transacciones" });
        }
    });

    socket.on("disconnect", () => {
        console.log("Disconnected");
    })
});

app.use(logger("dev"))

app.get('/tx', async(req, res) => {
    const response = await getTx("ede4e61cb2656d01c7a119b8c9df5451707ab0773a88d0ff0b13b045a270e94b")
    console.log(response);
});


server.listen(3001, () => {
    console.log('server running at http://localhost:3001');
});