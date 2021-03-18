import { createContext } from 'react';

const initialState: any = {
   user: null,
   setUser: null
}
export const AuthContext = createContext(initialState);