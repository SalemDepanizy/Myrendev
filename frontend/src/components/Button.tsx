import React from "react";
import { cn } from "../utils";

function Button({
	children,
	className,
	useStyle = true,
	...rest
}: {
	children: React.ReactNode;
	useStyle?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			{...rest}
			className={cn(
				"text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-4 py-2.5 text-center me-2",
				useStyle && className
			)}
		>
			{children}
		</button>
	);
}

export default Button;
