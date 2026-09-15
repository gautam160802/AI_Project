import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";
import { getApiErrorMessage } from "../../../lib/api";

export const useAuth = () => {
    const context = useContext(AuthContext);
    const { user, setUser, loading, setLoading } = context;

    const handleLogin = async ({ email, password }) => {
        setLoading(true);
        try {
            const data = await login({ email, password });
            setUser(data.user);
            return data.user;
        } catch (err) {
            throw new Error(getApiErrorMessage(err, "Login failed"));
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async ({ email, username, password }) => {
        setLoading(true);
        try {
            const data = await register({ email, username, password });
            setUser(data.user);
            return data.user;
        } catch (err) {
            throw new Error(getApiErrorMessage(err, "Registration failed"));
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logout();
            setUser(null);
        } catch (err) {
            throw new Error(getApiErrorMessage(err, "Logout failed"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const getAndSetUser = async () => {
            try {
                const data = await getMe();
                setUser(data.user);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        getAndSetUser();
    }, [setUser, setLoading]);

    return { user, loading, handleLogin, handleRegister, handleLogout };
};
