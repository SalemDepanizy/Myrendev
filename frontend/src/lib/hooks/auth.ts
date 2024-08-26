import { fetcher } from "../../axios";
import { User } from "src/components/auth/protect";
import useSWR, { mutate } from "swr";
import { cachedUser, tokenAtom } from "../atoms/auth";
import { atom, useAtom } from "imugi";

export function useAuth() {
	const { data, isLoading, error } = useSWR("/auth/me", async (url) => {
		const cache = cachedUser.get();
		if (cache) return cache;
		const user = (await fetcher.get(url)).data as User;
		cachedUser.set(user);
		return user;
	});

	const logout = () => {
		cachedUser.set(null);
		tokenAtom.update(null);
		window.location.href = "/";
	};

	return {
		user: data,
		isLoading,
		error,
		logout,
	};
}
