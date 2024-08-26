import { cn } from "../../utils";
import { toast } from "./use-toast";
import React from "react";
export const styledToast = ({
	title,
	icon,
	className,
	color,
	description,
	time,
}: {
	title: string;
	icon?: React.ReactNode;
	color?: string;
	className?: string;
	description?: string;
	time?: number;
}) => {
	const notif = toast({
		action: (
			<div
				role="alert"
				className={cn(
					"rounded-xl w-full flex items-center p-3",
					className
				)}
			>
				<div className="flex items-center gap-4">
					<span className={cn("text-green-600", color)}>
						{icon ?? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								className="h-6 w-6"
							>
								<path
									strokeLinecap="round"
									stroke-linejoin="round"
									d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						)}
					</span>

					<div className="flex-1">
						<strong className="block font-medium">{title}</strong>
						<p className="mt-1 text-sm opacity-60">{description}</p>
					</div>
				</div>
			</div>
		),
	});
	setTimeout(() => {
		notif.dismiss();
	}, time ?? 1000);
};
