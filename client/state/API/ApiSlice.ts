import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { RootState } from "../store";

interface ApiState {
    registerResponse: RegisterResponse;
    loginResponse: LoginResponse;
    Property: Property[];
    loading: boolean;
    error: string | null;
    user: User | null;
    initialized?: boolean;
    ownerMeta: {totalItems: number; page: number; totalPages: number;}
}

interface RegisterResponse {
    message: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    error?: string;
}

interface LoginResponse {
    token?: string;
    message?: string;
    error?: string;
    access_token?: string;
    role?: "user" | "owner" | "admin";
}

export interface Property {
    id: number;
    title: string;
    description: string;
    price: number;
    imageUrl: string[];
    status: string;
    location: string;
    role?: number;
    createdAt: string;
    _count: {
        favorites?: number;
    };
    likedByMe: boolean;
    owner: {id: number, name: string, email: string};
}

export interface PaginatedPropertyResponse {
    data: Property[];
    totalPages: number;
    page: number;
    totalItems: number;
}



export interface User {
    UserId: string;
    name: string;
    email: string;
    phone?: number;
    role?: "user" | "owner" | "admin";
}

const initialState: ApiState = {
    registerResponse: {
        message: "",
        user: { id: "", name: "", email: "" },
        error: "",
    },
    loginResponse: { token: "", message: "", error: "" },
    Property: [],
    loading: false,
    error: null,
    user: null,
    initialized: false,
    ownerMeta: {totalItems: 0, page: 0, totalPages: 0}

};


export const loginAsync = createAsyncThunk<
    LoginResponse,
    object,
    { rejectValue: string; dispatch: any }
>("loginAsync", async (data, { rejectWithValue, dispatch }) => {
    try {
        const loginResponse = await api.post("/auth/login", data, { withCredentials: true });
        dispatch(protectedRouteAsync());
        return loginResponse.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Login failed");
    }
});

export const logoutAsync = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("logoutAsync", async (_, { rejectWithValue, dispatch }) => {
  try {
    await api.post("/auth/logout", { withCredentials: true });
    dispatch(clearUser()); // clear user immediately
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Logout failed");
  }
});

export const registerAsync = createAsyncThunk<
    RegisterResponse,
    object,
    { rejectValue: string }
>("registerAsync", async (data, { rejectWithValue }) => {
    try {
        const registerResponse = await api.post("/auth/register", data, { withCredentials: true });
        return registerResponse.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Register failed");
    }
});

// Protected route: ensures cookie is sent and returns user object
export const protectedRouteAsync = createAsyncThunk<
    User,
    void,
    { rejectValue: string }
>("protectedRouteAsync", async (_, { rejectWithValue }) => {
    try {
        const response = await api.get("/auth/protected", { withCredentials: true });
        return response.data as User;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to access protected route");
    }
},
{
    condition: (_, { getState }) => {
        const { user, loading } = (getState() as RootState).api;
        // Skip if already initialized or currently loading
        return !user && !loading;
    },
});



export const getAllPublishedProperty = createAsyncThunk<
    PaginatedPropertyResponse,
    {page?: number},
    { rejectValue: string }
>("getAllPublishedProperty", async ({page = 1}, { rejectWithValue }) => {
    try {
        const response = await api.get("/property/published", { params: { page }, withCredentials: true });
        return response.data;
    } catch (error: any) {

        return rejectWithValue(error.response?.data?.message || "Failed to get Properties");
    }
});

export const getAllProperties = createAsyncThunk<
    PaginatedPropertyResponse,
    {page?: number},
    { rejectValue: string }
>("getAllProperties", async ({page = 1}, { rejectWithValue }) => {
    try {
        const response = await api.get("/property", { params: { page }, withCredentials: true });
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to get owner properties");
    }
});

export const addPropertyAsync = createAsyncThunk<
    Property,
    object,
    { rejectValue: string }
>("addPropertyAsync", async (data, { rejectWithValue }) => {
    try {
        const response = await api.post("/property", data,
             { withCredentials: true });
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Add product failed");
    }
});

export const editPropertyAsync = createAsyncThunk<
    Property,
    {formData: FormData, id: number},
    { rejectValue: string }
>("editPropertyAsync", async (data, { rejectWithValue }) => {
    try {
        const response = await api.patch(`/property/update/${data.id}`, data.formData,
             { withCredentials: true });
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Edit property failed");
    }
});

export const deletePropertyAsync = createAsyncThunk<
    {id: number},
    {id: number},
    { rejectValue: string }
>("deletePropertyAsync", async (data, { rejectWithValue }) => {
    try {
        const response = await api.delete(`/property/delete/${data.id}`,
             { withCredentials: true });
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Delete property failed");
    }
});

export const getOwnerProperties = createAsyncThunk<
    PaginatedPropertyResponse,
    {page?: number},
    { rejectValue: string }
>("getOwnerProperties", async ({page = 1}, { rejectWithValue }) => {
    try {
        const response = await api.get("/property/owner", { params: { page }, withCredentials: true });
        
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to get owner properties");
    }
});




