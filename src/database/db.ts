import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config()


const pool = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "fluxpay"
}).promise()

export async function getTx(zelid:string){
    const [rows] = await pool.query("SELECT * FROM txs WHERE zelid= ?", [zelid])
    console.log(rows);
    return rows
}

// export async function updatetx(){
//     await pool.query("ALTER TABLE tx ADD COLUMN estado VARCHAR(10) NOT NULL DEFAULT 'Pending'");

// }
export async function alterStatus(id:string){
    const result = await pool.query(`
        UPDATE txs 
        SET estado = 'Completed' 
        WHERE id = ? AND estado = 'Pending'
    `, [id]);
    console.log(result);
}

export async function createTx(id:string, amount: string, txId: string, zelid: string){
   const result = await pool.query(`
        INSERT INTO txs (id, amount, txId, zelid)
         VALUE(?, ?, ?, ?)
         `, [id, amount, txId, zelid])
    console.log(result);
}