'use client';
import { createContext } from "react";

const playerId = createContext('-1');


export default function PlayerContextProviders({
  children,
} : {
  children: React.ReactNode;
}){



  return (
    <>
      {children}
    </>
  );
}