export const updatePropertyStatusAsync = createAsyncThunk<
    {propertyId: number; status: string},
    {propertyId: number; status: string},
    { rejectValue: string }
>("updatePropertyStatusAsync", async (data, { rejectWithValue }) => {
    try {
        await api.put(`/property/updateStatus/${data.propertyId}`, { status: data.status }, { withCredentials: true });
        return { propertyId: data.propertyId, status: data.status };
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to update property status");
    }
});

export const likePropertyAsync = createAsyncThunk<
    {propertyId: number},
    {propertyId: number},
    { rejectValue: string }
>("likePropertyAsync", async (data, { rejectWithValue }) => {
    try {
        await api.put(`/property/like/${data.propertyId}`,  { withCredentials: true });
        return { propertyId: data.propertyId };
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to update property status");
    }
});

const ApiSlice = createSlice({
    name: "api",
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<User>) {
            state.user = action.payload;
        },
        clearUser(state) {
            state.user = null;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // login
            .addCase(loginAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.loginResponse = action.payload;
            })
            .addCase(loginAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message || "something went wrong";
            })

            .addCase(logoutAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutAsync.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.initialized = true;
                
            })
            .addCase(logoutAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message || "something went wrong";
            })

            // register
            .addCase(registerAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.registerResponse = action.payload;
            })
            .addCase(registerAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message || "something went wrong";
            })

            // protected route -> set user
            .addCase(protectedRouteAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(protectedRouteAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.initialized = true;
            })
            .addCase(protectedRouteAsync.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.error = action.payload || action.error.message || "something went wrong";
                state.initialized = true;
            })

            // products
            .addCase(getAllPublishedProperty.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllPublishedProperty.fulfilled, (state, action) => {
                state.loading = false;
                state.Property = action.payload.data;
                state.ownerMeta = {totalItems: action.payload.totalItems, page: action.payload.page, totalPages: action.payload.totalPages};
            })
            .addCase(getAllPublishedProperty.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message || "something went wrong";
            })

            // get all properties
            .addCase(getAllProperties.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllProperties.fulfilled, (state, action) => {
                state.loading = false;
                state.Property = action.payload.data;
                state.ownerMeta = {totalItems: action.payload.totalItems, page: action.payload.page, totalPages: action.payload.totalPages};
                
            })
            .addCase(getAllProperties.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message || "something went wrong";
            })

            // add product
            .addCase(addPropertyAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addPropertyAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.Property.push(action.payload);               
            })
            .addCase(addPropertyAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message || "something went wrong";
            })

            //edit product
            .addCase(editPropertyAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(editPropertyAsync.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload;
                state.Property = state.Property.map(p => p.id === updated.id ? updated : p);
            })
            .addCase(editPropertyAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message || "something went wrong";
            })

            // delete product 
            .addCase(deletePropertyAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletePropertyAsync.fulfilled, (state, action) => {
                state.loading = false;
                const { id } = action.payload;
                state.Property = state.Property.map(property =>
                    property.id === id ? { ...property, status: "archived" } : property);
            })
            .addCase(deletePropertyAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message || "something went wrong";
            })

            // get owner properties
            .addCase(getOwnerProperties.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOwnerProperties.fulfilled, (state, action) => {
                state.loading = false;
                state.Property = action.payload.data;
                state.ownerMeta = {totalItems: action.payload.totalItems, page: action.payload.page, totalPages: action.payload.totalPages};
                
            })
            .addCase(getOwnerProperties.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message || "something went wrong";
            })

            // update property status
            .addCase(updatePropertyStatusAsync.pending, (state) =>{
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePropertyStatusAsync.fulfilled, (state, action) =>{
                state.loading = false;
                const { propertyId, status } = action.payload;
                state.Property = state.Property.map(property =>
                    property.id === propertyId ? { ...property, status: status } : property);
                
            })
            .addCase(updatePropertyStatusAsync.rejected, (state, action) =>{
                state.loading = false;
                state.error = action.payload || action.error.message || "something went wrong";
            })

            // like property
            .addCase(likePropertyAsync.pending, (state) =>{
                state.loading = true;
                state.error = null;
            })
            .addCase(likePropertyAsync.fulfilled, (state, action) =>{
                state.loading = false;
                const { propertyId } = action.payload;
                state.Property = state.Property.map((property) => {
                    if (property.id !== propertyId) return property;

                    const toggled = !property.likedByMe;
                    const current = property._count?.favorites ?? 0;
                    const favorites = toggled ? current + 1 : Math.max(0, current - 1);

                const data = {
                    ...property,
                    likedByMe: toggled,
                    _count: { ...property._count, favorites },
                }
                console.log( data);
                return data;
            });
            })
            .addCase(likePropertyAsync.rejected, (state, action) =>{
                state.loading = false;
                state.error = action.payload || action.error.message || "something went wrong";
            });
    },
});

export const { setUser, clearUser, clearError } = ApiSlice.actions;
export default ApiSlice.reducer;

// selector helper (use in components to read user)
export const selectUser = (state: any) => state.api.user;
export const selectIsAuthenticated = (state: any) => !!state.api.user;
