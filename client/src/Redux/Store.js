import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./Reducer";


import logger from 'redux-logger'

export default configureStore({
 reducer: {
  user: userSlice,
  middleware: [ logger]
 },
});