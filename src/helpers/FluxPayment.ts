import dotenv from "dotenv"
import axios from "axios";


interface SuccessResponse {
  status: number;
  txMessage: string;
  txValue: string;
  txId: any;
  confirmations: number; // Especifica que confirmations es de tipo number
}



dotenv.config();


export const checkAndUpdate = async (id: string, valuetoCheck: string) => {
  const maxAttempts = 25; // Define el número máximo de intentos
  const pollingInterval = 20000; // Intervalo entre intentos en milisegundos
  let attempts = 0;

  const check = async (): Promise<SuccessResponse | string> => {
    const responseRaw = await checkTransaction(id, valuetoCheck);
    const response = responseRaw as SuccessResponse;
    console.log(response);

    if (response && response.confirmations >= 1) {
      return response;
    }

    attempts++;
    if (attempts >= maxAttempts) {
      return "Timeout, transaction not found";
    }

    // Espera el intervalo antes de intentar nuevamente
    await new Promise((resolve) => setTimeout(resolve, pollingInterval));
    return check(); // Llama recursivamente
  };
  try {
    return await check(); // Ejecuta la función recursiva y espera su resultado
  } catch (error) {
    console.error("Error en checkAndUpdate:", error);
    throw error;
  }
};
export const checkBlockExplorer = async (id: string, valuetoCheck: string) => {
  const maxAttempts = 10; // Define el número máximo de intentos
  const pollingInterval = 10000; // Intervalo entre intentos en milisegundos
  let attempts = 0;

  const check = async (): Promise<SuccessResponse | string> => {
    const responseRaw = await checkTransaction(id, valuetoCheck);
    const response = responseRaw as SuccessResponse;
    console.log(response);

    if (response && response.confirmations === 0) {
      return response;
    }
    // if (response && response.confirmations === 0) {
    //   return response;
    // }


    attempts++;
    if (attempts >= maxAttempts) {
      return "Timeout, transaction not found";
    }

    // Espera el intervalo antes de intentar nuevamente
    await new Promise((resolve) => setTimeout(resolve, pollingInterval));
    return check(); // Llama recursivamente
  };

  try {
    return await check(); // Ejecuta la función recursiva y espera su resultado
  } catch (error) {
    console.error("Error en checkAndUpdate:", error);
    throw error;
  }
};



export const checkTransaction = async (id: string, valuetoCheck: string): Promise<SuccessResponse | string> => {

  try {

    const response = await axios.get(`https://explorer.runonflux.io/api/txs?address=t3ZDschNfmy78dNzEiBNBc1xB1GdGsuwu14&pageNum=0`);
    const txArray = response.data.txs;

    const txValue = parseInt(valuetoCheck, 10);
    const txValueClient = txValue.toString()



    for (let pepe = 0; pepe < txArray.length; pepe++) {
      const element = txArray[pepe]
      const voutLength = element.vout


      for (let index = 0; index < voutLength.length; index++) {
        const vout = voutLength[index];
        const asm = vout.scriptPubKey.asm

        if (asm.trim().includes("OP_RETURN ")) {
          const decodedValue = asm.replace("OP_RETURN ", "").trim();
          const idValue = Buffer.from(decodedValue, 'hex').toString();

          if (idValue === id) {
            const voutValue = txArray[pepe].vout[0].value
            const intValueExplorer = parseInt(voutValue, 10);
            const refinedValue = intValueExplorer.toString()
            const txValueExplorer = refinedValue.toString()
            if (txValueExplorer === txValueClient) {
              const response: SuccessResponse = {
                status: 200,
                txMessage: id,
                txValue: txValueClient,
                txId: element.txid,
                confirmations: element.confirmations
              }
              return response
            }
          }
        }
      }
   
    }
    return "Transaction not found"
  }catch (error) {
    console.error("Error en checkAndUpdate:", error);
    return "Error fetching transaction, please contact a team member";
  }
}




