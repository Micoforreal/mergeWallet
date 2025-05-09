import {  createContext, useEffect, useState } from "react";





export const WalletContext = createContext({});



export const WalletContextProvider = ({children})=>{
  
      const [walletData, setWalletData]= useState([])




    
    return(
        
        <WalletContext.Provider value={{walletData, setWalletData}}>
    
            {children}
        </WalletContext.Provider>
        
        )

}