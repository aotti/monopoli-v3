import { createContext } from "react";
import { IMiscContext } from "../helper/types";

export const MiscContext = createContext<IMiscContext>({
    language: null,
    setLanguage: () => null
})