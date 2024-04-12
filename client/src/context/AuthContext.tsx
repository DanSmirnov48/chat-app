import {
    Dispatch,
    ReactNode,
    SetStateAction,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { IUser } from "@/types";
import { useGetUserSession } from "@/lib/react-query/queries/auth";

interface AuthResponse {
    status: number;
    statusText: string;
    data?: {
        data: {
            user: IUser;
            accessToke: string;
        }
        status: string
    };
}

export const INITIAL_USER: IUser = {
    id: '',
    name: '',
    email: '',
    createdAt: '',
    updatedAt: '',
    bio: '',
    image: {
        key: '',
        name: '',
        url: '',
    },
};

const INITIAL_STATE = {
    user: INITIAL_USER,
    isLoading: false,
    isAuthenticated: false,
    setUser: () => { },
    setIsAuthenticated: () => { },
    checkAuthUser: async () => false as boolean,
};

interface IContextType {
    user: IUser;
    isLoading: boolean;
    setUser: Dispatch<SetStateAction<IUser>>;
    isAuthenticated: boolean;
    setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
    checkAuthUser: () => Promise<boolean>;
};

const AuthContext = createContext<IContextType>(INITIAL_STATE);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<IUser>(INITIAL_USER);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { mutateAsync: getSession, isPending: validating } = useGetUserSession()

    const checkAuthUser = async () => {
        setIsLoading(true);

        try {
            const session: AuthResponse | undefined = await getSession();
            if (session === undefined) {
                return false;
            }
            const { data, status } = session;
            if (data && status === 200 && !validating) {
                setUser({
                    id: data.data.user.id,
                    name: data.data.user.name,
                    email: data.data.user.email,
                    createdAt: data.data.user.createdAt,
                    updatedAt: data.data.user.updatedAt,
                    bio: data.data.user.bio,
                    image: data.data.user.image,
                })
                setIsAuthenticated(true);
                return true;
            } else {
                console.log(data, status)
                return false;
            }
        } catch (error: any) {
            if (error.response.status === 401 && error.response.statusText === 'Unauthorized') {
                console.log('Unauthorized')
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuthUser();
    }, []);

    const value: IContextType = {
        user,
        setUser,
        isLoading,
        isAuthenticated,
        setIsAuthenticated,
        checkAuthUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useUserContext = () => useContext(AuthContext);