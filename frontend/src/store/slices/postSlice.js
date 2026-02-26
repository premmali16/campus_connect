import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchPosts = createAsyncThunk(
    'posts/fetchPosts',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { data } = await API.get('/posts', { params });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
        }
    }
);

export const fetchTrendingPosts = createAsyncThunk(
    'posts/fetchTrending',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await API.get('/posts/trending');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch trending');
        }
    }
);

const postSlice = createSlice({
    name: 'posts',
    initialState: {
        posts: [],
        trending: [],
        loading: false,
        error: null,
        pagination: null,
    },
    reducers: {
        clearPosts: (state) => {
            state.posts = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPosts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchTrendingPosts.fulfilled, (state, action) => {
                state.trending = action.payload.data;
            });
    },
});

export const { clearPosts } = postSlice.actions;
export default postSlice.reducer;
