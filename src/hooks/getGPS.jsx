/* eslint-disable react/prop-types */
import axios from "axios";
import { format, subMinutes } from "date-fns";
import { createContext, useEffect, useState } from "react";

export const GPSContext = createContext()

export function GPSProvider({ children }) {
    const [realtimeBrt, setRealtimeBrt] = useState([])
    const [realtimeSPPO, setRealtimeSPPO] = useState([])

    let allBuses = [];

    async function getGPS() {
        await axios.get('https://dados.mobilidade.rio/gps/brt').then(({ data }) => {
            data.veiculos.forEach((item) => {
                allBuses.push(item);
            });
            setRealtimeBrt([...allBuses]);
            allBuses = [];
        });
    }
    let allSPPO = []
    async function getSPPO(){
        const start = 33082;
        const end = 33181;

        const seq = [];

        for (let i = start; i <= end; i++) {
            seq.push(`D${i}`);
        }


        const currentDate = new Date();

        const fiveMinutesAgo = subMinutes(currentDate, 5);

        const formattedDataInicial = format(fiveMinutesAgo, "yyyy-MM-dd+HH:mm:ss");
        const formattedDataFinal = format(currentDate, "yyyy-MM-dd+HH:mm:ss");

        await axios.get(`https://dados.mobilidade.rio/gps/sppo?&dataInicial=${formattedDataInicial}&dataFinal=${formattedDataFinal}`)
            .then((response) => {
                allSPPO = response.data.filter(item => 
                    seq.includes(item.ordem))
                setRealtimeSPPO([...allSPPO]);
                allSPPO = [];
                })

            }
    function getGPSAndSPPO() {
        // getGPS()
        getSPPO()
    }

   
    useEffect(() => {
       getGPSAndSPPO()

        const interval = setInterval(getGPSAndSPPO, 60000);

        return () => clearInterval(interval);
    }, []);

    return (
        <GPSContext.Provider value={{ realtimeBrt, getGPS, realtimeSPPO }}>
            {children}
        </GPSContext.Provider>
    )
}
