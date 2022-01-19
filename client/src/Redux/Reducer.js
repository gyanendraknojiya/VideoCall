import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  loading: false,
  error: false,
  userName: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserName: (state, action) => {
      state.userName = action.payload;
    },
  },
});

export const { setUserName } = userSlice.actions;
export default userSlice.reducer;
